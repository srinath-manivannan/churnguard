/* eslint-disable @typescript-eslint/no-explicit-any */

import * as openai from "./openai";
import * as gemini from "./gemini";
import * as huggingface from "./huggingface";
import * as replicate from "./replicate";
import * as mock from "./mock";

const serviceStatus = {
  openai: { available: true, lastError: null as any },
  gemini: { available: true, lastError: null as any },
  huggingface: { available: true, lastError: null as any },
  replicate: { available: true, lastError: null as any },
};

function markServiceDown(service: keyof typeof serviceStatus, error: any) {
  serviceStatus[service].available = false;
  serviceStatus[service].lastError = error;
  console.warn(`❌ ${service.toUpperCase()} marked as down:`, error.message);

  // Avoid hammering a provider after quota/rate errors; re-enable after a cool-down
  setTimeout(() => {
    serviceStatus[service].available = true;
    console.log(`✅ ${service.toUpperCase()} marked as available again`);
  }, 5 * 60 * 1000);
}

export async function chatbotResponse(
  userMessage: string,
  customerContext: any[] = [],
  conversationHistory: Array<{ role: string; content: string }> = []
) {
  const errors: any[] = [];

  if (serviceStatus.openai.available) {
    try {
      console.log("🤖 Trying OpenAI for chat...");
      const response = await openai.chatbotResponse(
        userMessage,
        customerContext,
        conversationHistory
      );
      console.log("✅ OpenAI chat successful!");
      return response;
    } catch (error: any) {
      console.warn("⚠️ OpenAI chat failed:", error.message);
      errors.push({ service: "OpenAI", error });

      if (error.message?.includes("rate") || error.message?.includes("quota")) {
        markServiceDown("openai", error);
      }
    }
  }

  if (serviceStatus.gemini.available) {
    try {
      console.log("🤖 Trying Gemini for chat...");
      const response = await gemini.chatbotResponse(
        userMessage,
        customerContext,
        conversationHistory
      );
      console.log("✅ Gemini chat successful!");
      return response;
    } catch (error: any) {
      console.warn("⚠️ Gemini chat failed:", error.message);
      errors.push({ service: "Gemini", error });

      if (error.message?.includes("rate") || error.message?.includes("quota")) {
        markServiceDown("gemini", error);
      }
    }
  }

  if (serviceStatus.huggingface.available) {
    try {
      console.log("🤖 Trying Hugging Face for chat...");
      const response = await huggingface.chatbotResponse(
        userMessage,
        customerContext,
        conversationHistory
      );
      console.log("✅ Hugging Face chat successful!");
      return response;
    } catch (error: any) {
      console.warn("⚠️ Hugging Face chat failed:", error.message);
      errors.push({ service: "HuggingFace", error });
    }
  }

  console.error("❌ All AI services failed:", errors);
  return generateFallbackResponse(userMessage, customerContext);
}

export async function analyzeChurnRisk(customers: any[]) {
  const errors: any[] = [];

  if (serviceStatus.openai.available) {
    try {
      console.log("📊 Trying OpenAI for churn analysis...");
      const analysis = await openai.analyzeChurnRisk(customers);
      console.log("✅ OpenAI analysis successful!");
      return analysis;
    } catch (error: any) {
      console.warn("⚠️ OpenAI analysis failed:", error.message);
      errors.push({ service: "OpenAI", error });

      if (error.message?.includes("rate") || error.message?.includes("quota")) {
        markServiceDown("openai", error);
      }
    }
  }

  if (serviceStatus.gemini.available) {
    try {
      console.log("📊 Trying Gemini for churn analysis...");
      const analysis = await gemini.analyzeChurnRisk(customers);
      console.log("✅ Gemini analysis successful!");
      return analysis;
    } catch (error: any) {
      console.warn("⚠️ Gemini analysis failed:", error.message);
      errors.push({ service: "Gemini", error });

      if (error.message?.includes("rate") || error.message?.includes("quota")) {
        markServiceDown("gemini", error);
      }
    }
  }

  console.log("📊 Using rule-based churn analysis...");
  return generateRuleBasedChurnAnalysis(customers);
}

export async function analyzeImage(imageData: string, mimeType: string) {
  const errors: any[] = [];

  if (serviceStatus.replicate.available && process.env.REPLICATE_API_KEY) {
    try {
      console.log("📸 Trying Replicate for image analysis...");
      const analysis = await replicate.analyzeImage(imageData, mimeType);
      console.log("✅ Replicate image analysis successful!");
      return analysis;
    } catch (error: any) {
      console.warn("⚠️ Replicate image analysis failed:", error.message);
      errors.push({ service: "Replicate", error });
    }
  }

  if (serviceStatus.huggingface.available && process.env.HUGGINGFACE_API_KEY) {
    try {
      console.log("📸 Trying Hugging Face for image analysis...");
      const analysis = await huggingface.analyzeImage(imageData, mimeType);
      console.log("✅ Hugging Face image analysis successful!");
      return analysis;
    } catch (error: any) {
      console.warn("⚠️ Hugging Face image analysis failed:", error.message);
      errors.push({ service: "HuggingFace", error });
    }
  }

  if (serviceStatus.gemini.available && process.env.GEMINI_API_KEY) {
    try {
      console.log("📸 Trying Gemini for image analysis...");
      const analysis = await gemini.analyzeImage(imageData, mimeType);
      console.log("✅ Gemini image analysis successful!");
      return analysis;
    } catch (error: any) {
      console.warn("⚠️ Gemini image analysis failed:", error.message);
      errors.push({ service: "Gemini", error });
    }
  }

  if (serviceStatus.openai.available && process.env.OPENAI_API_KEY) {
    try {
      console.log("📸 Trying OpenAI for image analysis...");
      const analysis = await openai.analyzeImage(imageData, mimeType);
      console.log("✅ OpenAI image analysis successful!");
      return analysis;
    } catch (error: any) {
      console.warn("⚠️ OpenAI image analysis failed:", error.message);
      errors.push({ service: "OpenAI", error });
    }
  }

  console.log("📸 All AI services failed, using mock analysis for demo...");
  return await mock.analyzeImage(imageData, mimeType);
}

export async function personalizeEmail(template: string, customer: any) {
  const errors: any[] = [];

  if (serviceStatus.openai.available) {
    try {
      console.log("✉️ Trying OpenAI for email personalization...");
      const email = await openai.personalizeEmail(template, customer);
      console.log("✅ OpenAI email personalization successful!");
      return email;
    } catch (error: any) {
      console.warn("⚠️ OpenAI email failed:", error.message);
      errors.push({ service: "OpenAI", error });

      if (error.message?.includes("rate") || error.message?.includes("quota")) {
        markServiceDown("openai", error);
      }
    }
  }

  if (serviceStatus.gemini.available) {
    try {
      console.log("✉️ Trying Gemini for email personalization...");
      const email = await gemini.personalizeEmail(template, customer);
      console.log("✅ Gemini email personalization successful!");
      return email;
    } catch (error: any) {
      console.warn("⚠️ Gemini email failed:", error.message);
      errors.push({ service: "Gemini", error });
    }
  }

  console.log("✉️ Using template-based email personalization...");
  return simpleTemplatePersonalization(template, customer);
}

export async function generateReport(reportData: any) {
  const errors: any[] = [];

  if (serviceStatus.openai.available) {
    try {
      console.log("📄 Trying OpenAI for report generation...");
      const report = await openai.generateReport(reportData);
      console.log("✅ OpenAI report generation successful!");
      return report;
    } catch (error: any) {
      console.warn("⚠️ OpenAI report failed:", error.message);
      errors.push({ service: "OpenAI", error });

      if (error.message?.includes("rate") || error.message?.includes("quota")) {
        markServiceDown("openai", error);
      }
    }
  }

  if (serviceStatus.gemini.available) {
    try {
      console.log("📄 Trying Gemini for report generation...");
      const report = await gemini.generateReport(reportData);
      console.log("✅ Gemini report generation successful!");
      return report;
    } catch (error: any) {
      console.warn("⚠️ Gemini report failed:", error.message);
      errors.push({ service: "Gemini", error });
    }
  }

  console.log("📄 Using template-based report generation...");
  return generateTemplateReport(reportData);
}

function generateFallbackResponse(userMessage: string, customerContext: any[]) {
  const total = customerContext.length;
  const high = customerContext.filter(
    (c) => c.riskLevel === "high" || c.riskLevel === "critical"
  ).length;
  const inactive = customerContext.filter(
    (c) => c.daysInactive != null && c.daysInactive >= 30
  ).length;

  return (
    `Here's a quick summary based on your data:\n\n` +
    `- Total customers: ${total}\n` +
    `- High / critical risk: ${high}\n` +
    `- Inactive 30+ days: ${inactive}\n\n` +
    `Focus on re-engaging long-inactive and high-value accounts with targeted campaigns.\n\n` +
    `(Note: AI services temporarily unavailable - showing data-based summary)`
  );
}

function generateRuleBasedChurnAnalysis(customers: any[]) {
  return customers.map((c: any) => {
    const daysInactive = c.daysInactive ?? 0;
    const revenue = c.totalRevenue ?? c.total_revenue ?? 0;
    const supportTickets = c.supportTickets ?? c.support_tickets ?? 0;

    let churnScore = 10;
    let riskLevel = "low";
    const riskFactors: string[] = [];

    if (daysInactive >= 90) {
      churnScore += 40;
      riskFactors.push("90+ days inactive");
    } else if (daysInactive >= 60) {
      churnScore += 30;
      riskFactors.push("60+ days inactive");
    } else if (daysInactive >= 30) {
      churnScore += 20;
      riskFactors.push("30+ days inactive");
    }

    if (revenue === 0) {
      churnScore += 30;
      riskFactors.push("no revenue");
    } else if (revenue < 100) {
      churnScore += 15;
      riskFactors.push("low revenue");
    }

    if (supportTickets > 5) {
      churnScore += 15;
      riskFactors.push("high support tickets");
    }

    if (churnScore >= 70) riskLevel = "critical";
    else if (churnScore >= 50) riskLevel = "high";
    else if (churnScore >= 30) riskLevel = "medium";

    return {
      customerId: c.id ?? c.customerId ?? String(c._id ?? ""),
      churnScore: Math.min(churnScore, 100),
      riskLevel,
      riskFactors,
      recommendedAction:
        riskLevel === "critical"
          ? "Urgent: CSM call + retention offer"
          : riskLevel === "high"
          ? "Schedule CSM call this week"
          : riskLevel === "medium"
          ? "Send re-engagement email"
          : "Continue normal engagement",
    };
  });
}

function simpleTemplatePersonalization(template: string, customer: any) {
  let personalized = template;
  personalized = personalized.replace(/\[NAME\]/gi, customer.name || "Valued Customer");
  personalized = personalized.replace(/\[COMPANY\]/gi, customer.company || "your company");
  personalized = personalized.replace(/\[EMAIL\]/gi, customer.email || "");

  if (customer.daysInactive > 30) {
    personalized = `Hi ${customer.name},\n\nWe've noticed it's been a while since you've been active. ` + personalized;
  }

  return personalized;
}

function generateTemplateReport(reportData: any) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>ChurnGuard Report</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; background: #f3f4f6; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
    h1 { color: #3b82f6; margin-bottom: 10px; }
    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 30px 0; }
    .stat { background: #f9fafb; padding: 20px; border-radius: 8px; text-align: center; }
    .stat-value { font-size: 32px; font-weight: bold; color: #1f2937; }
    .stat-label { color: #6b7280; margin-top: 5px; }
    .insights { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .insights h2 { color: #92400e; margin-top: 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 ChurnGuard Report</h1>
    <p>Generated: ${new Date().toLocaleDateString()}</p>
    
    <div class="stats">
      <div class="stat">
        <div class="stat-value">${reportData.totalCustomers || 0}</div>
        <div class="stat-label">Total Customers</div>
      </div>
      <div class="stat">
        <div class="stat-value">${reportData.highRiskCount || 0}</div>
        <div class="stat-label">High Risk</div>
      </div>
      <div class="stat">
        <div class="stat-value">$${(reportData.totalRevenue || 0).toLocaleString()}</div>
        <div class="stat-label">Total Revenue</div>
      </div>
    </div>
    
    <div class="insights">
      <h2>⚠️ Key Insights</h2>
      <ul>
        <li>Focus on ${reportData.highRiskCount || 0} high-risk customers</li>
        <li>Revenue at risk: $${(reportData.revenueAtRisk || 0).toLocaleString()}</li>
        <li>Recommended: Launch targeted retention campaigns</li>
      </ul>
    </div>
  </div>
</body>
</html>
  `;
}

export async function createEmbedding(_text: string): Promise<number[]> {
  throw new Error("Embeddings disabled");
}

export async function createEmbeddingsBatch(_texts: string[]): Promise<number[][]> {
  throw new Error("Embeddings disabled");
}
