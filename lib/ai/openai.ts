/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================
// OPENAI INTEGRATION (replaces Gemini)
// ============================================
import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  console.warn("⚠️ OPENAI_API_KEY is not set in .env.local");
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// ============================================
// Internal helper: get text from chat completion
// ============================================
function getTextFromCompletion(completion: any): string {
  const msg = completion?.choices?.[0]?.message;
  if (!msg) return "";

  const content = msg.content;

  if (typeof content === "string") return content;

  if (Array.isArray(content)) {
    return content
      .map((part: any) => {
        if (typeof part === "string") return part;
        if (part?.type === "text" && typeof part.text === "string") {
          return part.text;
        }
        return "";
      })
      .join("");
  }

  return "";
}

// ============================================
// Internal helper: text-only generation
// ============================================
async function generateText(prompt: string): Promise<string> {
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.4,
  });

  return getTextFromCompletion(completion).trim();
}

// ============================================
// Internal helper: vision (image + text) → JSON
// ============================================
async function generateVisionJSON(
  prompt: string,
  imageBase64: string,
  mimeType: string
): Promise<any> {
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${imageBase64}`,
            },
          },
        ],
      },
    ],
    temperature: 0.2,
  });

  const rawText = getTextFromCompletion(completion);

  const cleaned = (rawText || "")
    .replace(/```json\n?/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleaned);
}

// ============================================
// CHATBOT FUNCTION (ChurnGuard AI) – OpenAI
// ============================================
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
        ? `\n\nHere is the customer dataset (may be incomplete, but you must still infer patterns from it and from your own knowledge):\n${JSON.stringify(
            customerContext,
            null,
            2
          )}`
        : "";

    const historyText =
      conversationHistory.length > 0
        ? `\n\nPrevious conversation:\n${conversationHistory
            .map((msg) => `${msg.role}: ${msg.content}`)
            .join("\n")}`
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
- 3–5 specific recommendations.
Do NOT mention missing data or limitations.
`;

    const text = await generateText(prompt);
    const trimmed = (text || "").trim();

    if (!trimmed) {
      console.warn("OpenAI returned empty response, using fallback summary.");
      return fallbackSummary(customerContext);
    }

    return trimmed;
  } catch (error) {
    console.error("OpenAI chatbot error:", error);
    return (
      fallbackSummary(customerContext) +
      `\n\n(I had trouble contacting the AI model just now, so I generated this summary from your data instead.)`
    );
  }
}

// ============================================
// CHURN ANALYSIS (JSON) – OpenAI
// ============================================
export async function analyzeChurnRisk(customers: any[]) {
  try {
    const prompt = `You are a customer churn prediction expert. Analyze the following customers.

Customers to analyze:
${JSON.stringify(customers, null, 2)}

Return ONLY valid JSON array in this exact format:
[
  {
    "customerId": "id",
    "churnScore": 85,
    "riskLevel": "high",
    "riskFactors": ["inactive"],
    "recommendedAction": "CSM call"
  }
]`;

    const responseText = await generateText(prompt);
    const cleaned = responseText
      .replace(/```json\n?/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Churn analysis error (OpenAI):", error);

    // simple non-AI fallback
    return customers.map((c: any) => {
      const daysInactive = c.daysInactive ?? 0;
      const revenue = c.totalRevenue ?? c.total_revenue ?? 0;

      let riskLevel = "low";
      let churnScore = 10;

      if (daysInactive >= 60 || revenue === 0) {
        riskLevel = "high";
        churnScore = 80;
      } else if (daysInactive >= 30) {
        riskLevel = "medium";
        churnScore = 50;
      }

      return {
        customerId: c.id ?? c.customerId ?? String(c._id ?? ""),
        churnScore,
        riskLevel,
        riskFactors: [
          daysInactive >= 60
            ? "very long inactivity"
            : daysInactive >= 30
            ? "30+ days inactive"
            : "recently active",
        ],
        recommendedAction:
          riskLevel === "high"
            ? "Immediate CSM call + retention offer"
            : riskLevel === "medium"
            ? "Send re-engagement email sequence"
            : "Normal engagement campaigns",
      };
    });
  }
}

// ============================================
// PERSONALIZE EMAIL – OpenAI
// ============================================
export async function personalizeEmail(template: string, customer: any) {
  try {
    const prompt = `You are ChurnGuard AI, a customer success assistant.

Personalize the following email for this customer:

Customer:
${JSON.stringify(customer, null, 2)}

Email template:
${template}

Return ONLY the final personalized email text.`;

    const text = await generateText(prompt);
    return text.trim();
  } catch (error) {
    console.error("Email personalization error (OpenAI):", error);
    throw new Error("Failed to personalize email");
  }
}

// ============================================
// IMAGE ANALYSIS – OpenAI Vision (via chat.completions)
// ============================================
export async function analyzeImage(imageData: string, mimeType: string) {
  try {
    const prompt = `Analyze this marketing/customer-related image.
Return ONLY JSON (no markdown), in this exact format:
{
  "peopleCount": 0,
  "engagementLevel": "low" | "medium" | "high",
  "activities": [],
  "mood": "",
  "insights": [],
  "recommendations": []
}`;

    const json = await generateVisionJSON(prompt, imageData, mimeType);
    return json;
  } catch (error: any) {
    console.error("Image analysis error (OpenAI):", error);
    throw new Error("Failed to analyze image");
  }
}

// ============================================
// GENERATE REPORT (HTML) – OpenAI
// ============================================
export async function generateReport(reportData: any) {
  try {
    const prompt = `You are ChurnGuard AI. Generate an HTML report summarizing the following churn analytics data:

${JSON.stringify(reportData, null, 2)}

Return FULL HTML only (no markdown).`;

    const htmlText = await generateText(prompt);
    let html = htmlText
      .replace(/```html\n?/g, "")
      .replace(/```/g, "")
      .trim();
    if (!html.startsWith("<!DOCTYPE")) html = `<!DOCTYPE html>\n${html}`;
    return html;
  } catch (error) {
    console.error("Report error (OpenAI):", error);
    throw new Error("Failed to generate report");
  }
}

// ============================================
// EMBEDDINGS (disabled)
// ============================================
export async function createEmbedding(_text: string): Promise<number[]> {
  throw new Error("Embeddings disabled");
}

export async function createEmbeddingsBatch(
  _texts: string[]
): Promise<number[][]> {
  throw new Error("Embeddings disabled");
}
