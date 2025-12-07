import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    return NextResponse.json({
      success: true,
      message: "Personalization feature coming soon",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}