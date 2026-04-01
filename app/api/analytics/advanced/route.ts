/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { db } from "@/lib/db/turso";
import { customers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { predictChurnBatch } from "@/lib/ai/churn-predictor";
import { computeCohortHealth } from "@/lib/ai/health-score";
import { detectAnomalies } from "@/lib/ai/anomaly-detection";
import { clusterCustomers, computeRFMScores } from "@/lib/ai/segmentation";
import { logger } from "@/lib/observability/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  return logger.withTrace(async () => {
    try {
      const user = await requireAuth();
      const startTime = Date.now();

      const allCustomers = await db
        .select()
        .from(customers)
        .where(eq(customers.userId, user.id))
        .all();

      if (allCustomers.length === 0) {
        return NextResponse.json({
          churnPredictions: { predictions: [], aggregates: null },
          healthScores: { scores: [], distribution: null },
          anomalies: { anomalies: [], summary: null },
          segmentation: [],
          rfmAnalysis: [],
        });
      }

      const customerNameMap: Record<string, string> = {};
      allCustomers.forEach((c) => { customerNameMap[c.id] = c.name; });

      const [churnResults, healthResults, anomalyReport, segments, rfmScores] = await Promise.all([
        Promise.resolve(predictChurnBatch(allCustomers)),
        Promise.resolve(computeCohortHealth(allCustomers)),
        Promise.resolve(detectAnomalies(allCustomers)),
        Promise.resolve(clusterCustomers(allCustomers)),
        Promise.resolve(computeRFMScores(allCustomers)),
      ]);

      const enrichedPredictions = churnResults.predictions.slice(0, 50).map((p) => ({
        ...p,
        customerName: customerNameMap[p.customerId] || "Unknown",
        score: p.churnScore,
      }));

      const enrichedAnomalies = anomalyReport.anomalies?.map((a: any) => ({
        ...a,
        customerName: customerNameMap[a.customerId] || "Unknown",
      })) || [];

      const processingTimeMs = Date.now() - startTime;
      logger.info("Advanced analytics computed", {
        customerCount: allCustomers.length,
        anomalyCount: anomalyReport.summary.totalAnomalies,
        segmentCount: segments.length,
        processingTimeMs,
      });

      return NextResponse.json({
        churnPredictions: {
          predictions: enrichedPredictions,
          ...churnResults.aggregates,
        },
        healthData: {
          scores: healthResults.scores.slice(0, 50),
          distribution: healthResults.distribution,
          avgScore: healthResults.avgScore,
          alertCount: healthResults.alertCount,
        },
        anomalyData: {
          anomalies: enrichedAnomalies,
          ...anomalyReport.summary,
        },
        segmentData: segments,
        rfmAnalysis: rfmScores.slice(0, 50),
        meta: {
          totalCustomers: allCustomers.length,
          processingTimeMs,
          computedAt: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      logger.error("Advanced analytics API error", { error: error.message });
      return NextResponse.json(
        { error: error.message || "Failed to compute advanced analytics" },
        { status: error.message?.includes("Unauthorized") ? 401 : 500 }
      );
    }
  });
}
