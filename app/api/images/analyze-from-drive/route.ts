// /* eslint-disable @typescript-eslint/no-explicit-any */
// // app/api/images/analyze-from-drive/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { downloadDriveImage } from "@/lib/google/drive";
// import { analyzeImage } from "@/lib/ai/gemini";

// export async function POST(request: NextRequest) {
//   const cookie = request.cookies.get("google_tokens")?.value;
//   if (!cookie) {
//     return NextResponse.json({ error: "Not connected to Google Drive" }, { status: 401 });
//   }

//   const { fileId, mimeType } = await request.json();
//   if (!fileId || !mimeType) {
//     return NextResponse.json({ error: "fileId and mimeType required" }, { status: 400 });
//   }

//   try {
//     const tokens = JSON.parse(cookie);
//     const base64Data = await downloadDriveImage(tokens, fileId);
//     const analysis = await analyzeImage(base64Data, mimeType);
//     return NextResponse.json({ analysis });
//   } catch (err: any) {
//     console.error("Analyze Drive image error:", err);
//     return NextResponse.json(
//       { error: err.message || "Failed to analyze Drive image" },
//       { status: 500 }
//     );
//   }
// }
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { getUserDriveToken } from "@/lib/google/drive";
import { analyzeImage } from "@/lib/ai/openai";
// import { analyzeImage } from "@/lib/ai/gemini";
// import { analyzeImage } from "@/lib/ai/openai";

export async function POST(req: NextRequest) {
  const user = await requireAuth();
  const body = await req.json();
  const { fileId, mimeType } = body;

  if (!fileId) {
    return NextResponse.json(
      { error: "fileId is required" },
      { status: 400 }
    );
  }

  const accessToken = await getUserDriveToken(user.id);
  if (!accessToken) {
    return NextResponse.json(
      { error: "Google Drive not connected" },
      { status: 401 }
    );
  }

  try {
    // Download image bytes from Drive
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("Drive download error:", res.status, text);
      return NextResponse.json(
        { error: "Failed to download image from Drive" },
        { status: 500 }
      );
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");

    const analysis = await analyzeImage(
      base64Data,
      mimeType || "image/jpeg"
    );

    return NextResponse.json({ success: true, analysis });
  } catch (e: any) {
    console.error("Analyze-from-drive error:", e);
    return NextResponse.json(
      { error: e.message || "Failed to analyze Drive image" },
      { status: 500 }
    );
  }
}
