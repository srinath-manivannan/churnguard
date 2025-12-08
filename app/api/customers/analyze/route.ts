/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================
// CHURN ANALYSIS API
// ============================================
// POST /api/customers/analyze - Analyze customers for churn risk

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { getCustomers, updateCustomerChurnScore } from "@/lib/db/queries";
import { analyzeChurnRisk } from "@/lib/ai/openai";
// import { analyzeChurnRisk } from "@/lib/ai/gemini";

// ============================================
// POST - Analyze churn risk for all customers
// ============================================
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();

    // Get all customers for this user
    const customers = await getCustomers(user.id);

    // Check if user has customers
    if (customers.length === 0) {
      return NextResponse.json(
        { error: "No customers to analyze" },
        { status: 400 }
      );
    }

    // Prepare customer data for analysis
    const customerData = customers.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email || "",
      lastActivityDate: c.lastActivityDate || "unknown",
      totalRevenue: c.totalRevenue || 0,
      supportTickets: c.supportTickets || 0,
      segment: c.segment || "unknown",
    }));

    // Process in batches of 10 to avoid token limits
    const batchSize = 10;
    const results = [];

    for (let i = 0; i < customerData.length; i += batchSize) {
      const batch = customerData.slice(i, i + batchSize);

      // Call Gemini for churn analysis
      const batchResults = await analyzeChurnRisk(batch);
      results.push(...batchResults);

      // Small delay to avoid rate limiting
      if (i + batchSize < customerData.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    // Update customers in database with churn scores
    const updatePromises = results.map((result: any) => {
      return updateCustomerChurnScore(
        result.customerId,
        result.churnScore,
        result.riskLevel,
        result.riskFactors
      );
    });

    await Promise.all(updatePromises);

    // Calculate statistics
    const highRiskCount = results.filter(
      (r: any) => r.riskLevel === "high" || r.riskLevel === "critical"
    ).length;

    const avgChurnScore =
      results.reduce((sum: number, r: any) => sum + r.churnScore, 0) /
      results.length;

    // Return results
    return NextResponse.json({
      success: true,
      message: "Churn analysis completed successfully",
      stats: {
        totalAnalyzed: results.length,
        highRiskCount,
        averageChurnScore: Math.round(avgChurnScore),
      },
      results,
    });
  } catch (error: any) {
    console.error("Churn analysis error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze churn risk" },
      { status: error.message === "Unauthorized - Please sign in" ? 401 : 500 }
    );
  }
}