import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { db } from "@/lib/db/turso";
import { customers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Fetch all customers
    const allCustomers = await db
      .select()
      .from(customers)
      .where(eq(customers.userId, user.id))
      .all();

    // Calculate metrics
    const totalCustomers = allCustomers.length;
    const highRiskCount = allCustomers.filter(
      c => c.riskLevel === "high" || c.riskLevel === "critical"
    ).length;
    const totalRevenue = allCustomers.reduce((sum, c) => sum + (c.totalRevenue || 0), 0);
    const averageChurnScore = Math.round(
      allCustomers.reduce((sum, c) => sum + (c.churnScore || 0), 0) / totalCustomers
    );

    // Risk distribution
    const riskCounts = {
      low: allCustomers.filter(c => c.riskLevel === "low").length,
      medium: allCustomers.filter(c => c.riskLevel === "medium").length,
      high: allCustomers.filter(c => c.riskLevel === "high").length,
      critical: allCustomers.filter(c => c.riskLevel === "critical").length,
    };

    const riskDistribution = [
      { name: "Low", value: riskCounts.low, color: "#10b981" },
      { name: "Medium", value: riskCounts.medium, color: "#f59e0b" },
      { name: "High", value: riskCounts.high, color: "#ef4444" },
      { name: "Critical", value: riskCounts.critical, color: "#991b1b" },
    ].filter(item => item.value > 0);

    // Top 10 customers by revenue
    const topCustomers = allCustomers
      .sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0))
      .slice(0, 10)
      .map(c => ({
        name: c.name.substring(0, 15),
        revenue: c.totalRevenue || 0,
      }));

    // Mock churn trend (you can calculate real trends from customer events)
    const churnTrend = [
      { month: "Jul", churnRate: 12 },
      { month: "Aug", churnRate: 15 },
      { month: "Sep", churnRate: 18 },
      { month: "Oct", churnRate: 16 },
      { month: "Nov", churnRate: 14 },
      { month: "Dec", churnRate: 11 },
    ];

    return NextResponse.json({
      totalCustomers,
      highRiskCount,
      totalRevenue,
      averageChurnScore,
      riskDistribution,
      topCustomers,
      churnTrend,
    });
  } catch (error: any) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}