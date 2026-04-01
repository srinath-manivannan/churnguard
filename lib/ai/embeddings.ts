import { createEmbedding } from "./gemini";
import { Customer } from "@/types/database";

export function createCustomerSummary(customer: Customer): string {
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

  return parts.filter(Boolean).join(". ");
}

export async function createCustomerEmbedding(
  customer: Customer
): Promise<number[]> {
  const summary = createCustomerSummary(customer);

  const embedding = await createEmbedding(summary);

  return embedding;
}

export async function createQueryEmbedding(
  query: string
): Promise<number[]> {
  const embedding = await createEmbedding(query);

  return embedding;
}
