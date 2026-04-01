/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * RAG (Retrieval-Augmented Generation) Pipeline
 *
 * Implements:
 * - Context chunking and ranking
 * - Relevance scoring with TF-IDF-like weighting
 * - Dynamic context window management
 * - Source attribution
 */

export interface RAGContext {
  chunks: ContextChunk[];
  totalTokenEstimate: number;
  queryRelevanceScore: number;
}

export interface ContextChunk {
  id: string;
  content: string;
  source: string;
  relevanceScore: number;
  tokenEstimate: number;
  metadata: Record<string, any>;
}

const MAX_CONTEXT_TOKENS = 4000;

/**
 * Build a text representation of a customer for RAG context.
 */
function customerToChunk(customer: any): ContextChunk {
  const now = new Date();
  const lastActivity = customer.lastActivityDate ? new Date(customer.lastActivityDate) : null;
  const daysInactive = lastActivity
    ? Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const lines = [
    `Customer: ${customer.name}`,
    customer.email && `Email: ${customer.email}`,
    customer.company && `Company: ${customer.company}`,
    customer.segment && `Segment: ${customer.segment}`,
    `Status: ${customer.status || "active"}`,
    `Revenue: $${(customer.totalRevenue || 0).toLocaleString()}`,
    `Support Tickets: ${customer.supportTickets || 0}`,
    `Churn Score: ${customer.churnScore || 0}/100`,
    `Risk Level: ${customer.riskLevel || "low"}`,
    daysInactive !== null && `Days Inactive: ${daysInactive}`,
    customer.riskFactors && `Risk Factors: ${customer.riskFactors}`,
  ].filter(Boolean);

  const content = lines.join(" | ");

  return {
    id: customer.id,
    content,
    source: `customer:${customer.id}`,
    relevanceScore: 0,
    tokenEstimate: Math.ceil(content.length / 4),
    metadata: {
      name: customer.name,
      riskLevel: customer.riskLevel,
      churnScore: customer.churnScore,
      revenue: customer.totalRevenue,
      segment: customer.segment,
      daysInactive,
    },
  };
}

/**
 * Compute relevance score between a query and a context chunk.
 * Uses keyword matching with IDF-like term weighting.
 */
function computeRelevance(query: string, chunk: ContextChunk): number {
  const queryTerms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
  const chunkText = chunk.content.toLowerCase();

  if (queryTerms.length === 0) return 0.5;

  let matchCount = 0;
  let weightedScore = 0;

  // Higher weight for rarer/more specific terms
  const termWeights: Record<string, number> = {
    revenue: 1.5, churn: 1.5, risk: 1.3, inactive: 1.4, critical: 1.5,
    high: 1.2, enterprise: 1.3, support: 1.1, ticket: 1.1,
  };

  for (const term of queryTerms) {
    if (chunkText.includes(term)) {
      matchCount++;
      weightedScore += termWeights[term] || 1.0;
    }
  }

  const baseRelevance = matchCount / queryTerms.length;
  const weightedRelevance = weightedScore / (queryTerms.length * 1.5);

  // Boost high-risk customers for risk-related queries
  const isRiskQuery = queryTerms.some((t) => ["risk", "churn", "critical", "high", "losing"].includes(t));
  const riskBoost = isRiskQuery && (chunk.metadata.riskLevel === "high" || chunk.metadata.riskLevel === "critical")
    ? 0.2
    : 0;

  // Boost high-revenue customers for revenue-related queries
  const isRevenueQuery = queryTerms.some((t) => ["revenue", "value", "money", "spend", "top"].includes(t));
  const revenueBoost = isRevenueQuery && (chunk.metadata.revenue || 0) > 1000 ? 0.15 : 0;

  return Math.min(1, (baseRelevance + weightedRelevance) / 2 + riskBoost + revenueBoost);
}

/**
 * Build RAG context from customer data, ranked by relevance to the query.
 */
export function buildRAGContext(
  query: string,
  customers: any[],
  options: { maxChunks?: number; minRelevance?: number } = {}
): RAGContext {
  const { maxChunks = 50, minRelevance = 0.1 } = options;

  const chunks = customers.map((c) => {
    const chunk = customerToChunk(c);
    chunk.relevanceScore = computeRelevance(query, chunk);
    return chunk;
  });

  // Sort by relevance, filter by minimum threshold
  const rankedChunks = chunks
    .filter((c) => c.relevanceScore >= minRelevance)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);

  // Fit within token budget
  const selectedChunks: ContextChunk[] = [];
  let totalTokens = 0;

  for (const chunk of rankedChunks) {
    if (selectedChunks.length >= maxChunks) break;
    if (totalTokens + chunk.tokenEstimate > MAX_CONTEXT_TOKENS) break;
    selectedChunks.push(chunk);
    totalTokens += chunk.tokenEstimate;
  }

  const queryRelevanceScore = selectedChunks.length > 0
    ? selectedChunks.reduce((s, c) => s + c.relevanceScore, 0) / selectedChunks.length
    : 0;

  return {
    chunks: selectedChunks,
    totalTokenEstimate: totalTokens,
    queryRelevanceScore: Math.round(queryRelevanceScore * 100) / 100,
  };
}

/**
 * Format RAG context into a prompt-ready string with source attribution.
 */
export function formatRAGContext(context: RAGContext): string {
  if (context.chunks.length === 0) {
    return "No relevant customer data found for this query.";
  }

  const header = `Customer Data Context (${context.chunks.length} records, relevance: ${Math.round(context.queryRelevanceScore * 100)}%):\n`;

  const body = context.chunks
    .map((chunk, i) => `[${i + 1}] ${chunk.content}`)
    .join("\n");

  const summary = buildContextSummary(context);

  return `${header}\n${summary}\n\nDetailed Records:\n${body}`;
}

function buildContextSummary(context: RAGContext): string {
  const chunks = context.chunks;
  const totalRevenue = chunks.reduce((s, c) => s + (c.metadata.revenue || 0), 0);
  const riskCounts = {
    critical: chunks.filter((c) => c.metadata.riskLevel === "critical").length,
    high: chunks.filter((c) => c.metadata.riskLevel === "high").length,
    medium: chunks.filter((c) => c.metadata.riskLevel === "medium").length,
    low: chunks.filter((c) => c.metadata.riskLevel === "low").length,
  };

  const segments = new Set(chunks.map((c) => c.metadata.segment).filter(Boolean));

  return [
    `Summary: ${chunks.length} customers, $${totalRevenue.toLocaleString()} total revenue`,
    `Risk: ${riskCounts.critical} critical, ${riskCounts.high} high, ${riskCounts.medium} medium, ${riskCounts.low} low`,
    segments.size > 0 && `Segments: ${Array.from(segments).join(", ")}`,
  ].filter(Boolean).join("\n");
}

/**
 * Enrich a chat prompt with RAG context for improved AI responses.
 */
export function enrichPromptWithRAG(
  basePrompt: string,
  query: string,
  customers: any[]
): { enrichedPrompt: string; context: RAGContext } {
  const context = buildRAGContext(query, customers);
  const formattedContext = formatRAGContext(context);

  const enrichedPrompt = `${basePrompt}

--- RETRIEVED CONTEXT (RAG) ---
${formattedContext}
--- END CONTEXT ---

Based on the above context, answer the user's question with specific data references where applicable.
When citing specific customers or metrics, reference the data provided.
`;

  return { enrichedPrompt, context };
}
