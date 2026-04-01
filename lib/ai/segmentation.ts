/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Smart Customer Segmentation Engine
 *
 * Implements:
 * - RFM (Recency, Frequency, Monetary) Analysis
 * - Behavioral Cohort Clustering
 * - Value-based Tiering
 * - Lifecycle Stage Detection
 */

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  customerCount: number;
  avgRevenue: number;
  avgChurnScore: number;
  characteristics: string[];
  recommendedStrategy: string;
  color: string;
}

export interface RFMScore {
  customerId: string;
  recency: number;       // 1-5 (5 = most recent)
  frequency: number;     // 1-5 (5 = most frequent)
  monetary: number;       // 1-5 (5 = highest spender)
  rfmScore: string;       // e.g. "555", "111"
  segment: string;        // e.g. "Champions", "At Risk"
}

export interface LifecycleStage {
  stage: "new" | "onboarding" | "growing" | "mature" | "declining" | "churning" | "churned";
  confidence: number;
  daysSinceStart: number;
  description: string;
}

function quintile(value: number, sortedValues: number[]): number {
  if (sortedValues.length === 0) return 3;
  const index = sortedValues.findIndex((v) => v >= value);
  if (index === -1) return 5;
  const percentile = index / sortedValues.length;
  if (percentile <= 0.2) return 1;
  if (percentile <= 0.4) return 2;
  if (percentile <= 0.6) return 3;
  if (percentile <= 0.8) return 4;
  return 5;
}

function rfmSegmentName(r: number, f: number, m: number): string {
  if (r >= 4 && f >= 4 && m >= 4) return "Champions";
  if (r >= 4 && f >= 3 && m >= 3) return "Loyal Customers";
  if (r >= 3 && f >= 1 && m >= 4) return "Big Spenders";
  if (r >= 4 && f <= 2 && m <= 2) return "Recent Customers";
  if (r >= 3 && f >= 3 && m >= 2) return "Potential Loyalists";
  if (r <= 2 && f >= 3 && m >= 3) return "At Risk";
  if (r <= 2 && f >= 4 && m >= 4) return "Can't Lose Them";
  if (r <= 2 && f <= 2 && m >= 3) return "Hibernating";
  if (r <= 2 && f <= 2 && m <= 2) return "Lost";
  if (r >= 3 && f >= 2) return "Need Attention";
  return "Others";
}

/**
 * Compute RFM scores for all customers.
 */
export function computeRFMScores(customers: any[]): RFMScore[] {
  const now = Date.now();

  // Calculate raw values
  const rawData = customers.map((c) => {
    const lastActivity = c.lastActivityDate ? new Date(c.lastActivityDate) : null;
    const daysInactive = lastActivity
      ? Math.floor((now - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    return {
      id: c.id,
      // Recency: inverse of days since last activity (lower days = better)
      recencyDays: daysInactive,
      // Frequency: proxy from support tickets + activity signals
      frequencyScore: (c.supportTickets || 0) + (daysInactive < 30 ? 2 : 0),
      // Monetary: total revenue
      monetaryValue: c.totalRevenue || 0,
    };
  });

  const sortedRecency = rawData.map((d) => d.recencyDays).sort((a, b) => a - b);
  const sortedFrequency = rawData.map((d) => d.frequencyScore).sort((a, b) => a - b);
  const sortedMonetary = rawData.map((d) => d.monetaryValue).sort((a, b) => a - b);

  return rawData.map((d) => {
    // Recency is inverted — lower days = higher score
    const r = 6 - quintile(d.recencyDays, sortedRecency);
    const f = quintile(d.frequencyScore, sortedFrequency);
    const m = quintile(d.monetaryValue, sortedMonetary);

    return {
      customerId: d.id,
      recency: Math.max(1, Math.min(5, r)),
      frequency: f,
      monetary: m,
      rfmScore: `${Math.max(1, Math.min(5, r))}${f}${m}`,
      segment: rfmSegmentName(Math.max(1, Math.min(5, r)), f, m),
    };
  });
}

/**
 * Detect customer lifecycle stage based on account age and behavior.
 */
export function detectLifecycleStage(customer: any): LifecycleStage {
  const now = Date.now();
  const createdAt = customer.createdAt ? new Date(customer.createdAt).getTime() : now;
  const daysSinceStart = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));

  const lastActivity = customer.lastActivityDate ? new Date(customer.lastActivityDate) : null;
  const daysInactive = lastActivity
    ? Math.floor((now - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  const churnScore = customer.churnScore || 0;
  const revenue = customer.totalRevenue || 0;

  if (daysInactive > 90 || (churnScore >= 85 && daysInactive > 60)) {
    return { stage: "churned", confidence: 0.9, daysSinceStart, description: "Customer has effectively churned" };
  }
  if (churnScore >= 70 || (daysInactive > 45 && revenue > 0)) {
    return { stage: "churning", confidence: 0.8, daysSinceStart, description: "High churn risk — showing disengagement signals" };
  }
  if (daysInactive > 30 && daysSinceStart > 180) {
    return { stage: "declining", confidence: 0.7, daysSinceStart, description: "Previously active customer now declining" };
  }
  if (daysSinceStart > 180 && daysInactive <= 14) {
    return { stage: "mature", confidence: 0.85, daysSinceStart, description: "Established, consistently active customer" };
  }
  if (daysSinceStart > 30 && revenue > 0 && daysInactive <= 14) {
    return { stage: "growing", confidence: 0.8, daysSinceStart, description: "Active and generating revenue — growth phase" };
  }
  if (daysSinceStart > 7 && daysSinceStart <= 30) {
    return { stage: "onboarding", confidence: 0.75, daysSinceStart, description: "In onboarding phase — critical adoption period" };
  }
  return { stage: "new", confidence: 0.9, daysSinceStart, description: "Newly acquired customer" };
}

/**
 * Cluster customers into behavioral segments.
 */
export function clusterCustomers(customers: any[]): CustomerSegment[] {
  const rfmScores = computeRFMScores(customers);
  const rfmMap = new Map(rfmScores.map((r) => [r.customerId, r]));

  const segmentGroups = new Map<string, any[]>();
  for (const customer of customers) {
    const rfm = rfmMap.get(customer.id);
    const segmentName = rfm?.segment || "Others";
    if (!segmentGroups.has(segmentName)) segmentGroups.set(segmentName, []);
    segmentGroups.get(segmentName)!.push(customer);
  }

  const segmentColors: Record<string, string> = {
    Champions: "#10b981",
    "Loyal Customers": "#3b82f6",
    "Big Spenders": "#8b5cf6",
    "Recent Customers": "#06b6d4",
    "Potential Loyalists": "#14b8a6",
    "At Risk": "#f59e0b",
    "Can't Lose Them": "#ef4444",
    Hibernating: "#6b7280",
    Lost: "#374151",
    "Need Attention": "#f97316",
    Others: "#9ca3af",
  };

  const strategies: Record<string, string> = {
    Champions: "Reward loyalty, ask for referrals, early access to new features",
    "Loyal Customers": "Upsell premium plans, exclusive content, loyalty program",
    "Big Spenders": "Provide VIP support, dedicated CSM, premium features",
    "Recent Customers": "Optimize onboarding, send welcome sequences, provide tutorials",
    "Potential Loyalists": "Engage with targeted campaigns, offer incentives to increase frequency",
    "At Risk": "Immediate re-engagement, personalized win-back campaigns",
    "Can't Lose Them": "Urgent executive outreach, exclusive retention offers",
    Hibernating: "Re-activation campaigns with strong incentives",
    Lost: "Win-back campaigns, exit surveys, last-chance offers",
    "Need Attention": "Check in regularly, gather feedback, identify barriers",
    Others: "Standard engagement campaigns",
  };

  return Array.from(segmentGroups.entries())
    .map(([name, members]) => ({
      id: name.toLowerCase().replace(/\s+/g, "-").replace(/'/g, ""),
      name,
      description: strategies[name] || "Standard engagement",
      customerCount: members.length,
      avgRevenue: Math.round(members.reduce((s, c) => s + (c.totalRevenue || 0), 0) / members.length),
      avgChurnScore: Math.round(members.reduce((s, c) => s + (c.churnScore || 0), 0) / members.length),
      characteristics: getSegmentCharacteristics(name, members),
      recommendedStrategy: strategies[name] || "Standard engagement",
      color: segmentColors[name] || "#9ca3af",
    }))
    .sort((a, b) => b.customerCount - a.customerCount);
}

function getSegmentCharacteristics(segment: string, members: any[]): string[] {
  const avgRevenue = members.reduce((s, c) => s + (c.totalRevenue || 0), 0) / members.length;
  const avgTickets = members.reduce((s, c) => s + (c.supportTickets || 0), 0) / members.length;

  const chars: string[] = [];
  chars.push(`${members.length} customers`);
  chars.push(`Avg revenue: $${Math.round(avgRevenue).toLocaleString()}`);
  if (avgTickets > 3) chars.push("High support engagement");
  if (avgRevenue > 5000) chars.push("High-value accounts");
  if (avgRevenue < 100) chars.push("Low monetization");

  return chars;
}
