import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { db } from "@/lib/db/turso";
import { fileUploads } from "@/lib/db/schema";
import { createCustomer, updateCustomerChurnScore } from "@/lib/db/queries";
import { eq } from "drizzle-orm";
import Papa from "papaparse";

function calculateChurnRisk(customerData: {
  lastActivityDate?: string | null;
  totalRevenue: number;
  supportTickets: number;
}): { churnScore: number; riskLevel: string; riskFactors: string[] } {
  let score = 0;
  const factors: string[] = [];

  if (customerData.lastActivityDate) {
    try {
      const lastActivity = new Date(customerData.lastActivityDate);
      const daysSinceActivity = Math.floor(
        (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceActivity > 90) {
        score += 40;
        factors.push(`${daysSinceActivity} days since last activity`);
      } else if (daysSinceActivity > 60) {
        score += 25;
        factors.push(`${daysSinceActivity} days since last activity`);
      } else if (daysSinceActivity > 30) {
        score += 15;
        factors.push(`${daysSinceActivity} days since last activity`);
      }
    } catch {
      score += 10;
      factors.push("Last activity date unknown or invalid");
    }
  } else {
    score += 35;
    factors.push("No recorded activity");
  }

  if (customerData.supportTickets > 10) {
    score += 30;
    factors.push(`High support ticket volume (${customerData.supportTickets})`);
  } else if (customerData.supportTickets > 5) {
    score += 20;
    factors.push(`Elevated support tickets (${customerData.supportTickets})`);
  } else if (customerData.supportTickets > 0) {
    score += 10;
  }

  if (customerData.totalRevenue === 0) {
    score += 15;
    factors.push("No revenue generated");
  } else if (customerData.totalRevenue < 100) {
    score += 10;
    factors.push(`Low revenue ($${customerData.totalRevenue.toFixed(2)})`);
  }

  score = Math.min(score, 100);

  let riskLevel: string;
  if (score >= 70) {
    riskLevel = "critical";
  } else if (score >= 50) {
    riskLevel = "high";
  } else if (score >= 30) {
    riskLevel = "medium";
  } else {
    riskLevel = "low";
  }

  return {
    churnScore: score,
    riskLevel,
    riskFactors: factors.length > 0 ? factors : ["No significant risk factors detected"],
  };
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (!file.name.endsWith(".csv")) {
      return NextResponse.json(
        { error: "Only CSV files are supported" },
        { status: 400 }
      );
    }

    const fileContent = await file.text();

    const uploadId = crypto.randomUUID();
    await db.insert(fileUploads).values({
      id: uploadId,
      userId: user.id,
      filename: file.name,
      fileType: "csv",
      fileSizeBytes: file.size,
      status: "processing",
      createdAt: new Date(),
    });

    const parseResult = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        const normalized = header.trim().toLowerCase();
        const mappings: Record<string, string> = {
          "name": "name",
          "customer_name": "name",
          "customer name": "name",
          "email": "email",
          "email_address": "email",
          "phone": "phone",
          "phone_number": "phone",
          "company": "company",
          "company_name": "company",
          "segment": "segment",
          "customer_segment": "segment",
          "last_activity_date": "last_activity_date",
          "last activity date": "last_activity_date",
          "last_activity": "last_activity_date",
          "total_revenue": "total_revenue",
          "total revenue": "total_revenue",
          "revenue": "total_revenue",
          "support_tickets": "support_tickets",
          "support tickets": "support_tickets",
          "tickets": "support_tickets",
        };
        return mappings[normalized] || normalized;
      },
    });

    const errors: Array<{ row: number; error: string }> = [];
    let imported = 0;
    let failed = 0;

    for (let i = 0; i < parseResult.data.length; i++) {
      const row = parseResult.data[i] as Record<string, string>;
      const rowNumber = i + 2; // header row + 1-based row labels in errors

      try {
        if (!row.name || !row.name.trim()) {
          errors.push({
            row: rowNumber,
            error: "Missing required field: name",
          });
          failed++;
          continue;
        }

        const customerData = {
          userId: user.id,
          name: row.name.trim(),
          email: row.email?.trim() || null,
          phone: row.phone?.trim() || null,
          company: row.company?.trim() || null,
          segment: row.segment?.trim().toLowerCase() || null,
          lastActivityDate: row.last_activity_date?.trim() || null,
          totalRevenue: row.total_revenue
            ? parseFloat(row.total_revenue)
            : 0,
          supportTickets: row.support_tickets
            ? parseInt(row.support_tickets, 10)
            : 0,
        };

        if (isNaN(customerData.totalRevenue)) {
          customerData.totalRevenue = 0;
        }
        if (isNaN(customerData.supportTickets)) {
          customerData.supportTickets = 0;
        }

        const customerId = await createCustomer(customerData);

        const riskAnalysis = calculateChurnRisk({
          lastActivityDate: customerData.lastActivityDate,
          totalRevenue: customerData.totalRevenue,
          supportTickets: customerData.supportTickets,
        });

        await updateCustomerChurnScore(
          customerId,
          riskAnalysis.churnScore,
          riskAnalysis.riskLevel,
          riskAnalysis.riskFactors
        );

        imported++;
      } catch (error: any) {
        errors.push({
          row: rowNumber,
          error: error.message || "Failed to import row",
        });
        failed++;
      }
    }

    await db
      .update(fileUploads)
      .set({
        status: "completed",
        recordsImported: imported,
        recordsFailed: failed,
        validationResults: JSON.stringify(errors),
        processedAt: new Date(),
      })
      .where(eq(fileUploads.id, uploadId));

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${imported} customers${failed > 0 ? `, ${failed} failed` : ""}`,
      results: {
        total: parseResult.data.length,
        imported,
        failed,
        errors: errors.slice(0, 10),
      },
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process file",
      },
      { status: 500 }
    );
  }
}
