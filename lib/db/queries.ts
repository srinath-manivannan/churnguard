/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "./turso";
import { customers, campaigns, chatHistory } from "./schema";
import { eq, and, desc, gte, sql } from "drizzle-orm";
import type { NewCustomer, Customer } from "@/types/database";

// -- Customer queries ----------------------------------------------------------

export async function getCustomers(userId: string) {
  return db
    .select()
    .from(customers)
    .where(eq(customers.userId, userId))
    .orderBy(desc(customers.churnScore));
}

export async function getCustomerById(customerId: string, userId: string) {
  const [customer] = await db
    .select()
    .from(customers)
    .where(and(eq(customers.id, customerId), eq(customers.userId, userId)))
    .limit(1);

  return customer;
}

export async function createCustomer(data: NewCustomer) {
  const customerId = crypto.randomUUID();

  await db.insert(customers).values({
    id: customerId,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return customerId;
}

export async function updateCustomer(
  customerId: string,
  userId: string,
  data: Partial<Customer>
) {
  await db
    .update(customers)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(customers.id, customerId), eq(customers.userId, userId)));
}

export async function updateCustomerChurnScore(
  customerId: string,
  churnScore: number,
  riskLevel: string,
  riskFactors?: string[]
) {
  await db
    .update(customers)
    .set({
      churnScore,
      riskLevel,
      riskFactors: riskFactors ? JSON.stringify(riskFactors) : null,
      updatedAt: new Date(),
    })
    .where(eq(customers.id, customerId));
}

export async function deleteCustomer(customerId: string, userId: string) {
  await db
    .delete(customers)
    .where(and(eq(customers.id, customerId), eq(customers.userId, userId)));
}

export async function getCustomersByRiskLevel(userId: string, riskLevel: string) {
  return db
    .select()
    .from(customers)
    .where(and(eq(customers.userId, userId), eq(customers.riskLevel, riskLevel)))
    .orderBy(desc(customers.churnScore));
}

export async function searchCustomers(userId: string, searchQuery: string) {
  return db
    .select()
    .from(customers)
    .where(
      and(
        eq(customers.userId, userId),
        sql`(${customers.name} LIKE ${"%" + searchQuery + "%"} OR ${customers.email} LIKE ${"%" + searchQuery + "%"})`
      )
    )
    .limit(20);
}

// -- Campaign queries ----------------------------------------------------------

export async function getCampaigns(userId: string) {
  return db
    .select()
    .from(campaigns)
    .where(eq(campaigns.userId, userId))
    .orderBy(desc(campaigns.createdAt));
}

export async function getCampaignById(campaignId: string, userId: string) {
  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, campaignId), eq(campaigns.userId, userId)))
    .limit(1);

  return campaign;
}

export async function createCampaign(data: any) {
  const campaignId = crypto.randomUUID();

  await db.insert(campaigns).values({
    id: campaignId,
    ...data,
    createdAt: new Date(),
  });

  return campaignId;
}

// -- Chat history queries ------------------------------------------------------

export async function getChatHistory(userId: string, limit: number = 10) {
  return db
    .select()
    .from(chatHistory)
    .where(eq(chatHistory.userId, userId))
    .orderBy(desc(chatHistory.createdAt))
    .limit(limit);
}

export async function saveChatMessage(
  userId: string,
  userMessage: string,
  aiResponse: string,
  contextUsed?: any
) {
  const id = crypto.randomUUID();

  await db.insert(chatHistory).values({
    id,
    userId,
    userMessage,
    aiResponse,
    contextUsed: contextUsed ? JSON.stringify(contextUsed) : null,
    createdAt: new Date(),
  });

  return id;
}

// -- Dashboard stats -----------------------------------------------------------

export async function getDashboardStats(userId: string) {
  const [totalResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(customers)
    .where(eq(customers.userId, userId));

  const [highRiskResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(customers)
    .where(and(eq(customers.userId, userId), gte(customers.churnScore, 70)));

  const [revenueResult] = await db
    .select({ sum: sql<number>`sum(${customers.totalRevenue})` })
    .from(customers)
    .where(and(eq(customers.userId, userId), gte(customers.churnScore, 70)));

  const [campaignsResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(campaigns)
    .where(
      and(
        eq(campaigns.userId, userId),
        sql`${campaigns.status} IN ('sending', 'scheduled')`
      )
    );

  return {
    totalCustomers: totalResult?.count || 0,
    highRiskCount: highRiskResult?.count || 0,
    revenueAtRisk: revenueResult?.sum || 0,
    activeCampaigns: campaignsResult?.count || 0,
  };
}
