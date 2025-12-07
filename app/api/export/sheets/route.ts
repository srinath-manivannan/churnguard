// import { NextRequest, NextResponse } from "next/server";
// import { requireAuth } from "@/lib/auth/session";
// import { db } from "@/lib/db/turso";
// import { customers, campaigns } from "@/lib/db/schema";
// import { eq } from "drizzle-orm";

// export async function GET(request: NextRequest) {
//   try {
//     const user = await requireAuth();

//     // Get all customer data
//     const customersData = await db
//       .select()
//       .from(customers)
//       .where(eq(customers.userId, user.id))
//       .all();

//     // Get campaign stats
//     const campaignsData = await db
//       .select()
//       .from(campaigns)
//       .where(eq(campaigns.userId, user.id))
//       .all();

//     // Format for export
//     const csv = customersData.map(c => ({
//       name: c.name,
//       email: c.email,
//       status: c.status || "active",
//       churnScore: c.churnScore || 0,
//       riskLevel: c.riskLevel || "low",
//       totalRevenue: c.totalRevenue || 0,
//       lastActivityDate: c.lastActivityDate,
//     }));

//     return NextResponse.json({
//       customers: csv,
//       campaigns: campaignsData,
//       summary: {
//         totalCustomers: customersData.length,
//         highRisk: customersData.filter(
//           c => c.riskLevel === "high" || c.riskLevel === "critical"
//         ).length,
//         totalRevenue: customersData.reduce(
//           (sum, c) => sum + (c.totalRevenue || 0), 
//           0
//         ),
//       }
//     });
//   } catch (error) {
//     console.error("Export error:", error);
//     return NextResponse.json(
//       { error: "Failed to export data" },
//       { status: 500 }
//     );
//   }
// }

export const dynamic = "force-dynamic"; // 👈 tell Next this is dynamic
export const revalidate = 0;            // optional, but makes it clearly non-static

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { db } from "@/lib/db/turso";
import { customers, campaigns } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const customersData = await db
      .select()
      .from(customers)
      .where(eq(customers.userId, user.id));

    const campaignsData = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.userId, user.id));

    const csv = customersData.map((c) => ({
      name: c.name,
      email: c.email,
      status: c.status || "active",
      churnScore: c.churnScore || 0,
      riskLevel: c.riskLevel || "low",
      totalRevenue: c.totalRevenue || 0,
      lastActivityDate: c.lastActivityDate,
    }));

    return NextResponse.json({
      customers: csv,
      campaigns: campaignsData,
      summary: {
        totalCustomers: customersData.length,
        highRisk: customersData.filter(
          (c) => c.riskLevel === "high" || c.riskLevel === "critical"
        ).length,
        totalRevenue: customersData.reduce(
          (sum, c) => sum + (c.totalRevenue || 0),
          0
        ),
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
