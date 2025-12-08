/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================
// GENERATE REPORT API
// ============================================
// POST /api/reports/generate - Generate AI report

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { getDashboardStats } from "@/lib/db/queries";
// import { generateReport } from "@/lib/ai/gemini";
import { db } from "@/lib/db/turso";
import { reports } from "@/lib/db/schema";
import { Resend } from "resend";
import { generateReport } from "@/lib/ai/openai";

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();

    // Get request body
    const body = await request.json();
    const { reportType = "weekly", emailReport = true } = body;

    // ====================================
    // STEP 1: Collect data
    // ====================================
    const stats = await getDashboardStats(user.id);

    // Prepare report data
    const reportData = {
      period: "Last 7 days",
      metrics: {
        totalCustomers: stats.totalCustomers,
        highRiskCount: stats.highRiskCount,
        averageChurnScore: 42, // Calculate from customers
        revenueAtRisk: stats.revenueAtRisk,
        activeCampaigns: stats.activeCampaigns,
      },
      campaigns: {
        sent: 45,
        opened: 16,
        openRate: 35.6,
        conversions: 3,
      },
      insights: [
        "High-risk customer count increased by 18% this week",
        "Enterprise segment shows highest churn risk",
        "Email campaigns have 35% open rate (above industry average)",
        "Support ticket volume correlates with churn risk",
        "Inactive customers (30+ days) should be prioritized",
      ],
      recommendations: [
        "Launch targeted campaign for 23 high-risk customers",
        "Schedule CSM calls for top 10 revenue-at-risk accounts",
        "Implement automated re-engagement workflow",
        "Review product onboarding for enterprise segment",
        "Set up weekly churn monitoring alerts",
      ],
    };

    // ====================================
    // STEP 2: Generate HTML report with Gemini
    // ====================================
    const htmlContent = await generateReport(reportData);

    // ====================================
    // STEP 3: Save report to database
    // ====================================
    const reportId = crypto.randomUUID();
    const reportTitle = `ChurnGuard Report - ${new Date().toLocaleDateString()}`;

    await db.insert(reports).values({
      id: reportId,
      userId: user.id,
      reportType,
      title: reportTitle,
      htmlContent,
      reportData: JSON.stringify(reportData),
      generatedAt: new Date(),
      emailSent: emailReport ? 1 : 0,
    });

    // ====================================
    // STEP 4: Send email (if requested)
    // ====================================
    if (emailReport && user.email) {
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
          to: user.email,
          subject: reportTitle,
          html: htmlContent,
        });
      } catch (emailError) {
        console.error("Failed to send report email:", emailError);
        // Don't fail the whole request if email fails
      }
    }

    // ====================================
    // STEP 5: Return success
    // ====================================
    return NextResponse.json({
      success: true,
      message: "Report generated successfully",
      reportId,
    });
  } catch (error: any) {
    console.error("Report generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate report" },
      { status: 500 }
    );
  }
}