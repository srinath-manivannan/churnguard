/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================
// HYBRID CHAT API → RULE-BASED + GEMINI AI
// WITH DERIVED CHURN RISK FROM CSV-LIKE FIELDS
// ============================================

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { db } from "@/lib/db/turso";
import { customers, campaigns } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { chatbotResponse } from "@/lib/ai/hybrid";
// import { chatbotResponse } from "@/lib/ai/openai";
// import { chatbotResponse } from "@/lib/ai/gemini";

// 🔢 Simple churn-score from inactivity, revenue, tickets, segment
function computeRisk(customer: any) {
  const today = new Date();

  const last =
    customer.lastActivityDate || customer.last_activity_date
      ? new Date(customer.lastActivityDate || customer.last_activity_date)
      : null;

  const daysInactive =
    last && !Number.isNaN(last.getTime())
      ? (today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
      : null;

  const revenue = customer.totalRevenue ?? customer.total_revenue ?? 0;
  const tickets = customer.supportTickets ?? customer.support_tickets ?? 0;
  const segment = (customer.segment || "").toLowerCase();

  let score = 0;

  // Inactivity weight
  if (daysInactive !== null) {
    if (daysInactive > 365) score += 50;
    else if (daysInactive > 180) score += 35;
    else if (daysInactive > 90) score += 25;
    else if (daysInactive > 30) score += 15;
  }

  // High value customers
  if (revenue > 10000) score += 20;
  else if (revenue > 5000) score += 10;

  // Support tickets → frustration
  if (tickets > 15) score += 20;
  else if (tickets > 8) score += 10;

  // Enterprise segment more sensitive
  if (segment === "enterprise") score += 10;

  let riskLevel: "low" | "medium" | "high" | "critical";
  if (score >= 80) riskLevel = "critical";
  else if (score >= 60) riskLevel = "high";
  else if (score >= 30) riskLevel = "medium";
  else riskLevel = "low";

  return {
    ...customer,
    churnScore: score,
    riskLevel,
    daysInactive,
  };
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { message, history = [] } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const msgLower = message.toLowerCase();
    let response = "";

    // ============================================
    // 1️⃣ LOAD + DERIVE DATA
    // ============================================

    const rawCustomers = await db
      .select()
      .from(customers)
      .where(eq(customers.userId, user.id));

    const allCampaigns = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.userId, user.id));

    const allCustomers = rawCustomers.map(computeRisk);

    const totalCustomers = allCustomers.length;
    const highRiskCustomers = allCustomers.filter(
      (c) => c.riskLevel === "high" || c.riskLevel === "critical"
    );
    const totalRevenue = allCustomers.reduce(
      (sum, c) => sum + (c.totalRevenue ?? c.total_revenue ?? 0),
      0
    );
    const inactive30 = allCustomers.filter(
      (c) => c.daysInactive !== null && c.daysInactive! >= 30
    );

    // ============================================
    // 2️⃣ RULE-BASED MATCHING FOR COMMON QUESTIONS
    // ============================================

    // 2.1 Customer count
    if (
      msgLower.includes("how many customer") ||
      msgLower.includes("total customer") ||
      msgLower.includes("customer count") ||
      msgLower.includes("number of customer")
    ) {
      response = `📊 **Customer Overview**

- Total Customers: ${totalCustomers}
- High/Critical Risk: ${highRiskCustomers.length}
- Total Revenue: $${totalRevenue.toLocaleString()}

I can also break this down by segment, inactivity or support tickets if you want.`;
    }

    // 2.2 High risk / highest risk customers
    else if (
      msgLower.includes("high risk") ||
      msgLower.includes("highest risk") ||
      msgLower.includes("critical risk") ||
      msgLower.includes("risk customers")
    ) {
      if (highRiskCustomers.length === 0) {
        response =
          "🎉 Right now, no customers are classified as high or critical risk based on inactivity, revenue and support patterns.";
      } else {
        const list = highRiskCustomers.slice(0, 5)
          .map(
            (c, i) => `${i + 1}. ${c.name} (${c.email})
- Segment: ${c.segment}
- Risk: ${c.riskLevel} (score ${c.churnScore}/100)
- Days inactive: ${
              c.daysInactive !== null
                ? Math.floor(c.daysInactive)
                : "Unknown"
            }
- Revenue: $${(c.totalRevenue ?? c.total_revenue ?? 0).toLocaleString()}`
          )
          .join("\n\n");

        response = `⚠️ **Highest-Risk Customers (${highRiskCustomers.length})**

${list}

${
  highRiskCustomers.length > 5
    ? `…and ${highRiskCustomers.length - 5} more high/critical risk customers.`
    : ""
}

These should be the first priority for retention campaigns.`;
      }
    }

    // 2.3 Inactive 30+ days
    else if (
      msgLower.includes("30+ days") ||
      msgLower.includes("30 days") ||
      msgLower.includes("inactive")
    ) {
      if (inactive30.length === 0) {
        response =
          "✅ No customers appear inactive for more than 30 days based on their last activity date.";
      } else {
        const list = inactive30.slice(0, 5)
          .map(
            (c, i) => `${i + 1}. ${c.name} (${c.email})
- Segment: ${c.segment}
- Days inactive: ${
              c.daysInactive !== null
                ? Math.floor(c.daysInactive)
                : "Unknown"
            }
- Risk: ${c.riskLevel} (score ${c.churnScore}/100)`
          )
          .join("\n\n");

        response = `⏳ **Customers inactive for 30+ days (${inactive30.length})**

${list}

These customers are at strong risk of churn. Consider re-engagement campaigns or offers.`;
      }
    }

    // 2.4 Campaign overview
    else if (msgLower.includes("campaign")) {
      response = `📢 **Campaign Overview**

- Total Campaigns: ${allCampaigns.length}
- Sent: ${allCampaigns.filter((c) => c.status === "sent").length}
- Drafts: ${allCampaigns.filter((c) => c.status === "draft").length}

Ask me to design a campaign for a specific segment, like "inactive enterprise customers".`;
    }

    // 2.5 Revenue overview
    else if (msgLower.includes("revenue")) {
      const avg = totalRevenue / (totalCustomers || 1);
      const highRiskRev = highRiskCustomers.reduce(
        (sum, c) => sum + (c.totalRevenue ?? c.total_revenue ?? 0),
        0
      );

      response = `💰 **Revenue Report**

- Total Revenue: $${totalRevenue.toLocaleString()}
- Avg per Customer: $${avg.toFixed(2)}
- At-Risk Revenue (high/critical): $${highRiskRev.toLocaleString()}

Protecting at-risk revenue should be a top priority.`;
    }

    // 2.6 List customers
    else if (
      msgLower.includes("list customer") ||
      msgLower.includes("show customer")
    ) {
      const preview = allCustomers.slice(0, 5)
        .map(
          (c, i) => `${i + 1}. ${c.name} (${c.email})
- Segment: ${c.segment}
- Risk: ${c.riskLevel} (score ${c.churnScore}/100)
- Revenue: $${(c.totalRevenue ?? c.total_revenue ?? 0).toLocaleString()}`
        )
        .join("\n\n");

      response = `👥 **Customer Preview (${totalCustomers} total)**

${preview}

(Showing first 5 only — use the Customers page for the full list.)`;
    }

    // 2.7 Main reasons for churn
    else if (
      msgLower.includes("reason") &&
      msgLower.includes("churn")
    ) {
      // Use simple analysis over high/critical risk customers
      const base = highRiskCustomers.length > 0 ? highRiskCustomers : allCustomers;

      const manyTickets = base.filter(
        (c) =>
          (c.supportTickets ?? c.support_tickets ?? 0) >= 5
      ).length;

      const longInactive = base.filter(
        (c) => c.daysInactive !== null && c.daysInactive! >= 60
      ).length;

      const lowRevenue = base.filter(
        (c) => (c.totalRevenue ?? c.total_revenue ?? 0) < 1000
      ).length;

      response = `📉 **Likely Drivers of Churn**

Looking at your higher-risk / inactive customers, the main patterns are:

- 🔸 Inactivity: ${
        longInactive
      } customers have been inactive for 60+ days.
- 🔸 Low value: ${
        lowRevenue
      } customers contribute very little revenue, so they may disengage easily.
- 🔸 Support friction: ${
        manyTickets
      } customers have opened 5+ support tickets, which often indicates frustration.

From these patterns, the **top churn reasons** are likely:
1. Long periods of inactivity / lack of product usage
2. Low perceived value for lower-spend customers
3. Unresolved issues or poor support experience

You can reduce churn by:
- Proactive check-ins with inactive high-value customers
- Value-focused onboarding / education
- Faster resolution and follow-ups for high-ticket customers.`;
    }

    // 2.8 Greeting
    else if (["hi", "hello", "hey"].includes(msgLower.trim())) {
      response = `👋 Hello! I'm ChurnGuard AI.

Current snapshot:
- Customers: ${totalCustomers}
- High/Critical Risk: ${highRiskCustomers.length}
- Total Revenue: $${totalRevenue.toLocaleString()}

You can ask:
- "Who are my highest risk customers?"
- "Which customers haven't been active in 30+ days?"
- "What are the main reasons for customer churn?"
- "What's the average revenue of high-risk customers?"`;
    }

    // ============================================
    // 3️⃣ IF NOTHING MATCHED → FALLBACK TO GEMINI
    // ============================================
    if (!response) {
      response = await chatbotResponse(
        message,
        allCustomers.slice(0, 50), // enriched context
        history
      );
    }

    return NextResponse.json({
      success: true,
      response,
      context: {
        totalCustomers,
        highRiskCount: highRiskCustomers.length,
        campaignCount: allCampaigns.length,
        totalRevenue,
      },
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process chat" },
      { status: 500 }
    );
  }
}
