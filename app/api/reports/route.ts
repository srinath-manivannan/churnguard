// ============================================
// REPORTS API ROUTE
// ============================================
// GET /api/reports - Fetch all reports for the authenticated user

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { db } from "@/lib/db/turso";
import { reports } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();

    // Fetch all reports for this user, ordered by most recent first
    const userReports = await db
      .select()
      .from(reports)
      .where(eq(reports.userId, user.id))
      .orderBy(desc(reports.generatedAt));

    // Return reports
    return NextResponse.json({
      success: true,
      reports: userReports,
    });
  } catch (error: any) {
    console.error("Failed to fetch reports:", error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || "Failed to fetch reports" 
      },
      { status: 500 }
    );
  }
}

