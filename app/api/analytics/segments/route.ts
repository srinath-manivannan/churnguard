/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { db } from "@/lib/db/turso";
import { customers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { clusterCustomers, computeRFMScores } from "@/lib/ai/segmentation";
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

    const segments = clusterCustomers(allCustomers);
    const rfmScores = computeRFMScores(allCustomers);

    logger.info("Segmentation computed", {
      segmentCount: segments.length,
      customerCount: allCustomers.length,
    });

    return NextResponse.json({ segments, rfmScores });
  } catch (error: any) {
    logger.error("Segmentation API error", { error: error.message });
    return NextResponse.json(
      { error: error.message || "Failed to compute segments" },
      { status: 500 }
    );
  }
}
