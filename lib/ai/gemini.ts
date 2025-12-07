/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================
// GOOGLE GEMINI AI INTEGRATION (WORKING!)
// ============================================
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// ============================================
// USE GEMINI-2.5-FLASH (STABLE & AVAILABLE)
// ============================================

export const textModel = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash",  // ✅ Available & Stable!
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 2048,
  },
});

export const visionModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",  // ✅ Supports images too!
  generationConfig: {
    temperature: 0.4,
    maxOutputTokens: 2048,
  },
});

// ============================================
// CHATBOT FUNCTION
// ============================================
export async function chatbotResponse(
  userMessage: string,
  customerContext: any[] = [],
  conversationHistory: Array<{ role: string; content: string }> = []
) {
  try {
    const contextText = customerContext.length > 0
      ? `\n\nRelevant customer data:\n${JSON.stringify(customerContext, null, 2)}`
      : "";

    const historyText = conversationHistory.length > 0
      ? `\n\nPrevious conversation:\n${conversationHistory
          .map((msg) => `${msg.role}: ${msg.content}`)
          .join("\n")}`
      : "";

    const prompt = `You are ChurnGuard AI, an expert customer retention assistant.

Your role:
- Help users understand customer churn patterns
- Provide actionable retention strategies
- Answer questions about customer data
- Be specific and data-driven in your responses

${historyText}${contextText}

User question: ${userMessage}

Provide a clear, helpful response.`;

    const result = await textModel.generateContent(prompt);
    const response = result.response.text();
    
    if (!response || response.trim().length === 0) {
      throw new Error("Empty response from Gemini");
    }
    
    return response;
  } catch (error: any) {
    console.error("Gemini chatbot error:", error);
    throw new Error(`Failed to generate response: ${error.message}`);
  }
}

// ============================================
// CHURN ANALYSIS
// ============================================
export async function analyzeChurnRisk(customers: any[]) {
  try {
    const prompt = `You are a customer churn prediction expert. Analyze the following customers.

Customers to analyze:
${JSON.stringify(customers, null, 2)}

Return ONLY valid JSON (no markdown):
[
  {
    "customerId": "id",
    "churnScore": 85,
    "riskLevel": "high",
    "riskFactors": ["inactive"],
    "recommendedAction": "CSM call"
  }
]`;

    const result = await textModel.generateContent(prompt);
    const response = result.response.text();
    const cleanedResponse = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const analysis = JSON.parse(cleanedResponse);
    return analysis;
  } catch (error) {
    console.error("Churn analysis error:", error);
    throw new Error("Failed to analyze churn risk");
  }
}

// ============================================
// PERSONALIZE EMAIL
// ============================================
export async function personalizeEmail(template: string, customer: any) {
  try {
    const prompt = `Personalize this email for ${customer.name}:\n\n${template}`;
    const result = await textModel.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Email error:", error);
    throw new Error("Failed to personalize email");
  }
}

// ============================================
// IMAGE ANALYSIS
// ============================================
export async function analyzeImage(imageData: string, mimeType: string) {
  try {
    const prompt = `Analyze this image. Return JSON: {"peopleCount": 0, "engagementLevel": "low", "activities": [], "mood": "", "insights": [], "recommendations": []}`;
    const result = await visionModel.generateContent([
      prompt,
      { inlineData: { mimeType, data: imageData } },
    ]);
    const response = result.response.text();
    const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Image error:", error);
    throw new Error("Failed to analyze image");
  }
}

// ============================================
// GENERATE REPORT
// ============================================
export async function generateReport(reportData: any) {
  try {
    const prompt = `Create HTML report. Data: ${JSON.stringify(reportData)}`;
    const result = await textModel.generateContent(prompt);
    let html = result.response.text().replace(/```html\n?/g, "").replace(/```\n?/g, "").trim();
    if (!html.startsWith("<!DOCTYPE")) html = `<!DOCTYPE html>\n${html}`;
    return html;
  } catch (error) {
    console.error("Report error:", error);
    throw new Error("Failed to generate report");
  }
}

// ============================================
// EMBEDDINGS (DISABLED)
// ============================================
export async function createEmbedding(text: string): Promise<number[]> {
  throw new Error("Embeddings disabled");
}

export async function createEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  throw new Error("Embeddings disabled");
}