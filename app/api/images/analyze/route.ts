/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================
// IMAGE ANALYSIS API
// ============================================
// POST /api/images/analyze - Analyze image with Gemini Vision

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { analyzeImage } from "@/lib/ai/gemini";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const { imageData, mimeType, filename } = body;

    if (!imageData || !mimeType) {
      return NextResponse.json(
        { error: "Image data and mime type are required" },
        { status: 400 }
      );
    }

    // Analyze image with Gemini Vision
    const analysis = await analyzeImage(imageData, mimeType);

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error("Image analysis error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze image" },
      { status: 500 }
    );
  }
}