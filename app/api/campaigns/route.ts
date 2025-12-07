/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================
// CAMPAIGNS API
// ============================================
// GET /api/campaigns - List campaigns
// POST /api/campaigns - Create campaign

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { getCampaigns, createCampaign } from "@/lib/db/queries";

// ============================================
// GET - List all campaigns
// ============================================
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const campaigns = await getCampaigns(user.id);

    return NextResponse.json({
      success: true,
      campaigns,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to get campaigns" },
      { status: 401 }
    );
  }
}

// ============================================
// POST - Create campaign
// ============================================
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const campaignId = await createCampaign({
      userId: user.id,
      name: body.name,
      type: body.type,
      status: "draft",
      targetFilter: body.targetFilter,
      emailSubject: body.emailSubject,
      emailTemplate: body.emailTemplate,
      smsTemplate: body.smsTemplate,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Campaign created successfully",
        campaignId,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create campaign" },
      { status: 500 }
    );
  }
}