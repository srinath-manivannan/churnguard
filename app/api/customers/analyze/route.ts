/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { getCustomers, updateCustomerChurnScore } from "@/lib/db/queries";
import { predictChurnBatch } from "@/lib/ai/churn-predictor";
import { computeCohortHealth } from "@/lib/ai/health-score";
import { detectAnomalies } from "@/lib/ai/anomaly-detection";
import { logger } from "@/lib/observability/logger";

export async function POST(_request: NextRequest) {
  return logger.withTrace(async () => {
    try {
      const user = await requireAuth();
      const startTime = Date.now();

      const customers = await getCustomers(user.id);

      if (customers.length === 0) {
        return NextResponse.json(
          { error: "No customers to analyze" },
          { status: 400 }
        );
      }

      logger.info("Starting churn analysis", { customerCount: customers.length });

      // Run predictive churn engine
      const { predictions, aggregates } = predictChurnBatch(customers);

      // Compute health scores
      const healthResults = computeCohortHealth(customers);

      // Detect anomalies
      const anomalyReport = detectAnomalies(customers);

      // Update customer records with new churn scores
      const updatePromises = predictions.map((p) =>
        updateCustomerChurnScore(
          p.customerId,
          p.churnScore,
          p.riskLevel,
          p.riskFactors.map((f) => f.description)
        )
      );

      await Promise.all(updatePromises);

      const processingTimeMs = Date.now() - startTime;

      logger.info("Churn analysis complete", {
        totalAnalyzed: predictions.length,
        criticalCount: aggregates.criticalCount,
        processingTimeMs,
      });

      return NextResponse.json({
        success: true,
        message: "Advanced churn analysis completed",
        stats: {
          totalAnalyzed: predictions.length,
          highRiskCount: aggregates.criticalCount + aggregates.highCount,
          averageChurnScore: aggregates.avgChurnScore,
          totalRevenueAtRisk: aggregates.totalRevenueAtRisk,
          churnVelocity: aggregates.churnVelocity,
          avgHealthScore: healthResults.avgScore,
          anomaliesDetected: anomalyReport.summary.totalAnomalies,
          processingTimeMs,
        },
        predictions: predictions.slice(0, 20),
        healthDistribution: healthResults.distribution,
        anomalySummary: anomalyReport.summary,
      });
    } catch (error: any) {
      logger.error("Churn analysis error", { error: error.message });
      return NextResponse.json(
        { error: error.message || "Failed to analyze churn risk" },
        { status: error.message === "Unauthorized - Please sign in" ? 401 : 500 }
      );
    }
  });
}
