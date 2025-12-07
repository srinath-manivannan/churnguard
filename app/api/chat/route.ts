/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================
// CHAT API - WITH REAL DATABASE QUERIES
// ============================================
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { db } from "@/lib/db/turso";
import { customers, campaigns } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const msgLower = message.toLowerCase();
    let response: string;

    // ============================================
    // QUERY REAL DATABASE
    // ============================================
    
    // Get all customers for this user
    const allCustomers = await db
      .select()
      .from(customers)
      .where(eq(customers.userId, user.id))
      .all();

    const totalCustomers = allCustomers.length;
    const highRiskCustomers = allCustomers.filter(
      c => c.riskLevel === "high" || c.riskLevel === "critical"
    );
    const totalRevenue = allCustomers.reduce((sum, c) => sum + (c.totalRevenue || 0), 0);

    // Get campaigns
    const allCampaigns = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.userId, user.id))
      .all();

    // ============================================
    // INTELLIGENT RESPONSE MATCHING
    // ============================================

    // Customer count questions
    if (
      msgLower.includes("how many customer") ||
      msgLower.includes("total customer") ||
      msgLower.includes("customer count") ||
      msgLower.includes("number of customer")
    ) {
      response = `📊 **Customer Overview:**

**Total Customers:** ${totalCustomers}
**High Risk:** ${highRiskCustomers.length} customers (${((highRiskCustomers.length / totalCustomers) * 100).toFixed(1)}%)
**Total Revenue:** $${totalRevenue.toLocaleString()}

${highRiskCustomers.length > 0 ? `⚠️ You have ${highRiskCustomers.length} at-risk customers who need immediate attention!` : "✅ No high-risk customers at the moment!"}

Would you like me to help you create a retention campaign?`;
    }
    
    // High risk customer questions
    else if (
      msgLower.includes("high risk") ||
      msgLower.includes("at-risk") ||
      msgLower.includes("at risk") ||
      msgLower.includes("who should i worry") ||
      msgLower.includes("who to watch")
    ) {
      if (highRiskCustomers.length === 0) {
        response = "✅ Great news! You don't have any high-risk customers at the moment. Keep up the good work!";
      } else {
        const topRisk = highRiskCustomers.slice(0, 5);
        response = `⚠️ **High-Risk Customers (${highRiskCustomers.length} total):**

${topRisk.map((c, i) => `${i + 1}. **${c.name}** - ${c.email}
   - Risk: ${c.riskLevel}
   - Score: ${c.churnScore}/100
   - Last active: ${c.lastActivityDate || 'Unknown'}`).join('\n\n')}

${highRiskCustomers.length > 5 ? `\n...and ${highRiskCustomers.length - 5} more` : ''}

**Recommended Actions:**
1. Send personalized re-engagement email
2. Schedule 1-on-1 calls
3. Offer special incentive
4. Provide extra support

Want me to help create a retention campaign for these customers?`;
      }
    }
    
    // Campaign questions
    else if (
      msgLower.includes("campaign") ||
      msgLower.includes("how many campaign") ||
      msgLower.includes("email")
    ) {
      response = `📧 **Campaign Overview:**

**Total Campaigns:** ${allCampaigns.length}
**Sent:** ${allCampaigns.filter(c => c.status === "sent").length}
**Draft:** ${allCampaigns.filter(c => c.status === "draft").length}

${allCampaigns.length === 0 ? 
  "You haven't created any campaigns yet. Would you like help creating your first one?" :
  "Use campaigns to re-engage at-risk customers with personalized messages!"
}`;
    }
    
    // Revenue questions
    else if (
      msgLower.includes("revenue") ||
      msgLower.includes("money") ||
      msgLower.includes("sales")
    ) {
      const avgRevenue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
      response = `💰 **Revenue Overview:**

**Total Revenue:** $${totalRevenue.toLocaleString()}
**Average per Customer:** $${avgRevenue.toFixed(2)}
**Total Customers:** ${totalCustomers}

${highRiskCustomers.length > 0 ? 
  `⚠️ At-risk revenue: $${highRiskCustomers.reduce((sum, c) => sum + (c.totalRevenue || 0), 0).toLocaleString()} (${highRiskCustomers.length} customers)` :
  "✅ All revenue streams look healthy!"
}`;
    }
    
    // List customers
    else if (
      msgLower.includes("list customer") ||
      msgLower.includes("show customer") ||
      msgLower.includes("who are my customer")
    ) {
      if (totalCustomers === 0) {
        response = "You don't have any customers yet. Upload a CSV file to get started!";
      } else {
        const recentCustomers = allCustomers.slice(0, 5);
        response = `👥 **Your Customers (${totalCustomers} total):**

${recentCustomers.map((c, i) => `${i + 1}. ${c.name} (${c.email})
   - Risk: ${c.riskLevel || 'low'}
   - Revenue: $${(c.totalRevenue || 0).toLocaleString()}`).join('\n\n')}

${totalCustomers > 5 ? `\n...and ${totalCustomers - 5} more customers` : ''}

Visit the Customers page to see everyone!`;
      }
    }
    
    // Greeting
    else if (
      msgLower.includes("hello") ||
      msgLower.includes("hi ") ||
      msgLower === "hi" ||
      msgLower === "hey"
    ) {
      response = `Hello! 👋 I'm ChurnGuard AI.

**Quick Stats:**
- Total Customers: ${totalCustomers}
- High Risk: ${highRiskCustomers.length}
- Campaigns: ${allCampaigns.length}

**I can help you:**
- Analyze customer churn risk
- Create retention campaigns
- Answer questions about your data
- Provide retention strategies

What would you like to know?`;
    }
    
    // Default response
    else {
      response = `I'm here to help with customer retention! 

**Current Stats:**
- Customers: ${totalCustomers}
- At Risk: ${highRiskCustomers.length}
- Total Revenue: $${totalRevenue.toLocaleString()}

**Try asking:**
- "How many customers do I have?"
- "Who are my high-risk customers?"
- "Show me my campaigns"
- "What's my total revenue?"

What would you like to know?`;
    }

    // Simulate AI thinking delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      success: true,
      response: response,
      context: {
        totalCustomers,
        highRiskCount: highRiskCustomers.length,
        campaignCount: allCampaigns.length,
      },
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process message" },
      { status: 500 }
    );
  }
}