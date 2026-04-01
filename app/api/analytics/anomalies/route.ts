/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { db } from "@/lib/db/turso";
import { customers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { detectAnomalies } from "@/lib/ai/anomaly-detection";
import { logger } from "@/lib/observability/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireAuth();

    const allCustomers = await db
      .select()
      .from(customers)
      .where(eq(customers.userId, user.id))
      .all();

    const report = detectAnomalies(allCustomers);

    logger.info("Anomaly detection complete", {
      totalAnomalies: report.summary.totalAnomalies,
      criticalCount: report.summary.criticalCount,
    });

    return NextResponse.json(report);
  } catch (error: any) {
    logger.error("Anomaly detection API error", { error: error.message });
    return NextResponse.json(
      { error: error.message || "Failed to detect anomalies" },
      { status: 500 }
    );
  }
}
