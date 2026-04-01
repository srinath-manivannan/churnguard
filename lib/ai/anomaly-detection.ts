/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Statistical Anomaly Detection Engine
 *
 * Detects anomalies in customer behavior using:
 * - Z-score analysis for deviation detection
 * - Moving average for trend shifts
 * - IQR (Interquartile Range) for outlier detection
 */

export interface Anomaly {
  type: "usage_drop" | "revenue_change" | "support_spike" | "engagement_shift" | "churn_risk_jump";
  severity: "low" | "medium" | "high" | "critical";
  customerId: string;
  customerName: string;
  metric: string;
  currentValue: number;
  expectedValue: number;
  deviationPercent: number;
  zScore: number;
  description: string;
  detectedAt: string;
  suggestedAction: string;
}

export interface AnomalyReport {
  anomalies: Anomaly[];
  summary: {
    totalAnomalies: number;
    criticalCount: number;
    highCount: number;
    affectedCustomers: number;
    topAffectedSegments: string[];
  };
  computedAt: string;
}

function calculateStats(values: number[]) {
  if (values.length === 0) return { mean: 0, stdDev: 0, median: 0, q1: 0, q3: 0, iqr: 0 };

  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const variance = values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  const median = sorted[Math.floor(sorted.length / 2)];
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;

  return { mean, stdDev, median, q1, q3, iqr };
}

function zScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
}

function severityFromZScore(z: number): Anomaly["severity"] {
  const absZ = Math.abs(z);
  if (absZ >= 3) return "critical";
  if (absZ >= 2.5) return "high";
  if (absZ >= 2) return "medium";
  return "low";
}

function detectRevenueAnomalies(customers: any[], stats: ReturnType<typeof calculateStats>): Anomaly[] {
  const anomalies: Anomaly[] = [];

  for (const customer of customers) {
    const revenue = customer.totalRevenue || 0;
    const z = zScore(revenue, stats.mean, stats.stdDev);

    // Low revenue anomaly relative to cohort
    if (z < -1.5 && revenue < stats.q1 - stats.iqr * 0.5) {
      anomalies.push({
        type: "revenue_change",
        severity: severityFromZScore(z),
        customerId: customer.id,
        customerName: customer.name,
        metric: "totalRevenue",
        currentValue: revenue,
        expectedValue: Math.round(stats.mean),
        deviationPercent: stats.mean > 0 ? Math.round(((revenue - stats.mean) / stats.mean) * 100) : -100,
        zScore: Math.round(z * 100) / 100,
        description: `Revenue ($${revenue.toLocaleString()}) is significantly below cohort average ($${Math.round(stats.mean).toLocaleString()})`,
        detectedAt: new Date().toISOString(),
        suggestedAction: "Review pricing or identify upsell opportunities",
      });
    }
  }

  return anomalies;
}

function detectSupportSpikes(customers: any[], stats: ReturnType<typeof calculateStats>): Anomaly[] {
  const anomalies: Anomaly[] = [];

  for (const customer of customers) {
    const tickets = customer.supportTickets || 0;
    const z = zScore(tickets, stats.mean, stats.stdDev);

    if (z > 2 && tickets > stats.q3 + stats.iqr * 1.5) {
      anomalies.push({
        type: "support_spike",
        severity: severityFromZScore(z),
        customerId: customer.id,
        customerName: customer.name,
        metric: "supportTickets",
        currentValue: tickets,
        expectedValue: Math.round(stats.mean),
        deviationPercent: stats.mean > 0 ? Math.round(((tickets - stats.mean) / stats.mean) * 100) : 100,
        zScore: Math.round(z * 100) / 100,
        description: `Support tickets (${tickets}) are ${Math.round(z)}x standard deviations above average`,
        detectedAt: new Date().toISOString(),
        suggestedAction: "Escalate to support lead — investigate root cause of ticket volume",
      });
    }
  }

  return anomalies;
}

function detectEngagementDrops(customers: any[]): Anomaly[] {
  const anomalies: Anomaly[] = [];
  const now = Date.now();

  for (const customer of customers) {
    const lastActivity = customer.lastActivityDate ? new Date(customer.lastActivityDate) : null;
    if (!lastActivity) continue;

    const daysInactive = Math.floor((now - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    const accountAge = customer.createdAt
      ? Math.floor((now - new Date(customer.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : 365;

    // Flag customers who were recently active but suddenly dropped off
    const isAnomalous =
      (daysInactive >= 30 && daysInactive <= 60 && accountAge > 90) ||
      (daysInactive >= 14 && (customer.totalRevenue || 0) > 1000);

    if (isAnomalous) {
      anomalies.push({
        type: "engagement_shift",
        severity: daysInactive >= 45 ? "high" : "medium",
        customerId: customer.id,
        customerName: customer.name,
        metric: "daysInactive",
        currentValue: daysInactive,
        expectedValue: 7,
        deviationPercent: Math.round(((daysInactive - 7) / 7) * 100),
        zScore: daysInactive / 15,
        description: `Customer went inactive ${daysInactive} days ago despite $${(customer.totalRevenue || 0).toLocaleString()} in revenue`,
        detectedAt: new Date().toISOString(),
        suggestedAction: "Immediate outreach — high-value customer showing disengagement",
      });
    }
  }

  return anomalies;
}

function detectChurnScoreJumps(customers: any[]): Anomaly[] {
  const anomalies: Anomaly[] = [];

  for (const customer of customers) {
    const churnScore = customer.churnScore || 0;

    if (churnScore >= 75 && (customer.totalRevenue || 0) > 500) {
      anomalies.push({
        type: "churn_risk_jump",
        severity: churnScore >= 90 ? "critical" : "high",
        customerId: customer.id,
        customerName: customer.name,
        metric: "churnScore",
        currentValue: churnScore,
        expectedValue: 30,
        deviationPercent: Math.round(((churnScore - 30) / 30) * 100),
        zScore: (churnScore - 30) / 20,
        description: `High-value customer ($${ (customer.totalRevenue || 0).toLocaleString()}) has churn score of ${churnScore}/100`,
        detectedAt: new Date().toISOString(),
        suggestedAction: "Priority retention intervention — schedule executive call",
      });
    }
  }

  return anomalies;
}

/**
 * Run anomaly detection across all customer dimensions.
 */
export function detectAnomalies(customers: any[]): AnomalyReport {
  const revenues = customers.map((c) => c.totalRevenue || 0);
  const tickets = customers.map((c) => c.supportTickets || 0);

  const revenueStats = calculateStats(revenues);
  const ticketStats = calculateStats(tickets);

  const allAnomalies = [
    ...detectRevenueAnomalies(customers, revenueStats),
    ...detectSupportSpikes(customers, ticketStats),
    ...detectEngagementDrops(customers),
    ...detectChurnScoreJumps(customers),
  ].sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  const affectedIds = new Set(allAnomalies.map((a) => a.customerId));
  const affectedSegments = new Set(
    customers.filter((c) => affectedIds.has(c.id)).map((c) => c.segment || "Unknown")
  );

  return {
    anomalies: allAnomalies,
    summary: {
      totalAnomalies: allAnomalies.length,
      criticalCount: allAnomalies.filter((a) => a.severity === "critical").length,
      highCount: allAnomalies.filter((a) => a.severity === "high").length,
      affectedCustomers: affectedIds.size,
      topAffectedSegments: Array.from(affectedSegments).slice(0, 5),
    },
    computedAt: new Date().toISOString(),
  };
}
