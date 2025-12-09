/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================
// IMAGE ANALYSIS API
// POST /api/images/analyze - Analyze image with OpenAI Vision
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
// import { analyzeImage } from "@/lib/ai/openai";
import { analyzeImage } from "@/lib/ai/hybrid";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(); // keep auth
    const body = await request.json();

    const { imageData, mimeType, filename } = body;

    if (!imageData || !mimeType) {
      return NextResponse.json(
        { error: "Image data and mime type are required" },
        { status: 400 }
      );
    }

    // Analyze image with OpenAI Vision
    const analysis = await analyzeImage(imageData, mimeType);

    return NextResponse.json({
      success: true,
      analysis,
      filename: filename ?? null,
      userId: user.id,
    });
  } catch (error: any) {
    console.error("Image analysis error:", error);

    const status =
      typeof error?.status === "number" && error.status >= 400
        ? error.status
        : 500;

    const message = error?.message || "Failed to analyze image";

    return NextResponse.json({ error: message }, { status });
  }
}
