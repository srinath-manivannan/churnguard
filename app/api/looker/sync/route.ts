/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { exportToGoogleSheets } from "@/lib/jobs/looker-sync";

export async function POST() {
  try {
    const result = await exportToGoogleSheets();

    return NextResponse.json({
      message: "Data synced to Google Sheets",
      ...result,
    });
  } catch (error: any) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    lastSync: new Date().toISOString(),
    status: "active",
  });
}
