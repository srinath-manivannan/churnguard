/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { startAutoSync } from "@/lib/jobs/looker-sync";

let syncInitialized = false;

export async function GET() {
  try {
    // Initialize sync only once
    if (!syncInitialized) {
      console.log("🔄 Initializing Looker Studio auto-sync...");
      
      // Start background sync job
      startAutoSync().catch((error) => {
        console.error("Auto-sync error:", error);
      });
      
      syncInitialized = true;
    }

    return NextResponse.json({
      success: true,
      status: "running",
      message: "Looker Studio auto-sync is active",
    });
  } catch (error: any) {
    console.error("Cron initialization error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}