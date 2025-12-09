/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================
// LOOKER STUDIO AUTO-SYNC JOB
// Automatically exports data to Google Sheets
// ============================================

import { db } from "@/lib/db/turso";
import { customers } from "@/lib/db/schema";
import { google } from "googleapis";

// ============================================
// GOOGLE SHEETS SETUP
// ============================================
async function getGoogleSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_EMAIL,
      private_key: process.env.GOOGLE_SERVICE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  return sheets;
}

// ============================================
// EXPORT TO GOOGLE SHEETS
// ============================================
export async function exportToGoogleSheets() {
  try {
    console.log("📊 Starting auto-export to Google Sheets...");

    // 1. Fetch all customer data
    const customersData = await db.select().from(customers);

    // 2. Format data for Google Sheets - ✅ Complete with all churn fields
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

    const rows = customersData.map((c) => [
      c.id,
      c.userId,
      c.externalId || "",
      c.name,
      c.email || "",
      c.phone || "",
      c.company || "",
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
    ]);

    // 3. Upload to Google Sheets
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

    if (!spreadsheetId) {
      throw new Error("GOOGLE_SHEETS_ID not set in environment variables");
    }

    // Clear existing data (17 columns: A to Q)
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: "Sheet1!A:Q",
    });

    // Write new data
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Sheet1!A1",
      valueInputOption: "RAW",
      requestBody: {
        values: [headers, ...rows],
      },
    });

    console.log("✅ Data exported to Google Sheets successfully!");
    console.log(`📝 Exported ${customersData.length} customers`);

    return {
      success: true,
      recordCount: customersData.length,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error("❌ Export failed:", error);
    throw error;
  }
}

// ============================================
// AUTO-SYNC SCHEDULER
// ============================================
export async function startAutoSync() {
  console.log("🔄 Starting Looker Studio auto-sync scheduler...");

  // Initial sync
  await exportToGoogleSheets();

  // Schedule hourly sync
  setInterval(
    async () => {
      console.log("⏰ Running scheduled sync...");
      await exportToGoogleSheets();
    },
    60 * 60 * 1000
  ); // Every hour

  console.log("✅ Auto-sync scheduler started!");
}