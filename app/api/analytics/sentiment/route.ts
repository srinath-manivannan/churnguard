/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { analyzeTextSentimentAI, analyzeTextSentimentLocal } from "@/lib/ai/sentiment";
import { logger } from "@/lib/observability/logger";

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const { text, useAI = false } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const result = useAI
      ? await analyzeTextSentimentAI(text)
      : analyzeTextSentimentLocal(text);

    logger.info("Sentiment analysis completed", {
      score: result.score,
      label: result.label,
      useAI,
    });

    return NextResponse.json({ success: true, sentiment: result });
  } catch (error: any) {
    logger.error("Sentiment API error", { error: error.message });
    return NextResponse.json(
      { error: error.message || "Sentiment analysis failed" },
      { status: 500 }
    );
  }
}
