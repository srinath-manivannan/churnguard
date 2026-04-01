/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { db } from "@/lib/db/turso";
import { customers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { computeHealthScore, computeCohortHealth } from "@/lib/ai/health-score";
import { logger } from "@/lib/observability/logger";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const customerId = request.nextUrl.searchParams.get("customerId");

    const allCustomers = await db
      .select()
      .from(customers)
      .where(eq(customers.userId, user.id))
      .all();

    const avgRevenue = allCustomers.reduce((s, c) => s + (c.totalRevenue || 0), 0) / (allCustomers.length || 1);

    if (customerId) {
      const customer = allCustomers.find((c) => c.id === customerId);
      if (!customer) {
        return NextResponse.json({ error: "Customer not found" }, { status: 404 });
      }

      const healthScore = computeHealthScore(customer, { cohortAvgRevenue: avgRevenue });
      return NextResponse.json({ customerId, healthScore });
    }

    const cohortHealth = computeCohortHealth(allCustomers);
    logger.info("Cohort health scores computed", {
      avgScore: cohortHealth.avgScore,
      alertCount: cohortHealth.alertCount,
    });

    return NextResponse.json(cohortHealth);
  } catch (error: any) {
    logger.error("Health score API error", { error: error.message });
    return NextResponse.json(
      { error: error.message || "Failed to compute health scores" },
      { status: 500 }
    );
  }
}
