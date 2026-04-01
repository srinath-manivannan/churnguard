/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { getDashboardStats } from "@/lib/db/queries";
import { db } from "@/lib/db/turso";
import { reports } from "@/lib/db/schema";
import { Resend } from "resend";
import { generateReport } from "@/lib/ai/openai";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const { reportType = "weekly", emailReport = true } = body;

    const stats = await getDashboardStats(user.id);

    const reportData = {
      period: "Last 7 days",
      metrics: {
        totalCustomers: stats.totalCustomers,
        highRiskCount: stats.highRiskCount,
        averageChurnScore: 42,
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

    const htmlContent = await generateReport(reportData);

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

    if (emailReport && user.email) {
      try {
        await getResend().emails.send({
          from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
          to: user.email,
          subject: reportTitle,
          html: htmlContent,
        });
      } catch (emailError) {
        console.error("Failed to send report email:", emailError);
        // Report row is still saved; email failure should not fail the request
      }
    }

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
