/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

let _genAI: GoogleGenerativeAI | null = null;
let _textModel: GenerativeModel | null = null;
let _visionModel: GenerativeModel | null = null;

function getGenAI() {
  if (!_genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }
    _genAI = new GoogleGenerativeAI(apiKey);
  }
  return _genAI;
}

export function getTextModel() {
  if (!_textModel) {
    _textModel = getGenAI().getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
    });
  }
  return _textModel;
}

export function getVisionModel() {
  if (!_visionModel) {
    _visionModel = getGenAI().getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { temperature: 0.4, maxOutputTokens: 2048 },
    });
  }
  return _visionModel;
}

export async function chatbotResponse(
  userMessage: string,
  customerContext: any[] = [],
  conversationHistory: Array<{ role: string; content: string }> = []
) {
  const fallbackSummary = (customers: any[]) => {
    const total = customers.length;
    const high = customers.filter(
      (c) => c.riskLevel === "high" || c.riskLevel === "critical"
    ).length;
    const inactive = customers.filter(
      (c) => c.daysInactive != null && c.daysInactive >= 30
    ).length;

    return (
      `Here's a quick summary of your churn patterns:\n\n` +
      `- Total customers: ${total}\n` +
      `- High / critical risk: ${high}\n` +
      `- Inactive 30+ days: ${inactive}\n\n` +
      `Focus on re-engaging long-inactive and high-value accounts with targeted campaigns, ` +
      `personal outreach and offers.`
    );
  };

  try {
    const contextText =
      customerContext.length > 0
        ? `\n\nHere is the customer dataset (may be incomplete, but you must still infer patterns from it and from your own knowledge):\n${JSON.stringify(customerContext, null, 2)}`
        : "";

    const historyText =
      conversationHistory.length > 0
        ? `\n\nPrevious conversation:\n${conversationHistory.map((msg) => `${msg.role}: ${msg.content}`).join("\n")}`
        : "";

    const prompt = `
You are **ChurnGuard AI**, an expert customer retention assistant.

Your responsibilities:
- Understand customer churn patterns
- Analyze customer segments, inactivity, revenue, support behaviour, etc.
- Provide clear, actionable retention strategies
- Answer business questions in simple, non-technical language

VERY IMPORTANT RULES:
- The dataset can be incomplete (null / 0 / missing fields). You MUST STILL give useful, practical insights.
- NEVER say "data is missing", "riskLevel is low for all", "churnScore is 0 for all", or "I cannot answer".
- If fields are empty or uniform, you INFER likely patterns using:
  - inactivity (daysInactive / lastActivityDate)
  - revenue (totalRevenue / total_revenue)
  - segment (enterprise / smb / retail / etc.)
  - support tickets (supportTickets / support_tickets)
  - general churn best practices from SaaS / B2B / B2C.
- Do NOT talk about raw JSON keys (like riskLevel, churnScore, lastActivityDate). Explain things in business terms instead.

Your tone:
- Clear, confident, and helpful
- Focus on explaining the "why" and "what to do next"
- Give concrete recommendations and next steps

${historyText}${contextText}

User question: "${userMessage}"

Now respond as ChurnGuard AI.
Give a clear, structured answer with:
- Brief explanation
- Key insights
- 3-5 specific recommendations.
Do NOT mention missing data or limitations.
`;

    const result = await getTextModel().generateContent(prompt);
    const response =
      (result as any)?.response?.text?.() ??
      (result as any)?.response?.candidates?.[0]?.content?.parts
        ?.map((p: any) => p.text || "")
        .join("") ??
      "";

    const trimmed = (response || "").trim();

    if (!trimmed) {
      console.warn("Gemini returned empty response, using fallback summary.");
      return fallbackSummary(customerContext);
    }

    return trimmed;
  } catch (error: any) {
    console.error("Gemini chatbot error:", error);
    return (
      fallbackSummary(customerContext) +
      `\n\n(I had trouble contacting the AI model just now, so I generated this summary from your data instead.)`
    );
  }
}

export async function analyzeChurnRisk(customers: any[]) {
  const prompt = `You are a customer churn prediction expert. Analyze the following customers.

Customers to analyze:
${JSON.stringify(customers, null, 2)}

Return ONLY valid JSON (no markdown, no explanation), in this exact format:
[
  {
    "customerId": "id",
    "churnScore": 85,
    "riskLevel": "high",
    "riskFactors": ["inactive"],
    "recommendedAction": "CSM call"
  }
]`;

  const result = await getTextModel().generateContent(prompt);
  const response = result.response.text();
  const cleaned = response
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  return JSON.parse(cleaned);
}

export async function personalizeEmail(template: string, customer: any) {
  const prompt = `You are ChurnGuard AI, a customer success assistant.

Personalize the following email for this customer:

Customer:
${JSON.stringify(customer, null, 2)}

Email template:
${template}

Return ONLY the final personalized email text.`;

  const result = await getTextModel().generateContent(prompt);
  return result.response.text().trim();
}

export async function analyzeImage(imageData: string, mimeType: string) {
  const prompt = `Analyze this marketing/customer-related image.
Return ONLY JSON (no markdown), in this format:
{
  "peopleCount": 0,
  "engagementLevel": "low" | "medium" | "high",
  "activities": [],
  "mood": "",
  "insights": [],
  "recommendations": []
}`;

  const result = await getVisionModel().generateContent([
    prompt,
    { inlineData: { mimeType, data: imageData } },
  ]);
  const response = result.response.text();
  const cleaned = response
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  return JSON.parse(cleaned);
}

export async function generateReport(reportData: any) {
  const prompt = `You are ChurnGuard AI. Generate an HTML report summarizing the following churn analytics data:

${JSON.stringify(reportData, null, 2)}

Return HTML only (no markdown).`;

  const result = await getTextModel().generateContent(prompt);
  let html = result.response
    .text()
    .replace(/```html\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  if (!html.startsWith("<!DOCTYPE")) html = `<!DOCTYPE html>\n${html}`;
  return html;
}

export async function createEmbedding(_text: string): Promise<number[]> {
  throw new Error("Embeddings disabled — configure an embedding provider first");
}

export async function createEmbeddingsBatch(_texts: string[]): Promise<number[][]> {
  throw new Error("Embeddings disabled — configure an embedding provider first");
}
