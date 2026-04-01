/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Customer Health Score Engine
 *
 * Computes a composite health score (0-100) from multiple signal dimensions.
 * Modeled after enterprise Customer Success platforms (Gainsight, Totango, ChurnZero).
 */

export interface HealthScore {
  overall: number;           // 0-100
  grade: "A" | "B" | "C" | "D" | "F";
  dimensions: HealthDimension[];
  trend: "improving" | "stable" | "declining";
  alerts: HealthAlert[];
}

export interface HealthDimension {
  name: string;
  score: number;             // 0-100
  weight: number;            // 0-1
  status: "healthy" | "warning" | "critical";
  details: string;
}

export interface HealthAlert {
  severity: "info" | "warning" | "critical";
  message: string;
  dimension: string;
  suggestedAction: string;
}

const DIMENSION_WEIGHTS = {
  engagement: 0.25,
  revenue: 0.20,
  support: 0.20,
  product_adoption: 0.15,
  relationship: 0.10,
  sentiment: 0.10,
};

function gradeFromScore(score: number): HealthScore["grade"] {
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 50) return "C";
  if (score >= 30) return "D";
  return "F";
}

function statusFromScore(score: number): HealthDimension["status"] {
  if (score >= 60) return "healthy";
  if (score >= 35) return "warning";
  return "critical";
}

function engagementDimension(customer: any): HealthDimension {
  const lastActivity = customer.lastActivityDate ? new Date(customer.lastActivityDate) : null;
  const daysInactive = lastActivity
    ? Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  let score: number;
  if (daysInactive <= 3) score = 95;
  else if (daysInactive <= 7) score = 85;
  else if (daysInactive <= 14) score = 70;
  else if (daysInactive <= 30) score = 50;
  else if (daysInactive <= 60) score = 25;
  else if (daysInactive <= 90) score = 10;
  else score = 0;

  return {
    name: "Engagement",
    score,
    weight: DIMENSION_WEIGHTS.engagement,
    status: statusFromScore(score),
    details: daysInactive < 999
      ? `Last active ${daysInactive} day${daysInactive === 1 ? "" : "s"} ago`
      : "No activity recorded",
  };
}

function revenueDimension(customer: any, cohortAvgRevenue: number): HealthDimension {
  const revenue = customer.totalRevenue || 0;

  let score: number;
  if (cohortAvgRevenue > 0) {
    const ratio = revenue / cohortAvgRevenue;
    score = Math.min(100, Math.round(ratio * 60));
  } else {
    score = revenue > 0 ? 60 : 10;
  }

  return {
    name: "Revenue",
    score,
    weight: DIMENSION_WEIGHTS.revenue,
    status: statusFromScore(score),
    details: `$${revenue.toLocaleString()} total revenue (cohort avg: $${Math.round(cohortAvgRevenue).toLocaleString()})`,
  };
}

function supportDimension(customer: any): HealthDimension {
  const tickets = customer.supportTickets || 0;

  // Inverse: fewer tickets = healthier (but zero can mean disengagement)
  let score: number;
  if (tickets === 0) score = 70;
  else if (tickets <= 2) score = 85;
  else if (tickets <= 5) score = 60;
  else if (tickets <= 10) score = 35;
  else score = 15;

  return {
    name: "Support",
    score,
    weight: DIMENSION_WEIGHTS.support,
    status: statusFromScore(score),
    details: `${tickets} support ticket${tickets === 1 ? "" : "s"} filed`,
  };
}

function productAdoptionDimension(customer: any): HealthDimension {
  // Proxy: use combination of activity and ticket engagement
  const hasEmail = !!customer.email;
  const hasPhone = !!customer.phone;
  const hasSegment = !!customer.segment;
  const profileCompleteness = [hasEmail, hasPhone, hasSegment, !!customer.company].filter(Boolean).length;

  const score = Math.min(100, profileCompleteness * 20 + (customer.totalRevenue > 0 ? 20 : 0));

  return {
    name: "Product Adoption",
    score,
    weight: DIMENSION_WEIGHTS.product_adoption,
    status: statusFromScore(score),
    details: `Profile completeness: ${profileCompleteness}/4 fields`,
  };
}

function relationshipDimension(customer: any): HealthDimension {
  const createdAt = customer.createdAt ? new Date(customer.createdAt) : new Date();
  const accountAge = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

  // Longer relationship = slightly healthier (loyalty)
  let score: number;
  if (accountAge > 365) score = 80;
  else if (accountAge > 180) score = 70;
  else if (accountAge > 90) score = 55;
  else if (accountAge > 30) score = 40;
  else score = 30;

  return {
    name: "Relationship",
    score,
    weight: DIMENSION_WEIGHTS.relationship,
    status: statusFromScore(score),
    details: `Customer for ${accountAge} days`,
  };
}

function sentimentDimension(sentimentScore: number): HealthDimension {
  // sentimentScore: -1 to 1
  const normalized = Math.round(((sentimentScore + 1) / 2) * 100);

  return {
    name: "Sentiment",
    score: normalized,
    weight: DIMENSION_WEIGHTS.sentiment,
    status: statusFromScore(normalized),
    details: `Sentiment score: ${sentimentScore.toFixed(2)}`,
  };
}

function generateAlerts(dimensions: HealthDimension[]): HealthAlert[] {
  const alerts: HealthAlert[] = [];

  for (const dim of dimensions) {
    if (dim.status === "critical") {
      alerts.push({
        severity: "critical",
        message: `${dim.name} score critically low at ${dim.score}/100`,
        dimension: dim.name,
        suggestedAction: getAlertAction(dim.name, "critical"),
      });
    } else if (dim.status === "warning") {
      alerts.push({
        severity: "warning",
        message: `${dim.name} score declining: ${dim.score}/100`,
        dimension: dim.name,
        suggestedAction: getAlertAction(dim.name, "warning"),
      });
    }
  }

  return alerts.sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

function getAlertAction(dimension: string, severity: string): string {
  const actions: Record<string, Record<string, string>> = {
    Engagement: {
      critical: "Initiate immediate outreach — customer at risk of churning",
      warning: "Schedule re-engagement campaign within 48 hours",
    },
    Revenue: {
      critical: "Review account for potential downgrade or churn",
      warning: "Explore upsell opportunities to increase account value",
    },
    Support: {
      critical: "Escalate to senior support — too many unresolved tickets",
      warning: "Review open tickets and ensure timely resolution",
    },
    "Product Adoption": {
      critical: "Assign onboarding specialist for guided setup",
      warning: "Send product training resources and best practices",
    },
    Relationship: {
      critical: "New account needs immediate onboarding attention",
      warning: "Schedule quarterly business review",
    },
    Sentiment: {
      critical: "Immediate executive outreach to address dissatisfaction",
      warning: "CSM follow-up call to understand concerns",
    },
  };

  return actions[dimension]?.[severity] || "Review and take appropriate action";
}

/**
 * Compute the composite Customer Health Score.
 */
export function computeHealthScore(
  customer: any,
  options: { cohortAvgRevenue?: number; sentimentScore?: number } = {}
): HealthScore {
  const { cohortAvgRevenue = 0, sentimentScore = 0 } = options;

  const dimensions: HealthDimension[] = [
    engagementDimension(customer),
    revenueDimension(customer, cohortAvgRevenue),
    supportDimension(customer),
    productAdoptionDimension(customer),
    relationshipDimension(customer),
    sentimentDimension(sentimentScore),
  ];

  const overall = Math.round(
    dimensions.reduce((sum, dim) => sum + dim.score * dim.weight, 0)
  );

  const alerts = generateAlerts(dimensions);

  return {
    overall,
    grade: gradeFromScore(overall),
    dimensions,
    trend: "stable",
    alerts,
  };
}

/**
 * Compute health scores for an entire cohort and return distribution.
 */
export function computeCohortHealth(customers: any[]): {
  scores: Array<{ customerId: string; healthScore: HealthScore }>;
  distribution: { A: number; B: number; C: number; D: number; F: number };
  avgScore: number;
  alertCount: number;
} {
  const avgRevenue = customers.reduce((s, c) => s + (c.totalRevenue || 0), 0) / (customers.length || 1);

  const scores = customers.map((c) => ({
    customerId: c.id,
    healthScore: computeHealthScore(c, { cohortAvgRevenue: avgRevenue }),
  }));

  const distribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  let totalScore = 0;
  let totalAlerts = 0;

  for (const s of scores) {
    distribution[s.healthScore.grade]++;
    totalScore += s.healthScore.overall;
    totalAlerts += s.healthScore.alerts.length;
  }

  return {
    scores: scores.sort((a, b) => a.healthScore.overall - b.healthScore.overall),
    distribution,
    avgScore: Math.round(totalScore / (scores.length || 1)),
    alertCount: totalAlerts,
  };
}
