import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { db } from "@/lib/db/turso";
import { campaigns, campaignRecipients, customers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { sendEmail } from "@/lib/email"; // ✅ Use Gmail

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    const campaign = await db
      .select()
      .from(campaigns)
      .where(
        and(
          eq(campaigns.id, params.id),
          eq(campaigns.userId, user.id)
        )
      )
      .get();

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    if (!campaign.subject || !campaign.content) {
      return NextResponse.json(
        { error: "Campaign missing subject or content" },
        { status: 400 }
      );
    }

    const recipients = await db
      .select({
        recipient: campaignRecipients,
        customer: customers,
      })
      .from(campaignRecipients)
      .innerJoin(customers, eq(campaignRecipients.customerId, customers.id))
      .where(
        and(
          eq(campaignRecipients.campaignId, params.id),
          eq(campaignRecipients.status, "pending")
        )
      )
      .all();

    if (recipients.length === 0) {
      return NextResponse.json(
        { error: "No recipients to send to" },
        { status: 400 }
      );
    }

    // Create summary for logged-in user
    const customerList = recipients
      .map((r, i) => `${i + 1}. ${r.customer.name} (${r.customer.email})`)
      .join("\n");

    const summaryHTML = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; border: 1px solid #e5e7eb;">
            <h1 style="color: #3b82f6;">📧 Campaign Sent Successfully!</h1>
            <p><strong>Campaign:</strong> ${campaign.name}</p>
            <p><strong>Subject:</strong> ${campaign.subject}</p>
            <p><strong>Recipients:</strong> ${recipients.length} customers</p>
            <p><strong>Sent At:</strong> ${new Date().toLocaleString()}</p>
            
            <div style="background: #f9fafb; padding: 20px; margin: 20px 0; border-radius: 8px;">
              <h3>Recipients List:</h3>
              <pre style="font-size: 12px; white-space: pre-wrap;">${customerList}</pre>
            </div>

            <div style="background: #f9fafb; padding: 20px; margin: 20px 0; border-radius: 8px;">
              <h3>Message Content:</h3>
              <div>${campaign.content}</div>
            </div>
          </div>
        </body>
      </html>
    `;

    // ✅ Send summary to logged-in user
    if (user.email) {
      try {
        await sendEmail({
          to: user.email,
          subject: `✅ Campaign Sent: ${campaign.name}`,
          html: summaryHTML,
        });
        console.log("✅ Summary email sent to:", user.email);
      } catch (error) {
        console.error("Failed to send summary email:", error);
      }
    }

    // Mark recipients as sent
    let sent = 0;
    let failed = 0;

    for (const { recipient, customer } of recipients) {
      if (!customer.email) {
        await db
          .update(campaignRecipients)
          .set({ 
            status: "failed",
            errorMessage: "No email address"
          })
          .where(eq(campaignRecipients.id, recipient.id));
        failed++;
        continue;
      }

      try {
        await db
          .update(campaignRecipients)
          .set({
            status: "sent",
            sentAt: new Date(),
          })
          .where(eq(campaignRecipients.id, recipient.id));

        sent++;
      } catch (error: any) {
        await db
          .update(campaignRecipients)
          .set({ 
            status: "failed",
            errorMessage: error.message || "Unknown error"
          })
          .where(eq(campaignRecipients.id, recipient.id));
        
        failed++;
      }
    }

    // Update campaign status
    await db
      .update(campaigns)
      .set({
        status: "sent",
        sentAt: new Date(),
        sentCount: sent,
      })
      .where(eq(campaigns.id, params.id));

    return NextResponse.json({
      success: true,
      message: `Campaign sent! Summary emailed to ${user.email}`,
      stats: {
        sent,
        failed,
        total: recipients.length,
      }
    });
  } catch (error) {
    console.error("Send campaign error:", error);
    return NextResponse.json(
      { error: "Failed to send campaign" },
      { status: 500 }
    );
  }
}