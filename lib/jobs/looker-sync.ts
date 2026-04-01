/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/lib/db/turso";
import { customers } from "@/lib/db/schema";
import { google } from "googleapis";

async function getGoogleSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_EMAIL,
      private_key: process.env.GOOGLE_SERVICE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
}

export async function exportToGoogleSheets() {
  const customersData = await db.select().from(customers);

  const headers = [
    "ID", "User ID", "External ID", "Name", "Email", "Phone",
    "Company", "Segment", "Status", "Last Activity Date",
    "Total Revenue", "Support Tickets", "Churn Score", "Risk Level",
    "Risk Factors", "Created At", "Updated At",
  ];

  const rows = customersData.map((c) => [
    c.id, c.userId, c.externalId || "", c.name, c.email || "",
    c.phone || "", c.company || "", c.segment || "", c.status || "active",
    c.lastActivityDate || "", c.totalRevenue || 0, c.supportTickets || 0,
    c.churnScore || 0, c.riskLevel || "low", c.riskFactors || "",
    c.createdAt?.toISOString() || "", c.updatedAt?.toISOString() || "",
  ]);

  const sheets = await getGoogleSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

  if (!spreadsheetId) {
    throw new Error("GOOGLE_SHEETS_ID not set in environment variables");
  }

  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: "Sheet1!A:Q",
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "Sheet1!A1",
    valueInputOption: "RAW",
    requestBody: { values: [headers, ...rows] },
  });

  return {
    success: true,
    recordCount: customersData.length,
    timestamp: new Date().toISOString(),
  };
}

export async function startAutoSync() {
  await exportToGoogleSheets();

  setInterval(async () => {
    await exportToGoogleSheets();
  }, 60 * 60 * 1000);
}
