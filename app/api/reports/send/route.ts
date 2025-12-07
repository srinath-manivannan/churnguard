import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { db } from "@/lib/db/turso";
import { customers, campaigns } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// ✅ List of allowed emails (add as many as you want!)
const ALLOWED_EMAILS = [
  "srinath2411.mani@gmail.com",
  "srinathmpro2001@gmail.com",
  "priyadharshini.s@pyramidions.com",
  // Add more emails here...
];

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    if (!user.email) {
      return NextResponse.json(
        { error: "User email not found. Please update your profile." },
        { status: 400 }
      );
    }

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
              <a href="http://localhost:3000/dashboard" 
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

    console.log("📧 Sending email to:", user.email);

    // ✅ Check if email is in allowed list
    if (!ALLOWED_EMAILS.includes(user.email)) {
      return NextResponse.json(
        { 
          error: `Your email (${user.email}) is not authorized to receive reports. Please contact admin.`,
          allowedEmails: ALLOWED_EMAILS,
        },
        { status: 403 }
      );
    }

    // ✅ Send to logged-in user (if in allowed list)
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: user.email, // ✅ Will work for any email in ALLOWED_EMAILS
      subject: `📊 ChurnGuard Weekly Report - ${new Date().toLocaleDateString()}`,
      html: reportHTML,
    });

    if (error) {
      console.error("❌ Resend error:", error);
      return NextResponse.json(
        { 
          error: "Failed to send email",
          details: error.message || JSON.stringify(error),
        },
        { status: 500 }
      );
    }

    if (!data || !data.id) {
      return NextResponse.json(
        { error: "Email send failed - no ID returned" },
        { status: 500 }
      );
    }

    console.log("✅ Email sent! ID:", data.id);

    return NextResponse.json({
      success: true,
      message: `Report sent to ${user.email}`,
      emailId: data.id,
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