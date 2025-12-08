/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================
// IMAGE UPLOAD API
// POST /api/images/upload - store image (if you need it)
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    // If you send form-data / binary, change this accordingly.
    const body = await request.json();
    const { imageData, mimeType, filename } = body;

    if (!imageData || !mimeType) {
      return NextResponse.json(
        { error: "Image data and mime type are required" },
        { status: 400 }
      );
    }

    // TODO: put your upload logic here
    // e.g. upload to S3 / R2 / Drive or save in DB

    return NextResponse.json({
      success: true,
      message: "Image uploaded",
      filename: filename ?? null,
      userId: user.id,
    });
  } catch (error: any) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}
