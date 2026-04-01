/* eslint-disable @typescript-eslint/no-explicit-any */
import { getTextModel } from "./gemini";

export interface SentimentResult {
  score: number;        // -1.0 (very negative) to 1.0 (very positive)
  magnitude: number;    // 0.0 (neutral) to 1.0 (highly emotional)
  label: "very_negative" | "negative" | "neutral" | "positive" | "very_positive";
  keyPhrases: string[];
  urgency: "low" | "medium" | "high" | "critical";
  topics: string[];
}

export interface CustomerSentimentProfile {
  customerId: string;
  overallSentiment: number;
  sentimentTrend: "improving" | "stable" | "declining";
  riskSignals: string[];
  recentSentiments: SentimentResult[];
  engagementLevel: "disengaged" | "low" | "moderate" | "high";
}

function labelFromScore(score: number): SentimentResult["label"] {
  if (score <= -0.6) return "very_negative";
  if (score <= -0.2) return "negative";
  if (score <= 0.2) return "neutral";
  if (score <= 0.6) return "positive";
  return "very_positive";
}

/**
 * Rule-based sentiment analysis for when AI provider is unavailable.
 * Uses lexicon-based scoring with negation handling.
 */
export function analyzeTextSentimentLocal(text: string): SentimentResult {
  const lower = text.toLowerCase();

  const positiveWords = [
    "great", "excellent", "amazing", "love", "perfect", "wonderful", "fantastic",
    "happy", "pleased", "satisfied", "helpful", "thank", "thanks", "appreciate",
    "awesome", "good", "best", "recommend", "impressed", "outstanding",
  ];
  const negativeWords = [
    "terrible", "horrible", "awful", "hate", "worst", "disappointed", "frustrated",
    "angry", "broken", "useless", "waste", "cancel", "unsubscribe", "refund",
    "bug", "issue", "problem", "complaint", "poor", "slow", "fail", "error",
  ];
  const urgencyWords = ["urgent", "asap", "immediately", "critical", "emergency", "deadline"];
  const negators = ["not", "no", "never", "don't", "doesn't", "isn't", "wasn't", "can't", "won't"];

  const words = lower.split(/\s+/);
  let posCount = 0;
  let negCount = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i].replace(/[^a-z]/g, "");
    const prevWord = i > 0 ? words[i - 1].replace(/[^a-z]/g, "") : "";
    const isNegated = negators.includes(prevWord);

    if (positiveWords.includes(word)) {
      if (isNegated) { negCount++; } else { posCount++; }
    }
    if (negativeWords.includes(word)) {
      if (isNegated) { posCount++; } else { negCount++; }
    }
  }

  const total = posCount + negCount || 1;
  const score = Math.max(-1, Math.min(1, (posCount - negCount) / total));
  const magnitude = Math.min(1, total / 10);

  const hasUrgency = urgencyWords.some((w) => lower.includes(w));
  const urgency: SentimentResult["urgency"] = hasUrgency
    ? score < -0.3 ? "critical" : "high"
    : score < -0.5 ? "high"
    : score < -0.2 ? "medium"
    : "low";

  return {
    score: Math.round(score * 100) / 100,
    magnitude: Math.round(magnitude * 100) / 100,
    label: labelFromScore(score),
    keyPhrases: [...positiveWords, ...negativeWords].filter((w) => lower.includes(w)).slice(0, 5),
    urgency,
    topics: extractTopics(lower),
  };
}

function extractTopics(text: string): string[] {
  const topicKeywords: Record<string, string[]> = {
    billing: ["bill", "invoice", "charge", "payment", "price", "cost", "refund"],
    support: ["support", "help", "ticket", "issue", "problem", "bug"],
    product: ["feature", "product", "update", "version", "release"],
    onboarding: ["setup", "onboard", "start", "getting started", "tutorial"],
    performance: ["slow", "speed", "performance", "loading", "timeout"],
  };

  const found: string[] = [];
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some((k) => text.includes(k))) {
      found.push(topic);
    }
  }
  return found;
}

/**
 * AI-powered sentiment analysis using Gemini for richer understanding.
 */
export async function analyzeTextSentimentAI(text: string): Promise<SentimentResult> {
  try {
    const prompt = `Analyze the sentiment of this customer communication.

Text: "${text}"

Return ONLY valid JSON:
{
  "score": <number from -1.0 to 1.0>,
  "magnitude": <number from 0.0 to 1.0>,
  "keyPhrases": ["phrase1", "phrase2"],
  "urgency": "low" | "medium" | "high" | "critical",
  "topics": ["topic1"]
}`;

    const result = await getTextModel().generateContent(prompt);
    const response = result.response.text();
    const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      score: parsed.score,
      magnitude: parsed.magnitude,
      label: labelFromScore(parsed.score),
      keyPhrases: parsed.keyPhrases || [],
      urgency: parsed.urgency || "low",
      topics: parsed.topics || [],
    };
  } catch {
    return analyzeTextSentimentLocal(text);
  }
}

/**
 * Build a sentiment profile for a customer from their interaction history.
 */
export function buildSentimentProfile(
  customerId: string,
  sentiments: SentimentResult[]
): CustomerSentimentProfile {
  if (sentiments.length === 0) {
    return {
      customerId,
      overallSentiment: 0,
      sentimentTrend: "stable",
      riskSignals: [],
      recentSentiments: [],
      engagementLevel: "disengaged",
    };
  }

  const overallSentiment =
    sentiments.reduce((sum, s) => sum + s.score, 0) / sentiments.length;

  // Trend: compare first half vs second half
  const mid = Math.floor(sentiments.length / 2);
  const firstHalf = sentiments.slice(0, mid);
  const secondHalf = sentiments.slice(mid);

  const firstAvg = firstHalf.length > 0
    ? firstHalf.reduce((s, x) => s + x.score, 0) / firstHalf.length
    : 0;
  const secondAvg = secondHalf.length > 0
    ? secondHalf.reduce((s, x) => s + x.score, 0) / secondHalf.length
    : 0;

  const trendDiff = secondAvg - firstAvg;
  const sentimentTrend: CustomerSentimentProfile["sentimentTrend"] =
    trendDiff > 0.15 ? "improving" : trendDiff < -0.15 ? "declining" : "stable";

  const riskSignals: string[] = [];
  if (overallSentiment < -0.3) riskSignals.push("Consistently negative sentiment");
  if (sentimentTrend === "declining") riskSignals.push("Sentiment trending downward");
  if (sentiments.some((s) => s.urgency === "critical")) riskSignals.push("Critical urgency detected");
  if (sentiments.filter((s) => s.score < -0.5).length >= 3) riskSignals.push("Multiple strongly negative interactions");

  const engagementLevel: CustomerSentimentProfile["engagementLevel"] =
    sentiments.length === 0 ? "disengaged"
    : sentiments.length <= 2 ? "low"
    : sentiments.length <= 5 ? "moderate"
    : "high";

  return {
    customerId,
    overallSentiment: Math.round(overallSentiment * 100) / 100,
    sentimentTrend,
    riskSignals,
    recentSentiments: sentiments.slice(-5),
    engagementLevel,
  };
}
