// app/api/images/upload/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.formData().catch(() => null);

    return NextResponse.json(
      {
        success: true,
        message: "Image upload API is working",
        received: body ? "file-data" : null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { success: true, message: "GET /api/images/upload working" },
    { status: 200 }
  );
}
