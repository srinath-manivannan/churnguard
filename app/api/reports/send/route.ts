import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { db } from "@/lib/db/turso";
import { customers, campaigns } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendEmail } from "@/lib/email"; // ✅ Use Gmail instead of Resend

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    if (!user.email) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      );
    }

    console.log("📊 Generating report for:", user.email);

    // Get data
    const allCustomers = await db
      .select()
      .from(customers)
      .where(eq(customers.userId, user.id))
      .all();

    const allCampaigns = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.userId, user.id))
      .all();

    // Calculate stats
    const totalCustomers = allCustomers.length;
    const highRiskCount = allCustomers.filter(
      c => c.riskLevel === "high" || c.riskLevel === "critical"
    ).length;
    const totalRevenue = allCustomers.reduce((sum, c) => sum + (c.totalRevenue || 0), 0);
    const avgChurnScore = totalCustomers > 0 
      ? Math.round(allCustomers.reduce((sum, c) => sum + (c.churnScore || 0), 0) / totalCustomers)
      : 0;

    const reportHTML = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px; background: #f3f4f6;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #3b82f6; margin: 0 0 10px 0;">📊 ChurnGuard Weekly Report</h1>
            <p style="color: #6b7280; margin: 0 0 30px 0;">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; margin: 0 0 20px 0; border-radius: 8px;">
              <h2 style="margin: 0 0 20px 0; font-size: 20px;">Key Metrics</h2>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                  <div style="font-size: 32px; font-weight: bold; margin-bottom: 5px;">${totalCustomers}</div>
                  <div style="font-size: 14px; opacity: 0.9;">Total Customers</div>
                </div>
                <div>
                  <div style="font-size: 32px; font-weight: bold; margin-bottom: 5px;">${highRiskCount}</div>
                  <div style="font-size: 14px; opacity: 0.9;">High Risk</div>
                </div>
                <div>
                  <div style="font-size: 32px; font-weight: bold; margin-bottom: 5px;">$${totalRevenue.toLocaleString()}</div>
                  <div style="font-size: 14px; opacity: 0.9;">Total Revenue</div>
                </div>
                <div>
                  <div style="font-size: 32px; font-weight: bold; margin-bottom: 5px;">${avgChurnScore}</div>
                  <div style="font-size: 14px; opacity: 0.9;">Avg Churn Score</div>
                </div>
              </div>
            </div>
            
            <div style="background: #fef3c7; padding: 20px; margin: 0 0 20px 0; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <h3 style="margin: 0 0 15px 0; color: #92400e;">⚠️ Key Insights</h3>
              <ul style="margin: 0; padding-left: 20px; color: #78350f;">
                <li style="margin-bottom: 8px;"><strong>${highRiskCount} customers</strong> need immediate attention</li>
                <li style="margin-bottom: 8px;">Total campaigns sent: <strong>${allCampaigns.length}</strong></li>
                <li style="margin-bottom: 8px;">Revenue at risk: <strong>$${allCustomers.filter(c => c.riskLevel === "high" || c.riskLevel === "critical").reduce((sum, c) => sum + (c.totalRevenue || 0), 0).toLocaleString()}</strong></li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://churnguard-3veb.vercel.app/dashboard" 
                 style="display: inline-block; background: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                📊 View Dashboard
              </a>
            </div>
            
            <div style="text-align: center; padding: 20px 0 0 0; margin-top: 30px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
              <p style="margin: 0 0 5px 0;">This is an automated report from ChurnGuard</p>
              <p style="margin: 0;">Sent to: <strong>${user.email}</strong></p>
            </div>
          </div>
        </body>
      </html>
    `;

    // ✅ Send via Gmail SMTP (works for ANY email!)
    const result = await sendEmail({
      to: user.email, // ✅ Whoever is logged in!
      subject: `📊 ChurnGuard Weekly Report - ${new Date().toLocaleDateString()}`,
      html: reportHTML,
    });

    console.log("✅ Report sent successfully!");

    return NextResponse.json({
      success: true,
      message: `Report sent to ${user.email}`,
      messageId: result.messageId,
      stats: {
        totalCustomers,
        highRiskCount,
        totalRevenue,
        avgChurnScore,
      }
    });
  } catch (error: any) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send report" },
      { status: 500 }
    );
  }
}