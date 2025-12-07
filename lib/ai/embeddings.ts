// ============================================
// EMBEDDING HELPER FUNCTIONS
// ============================================
// Helper functions for creating customer embeddings

import { createEmbedding } from "./gemini";
import { Customer } from "@/types/database";

// ============================================
// CREATE CUSTOMER TEXT SUMMARY
// ============================================
// Creates a text summary of customer for embedding
export function createCustomerSummary(customer: Customer): string {
  // Build text representation of customer
  const parts = [
    `Customer name: ${customer.name}`,
    customer.email ? `Email: ${customer.email}` : "",
    customer.company ? `Company: ${customer.company}` : "",
    customer.segment ? `Segment: ${customer.segment}` : "",
    customer.lastActivityDate
      ? `Last active: ${customer.lastActivityDate}`
      : "Last activity: unknown",
    `Total revenue: $${customer.totalRevenue}`,
    `Support tickets: ${customer.supportTickets}`,
    customer.churnScore
      ? `Churn risk: ${customer.churnScore}/100 (${customer.riskLevel})`
      : "",
  ];

  // Join non-empty parts
  return parts.filter(Boolean).join(". ");
}

// ============================================
// CREATE CUSTOMER EMBEDDING
// ============================================
// Creates vector embedding for a customer
export async function createCustomerEmbedding(
  customer: Customer
): Promise<number[]> {
  // Create text summary
  const summary = createCustomerSummary(customer);

  // Generate embedding
  const embedding = await createEmbedding(summary);

  return embedding;
}

// ============================================
// CREATE QUERY EMBEDDING
// ============================================
// Creates embedding for user's search query
export async function createQueryEmbedding(
  query: string
): Promise<number[]> {
  // Generate embedding directly from query
  const embedding = await createEmbedding(query);

  return embedding;
}