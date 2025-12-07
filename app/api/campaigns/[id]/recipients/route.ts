import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { db } from "@/lib/db/turso";
import { campaigns, campaignRecipients, customers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// Add recipients to campaign
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const { customerIds } = await request.json();

    // Verify campaign belongs to user
    const campaign = await db
      .select()
      .from(campaigns)
      .where(and(eq(campaigns.id, params.id), eq(campaigns.userId, user.id)))
      .get();

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Add recipients
    const recipients = customerIds.map((customerId: string) => ({
      id: crypto.randomUUID(),
      campaignId: params.id,
      customerId: customerId,
      status: "pending" as const,
      createdAt: new Date(),
    }));

    await db.insert(campaignRecipients).values(recipients);

    // Update campaign recipient count
    const totalRecipients = await db
      .select()
      .from(campaignRecipients)
      .where(eq(campaignRecipients.campaignId, params.id))
      .all();

    await db
      .update(campaigns)
      .set({ recipientCount: totalRecipients.length })
      .where(eq(campaigns.id, params.id));

    return NextResponse.json({
      success: true,
      message: `Added ${recipients.length} recipients`,
    });
  } catch (error) {
    console.error("Add recipients error:", error);
    return NextResponse.json(
      { error: "Failed to add recipients" },
      { status: 500 }
    );
  }
}