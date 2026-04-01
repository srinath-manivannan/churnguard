import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { getAIMetrics } from "@/lib/ai/orchestrator";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAuth();
    const metrics = getAIMetrics();
    return NextResponse.json(metrics);
  } catch {
    return NextResponse.json({ error: "Failed to fetch AI metrics" }, { status: 500 });
  }
}
