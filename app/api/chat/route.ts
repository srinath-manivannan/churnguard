/* eslint-disable @typescript-eslint/no-explicit-any */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { db } from "@/lib/db/turso";
import { customers, campaigns } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { chatbotResponse } from "@/lib/ai/hybrid";
import { enrichPromptWithRAG } from "@/lib/ai/rag";
import { predictChurnBatch } from "@/lib/ai/churn-predictor";
import { computeCohortHealth } from "@/lib/ai/health-score";
import { detectAnomalies } from "@/lib/ai/anomaly-detection";
import { clusterCustomers } from "@/lib/ai/segmentation";
import { analyzeTextSentimentLocal } from "@/lib/ai/sentiment";
import { logger } from "@/lib/observability/logger";

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

  if (daysInactive !== null) {
    if (daysInactive > 365) score += 50;
    else if (daysInactive > 180) score += 35;
    else if (daysInactive > 90) score += 25;
    else if (daysInactive > 30) score += 15;
  }

  if (revenue > 10000) score += 20;
  else if (revenue > 5000) score += 10;

  if (tickets > 15) score += 20;
  else if (tickets > 8) score += 10;

  if (segment === "enterprise") score += 10;

  let riskLevel: "low" | "medium" | "high" | "critical";
  if (score >= 80) riskLevel = "critical";
  else if (score >= 60) riskLevel = "high";
  else if (score >= 30) riskLevel = "medium";
  else riskLevel = "low";

  return { ...customer, churnScore: score, riskLevel, daysInactive };
}

export async function POST(request: NextRequest) {
  return logger.withTrace(async () => {
    try {
      const user = await requireAuth();
      const body = await request.json();
      const { message, history = [] } = body;

      if (!message || typeof message !== "string") {
        return NextResponse.json({ error: "Message is required" }, { status: 400 });
      }

      const msgLower = message.toLowerCase();
      let response = "";

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

      // Analyze user message sentiment to gauge urgency
      const messageSentiment = analyzeTextSentimentLocal(message);

      // Advanced AI commands
      if (
        msgLower.includes("health score") ||
        msgLower.includes("customer health")
      ) {
        const cohortHealth = computeCohortHealth(allCustomers);
        const gradeDistStr = Object.entries(cohortHealth.distribution)
          .filter(([, v]) => v > 0)
          .map(([grade, count]) => `${grade}: ${count}`)
          .join(", ");

        response = `🏥 **Customer Health Report**

- Average Health Score: **${cohortHealth.avgScore}/100**
- Grade Distribution: ${gradeDistStr}
- Active Alerts: ${cohortHealth.alertCount}

${cohortHealth.scores.slice(0, 5).map((s, i) =>
  `${i + 1}. Health ${s.healthScore.grade} (${s.healthScore.overall}/100) — ${s.healthScore.dimensions.filter(d => d.status === "critical").length} critical dimensions`
).join("\n")}

${cohortHealth.alertCount > 0 ? `\n⚠️ ${cohortHealth.alertCount} health alerts detected. Check the Analytics dashboard for details.` : ""}`;
      } else if (
        msgLower.includes("anomal") ||
        msgLower.includes("unusual") ||
        msgLower.includes("spike")
      ) {
        const anomalyReport = detectAnomalies(allCustomers);
        if (anomalyReport.anomalies.length === 0) {
          response = "✅ No anomalies detected in your customer data. Everything looks normal.";
        } else {
          const topAnomalies = anomalyReport.anomalies.slice(0, 5);
          response = `🔍 **Anomaly Detection Report**

Found **${anomalyReport.summary.totalAnomalies} anomalies** affecting ${anomalyReport.summary.affectedCustomers} customers.

${anomalyReport.summary.criticalCount > 0 ? `🚨 **${anomalyReport.summary.criticalCount} critical anomalies** require immediate attention.\n` : ""}
${topAnomalies.map((a, i) => `${i + 1}. **[${a.severity.toUpperCase()}]** ${a.customerName}: ${a.description}
   → ${a.suggestedAction}`).join("\n\n")}`;
        }
      } else if (
        msgLower.includes("segment") ||
        msgLower.includes("cluster") ||
        msgLower.includes("rfm")
      ) {
        const segments = clusterCustomers(allCustomers);
        response = `📊 **Customer Segmentation (RFM Analysis)**

Found **${segments.length} segments** across ${totalCustomers} customers:

${segments.slice(0, 6).map((s, i) =>
  `${i + 1}. **${s.name}** (${s.customerCount} customers)
   - Avg Revenue: $${s.avgRevenue.toLocaleString()}
   - Avg Churn Score: ${s.avgChurnScore}
   - Strategy: ${s.recommendedStrategy}`
).join("\n\n")}`;
      } else if (
        msgLower.includes("predict") ||
        msgLower.includes("churn prediction") ||
        msgLower.includes("ml prediction") ||
        msgLower.includes("forecast")
      ) {
        const { predictions, aggregates } = predictChurnBatch(allCustomers);
        const topRisk = predictions.slice(0, 5);

        response = `🤖 **AI Churn Prediction Report**

**Aggregate Metrics:**
- Average Churn Score: ${aggregates.avgChurnScore}/100
- Revenue at Risk: $${aggregates.totalRevenueAtRisk.toLocaleString()}
- Critical: ${aggregates.criticalCount} | High: ${aggregates.highCount}
- Churn Velocity: ${aggregates.churnVelocity}% of customers above threshold

**Top 5 At-Risk Customers:**
${topRisk.map((p, i) => {
  const topFactor = p.riskFactors[0];
  return `${i + 1}. **Churn Score: ${p.churnScore}/100** (${p.riskLevel})
   - Revenue at Risk: $${p.revenueAtRisk.toLocaleString()}
   - Top Factor: ${topFactor?.description || "Multiple signals"}
   - Action: ${p.recommendedActions[0]?.action || "Review account"}`;
}).join("\n\n")}`;
      } else if (
        msgLower.includes("how many customer") ||
        msgLower.includes("total customer") ||
        msgLower.includes("customer count") ||
        msgLower.includes("number of customer")
      ) {
        response = `📊 **Customer Overview**

- Total Customers: ${totalCustomers}
- High/Critical Risk: ${highRiskCustomers.length}
- Total Revenue: $${totalRevenue.toLocaleString()}

I can also show you health scores, anomalies, segments, or churn predictions.`;
      } else if (
        msgLower.includes("high risk") ||
        msgLower.includes("highest risk") ||
        msgLower.includes("critical risk") ||
        msgLower.includes("risk customers")
      ) {
        if (highRiskCustomers.length === 0) {
          response = "🎉 No customers are classified as high or critical risk right now.";
        } else {
          const list = highRiskCustomers.slice(0, 5)
            .map(
              (c, i) => `${i + 1}. ${c.name} (${c.email})
- Segment: ${c.segment}
- Risk: ${c.riskLevel} (score ${c.churnScore}/100)
- Days inactive: ${c.daysInactive !== null ? Math.floor(c.daysInactive) : "Unknown"}
- Revenue: $${(c.totalRevenue ?? c.total_revenue ?? 0).toLocaleString()}`
            )
            .join("\n\n");

          response = `⚠️ **Highest-Risk Customers (${highRiskCustomers.length})**

${list}

${highRiskCustomers.length > 5 ? `…and ${highRiskCustomers.length - 5} more.` : ""}

These should be the first priority for retention campaigns.`;
        }
      } else if (
        msgLower.includes("30+ days") ||
        msgLower.includes("30 days") ||
        msgLower.includes("inactive")
      ) {
        if (inactive30.length === 0) {
          response = "✅ No customers appear inactive for more than 30 days.";
        } else {
          const list = inactive30.slice(0, 5)
            .map(
              (c, i) => `${i + 1}. ${c.name} (${c.email})
- Segment: ${c.segment}
- Days inactive: ${c.daysInactive !== null ? Math.floor(c.daysInactive) : "Unknown"}
- Risk: ${c.riskLevel} (score ${c.churnScore}/100)`
            )
            .join("\n\n");

          response = `⏳ **Customers inactive for 30+ days (${inactive30.length})**

${list}

These customers are at strong risk of churn.`;
        }
      } else if (msgLower.includes("campaign")) {
        response = `📢 **Campaign Overview**

- Total Campaigns: ${allCampaigns.length}
- Sent: ${allCampaigns.filter((c) => c.status === "sent").length}
- Drafts: ${allCampaigns.filter((c) => c.status === "draft").length}

Ask me to design a campaign for a specific segment.`;
      } else if (msgLower.includes("revenue")) {
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
      } else if (["hi", "hello", "hey"].includes(msgLower.trim())) {
        response = `👋 Hello! I'm ChurnGuard AI — your intelligent retention assistant.

Current snapshot:
- Customers: ${totalCustomers}
- High/Critical Risk: ${highRiskCustomers.length}
- Total Revenue: $${totalRevenue.toLocaleString()}

I can help with:
- 🤖 "Show me churn predictions" — AI-powered predictive analysis
- 🏥 "Customer health scores" — Multi-dimensional health assessment
- 🔍 "Detect anomalies" — Statistical anomaly detection
- 📊 "Segment my customers" — RFM analysis & behavioral clustering
- ⚠️ "Who are my highest risk customers?"
- 📈 "Revenue report"`;
      }

      // Fallback to RAG-enhanced AI response
      if (!response) {
        const { enrichedPrompt, context } = enrichPromptWithRAG(
          "You are ChurnGuard AI, an expert customer retention assistant.",
          message,
          allCustomers.slice(0, 100)
        );

        logger.info("RAG context built", {
          chunks: context.chunks.length,
          relevance: context.queryRelevanceScore,
          tokens: context.totalTokenEstimate,
        });

        response = await chatbotResponse(
          `${enrichedPrompt}\n\nUser question: "${message}"`,
          allCustomers.slice(0, 50),
          history
        );
      }

      logger.info("Chat response generated", {
        messageLength: message.length,
        sentiment: messageSentiment.label,
        hadLocalHandler: !!response,
      });

      return NextResponse.json({
        success: true,
        response,
        context: {
          totalCustomers,
          highRiskCount: highRiskCustomers.length,
          campaignCount: allCampaigns.length,
          totalRevenue,
          messageSentiment: messageSentiment.label,
        },
      });
    } catch (error: any) {
      logger.error("Chat API error", { error: error.message });
      return NextResponse.json(
        { error: error.message || "Failed to process chat" },
        { status: 500 }
      );
    }
  });
}
