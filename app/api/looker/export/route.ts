/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { db } from "@/lib/db/turso";
import { customers } from "@/lib/db/schema";

export async function GET() {
  try {
    // Fetch all customers
    const customersData = await db.select().from(customers);

    // ✅ Complete headers with ALL schema fields
    const headers = [
      "ID",
      "User ID",
      "External ID",
      "Name",
      "Email",
      "Phone",
      "Company",
      "Segment",
      "Status",
      "Last Activity Date",
      "Total Revenue",
      "Support Tickets",
      "Churn Score",
      "Risk Level",
      "Risk Factors",
      "Created At",
      "Updated At",
    ];

    const csvRows = [
      headers.join(","),
      ...customersData.map((c) =>
        [
          c.id,
          c.userId,
          c.externalId || "",
          `"${c.name}"`, // Quote to handle commas
          c.email || "",
          c.phone || "",
          `"${c.company || ""}"`,
          c.segment || "",
          c.status || "active",
          c.lastActivityDate || "",
          c.totalRevenue || 0,
          c.supportTickets || 0,
          c.churnScore || 0,
          c.riskLevel || "low",
          c.riskFactors || "",
          c.createdAt?.toISOString() || "",
          c.updatedAt?.toISOString() || "",
        ].join(",")
      ),
    ];

    const csv = csvRows.join("\n");

    // Return as downloadable CSV
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=churnguard-customers.csv",
      },
    });
  } catch (error: any) {
    console.error("Export error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}