// /* eslint-disable @typescript-eslint/no-explicit-any */
// // ============================================
// // HUGGING FACE (Free Tier)
// // ============================================

// // ============================================
// // CHATBOT - Free Text Generation
// // ============================================
// export async function chatbotResponse(
//     userMessage: string,
//     customerContext: any[] = [],
//     conversationHistory: Array<{ role: string; content: string }> = []
//   ) {
//     try {
//       const contextText =
//         customerContext.length > 0
//           ? `\n\nCustomer data: ${JSON.stringify(customerContext.slice(0, 10), null, 2)}`
//           : "";
  
//       const historyText =
//         conversationHistory.length > 0
//           ? `\n\nHistory:\n${conversationHistory
//               .slice(-3)
//               .map((msg) => `${msg.role}: ${msg.content}`)
//               .join("\n")}`
//           : "";
  
//       const prompt = `You are ChurnGuard AI, a customer retention expert.
  
//   ${historyText}${contextText}
  
//   User: "${userMessage}"
  
//   Respond as a helpful retention advisor. Give 3-5 actionable recommendations.`;
  
//       const response = await fetch(
//         "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
//         {
//           method: "POST",
//           headers: {
//             "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             inputs: prompt,
//             parameters: {
//               max_new_tokens: 500,
//               temperature: 0.7,
//               return_full_text: false,
//             },
//             options: {
//               wait_for_model: true,
//             },
//           }),
//         }
//       );
  
//       if (!response.ok) {
//         throw new Error(`Hugging Face API error: ${response.statusText}`);
//       }
  
//       const result = await response.json();
//       const text = result[0]?.generated_text?.trim() || "";
      
//       return text || "I'm here to help with customer retention. Please ask me about your customers!";
//     } catch (error: any) {
//       console.error("Hugging Face chat error:", error);
//       throw error;
//     }
//   }
  
//   // ============================================
//   // IMAGE ANALYSIS - Free Vision Model
//   // ============================================
//   export async function analyzeImage(imageData: string, mimeType: string) {
//     try {
//       const response = await fetch(
//         "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large",
//         {
//           method: "POST",
//           headers: {
//             "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             inputs: imageData,
//             options: {
//               wait_for_model: true,
//             },
//           }),
//         }
//       );
  
//       if (!response.ok) {
//         throw new Error(`Hugging Face API error: ${response.statusText}`);
//       }
  
//       const result = await response.json();
//       const caption = result[0]?.generated_text || "Image analyzed";
  
//       const peopleMatch = caption.match(/(\d+)\s+people/i);
//       const peopleCount = peopleMatch ? parseInt(peopleMatch[1]) : 
//                          caption.toLowerCase().includes("people") ? 2 : 0;
  
//       let engagementLevel: "low" | "medium" | "high" = "medium";
//       if (caption.toLowerCase().includes("crowd") || peopleCount > 5) {
//         engagementLevel = "high";
//       } else if (peopleCount <= 1) {
//         engagementLevel = "low";
//       }
  
//       return {
//         peopleCount,
//         engagementLevel,
//         activities: [caption],
//         mood: "neutral",
//         insights: [
//           `AI detected: ${caption}`,
//           `Estimated ${peopleCount} people in image`,
//           `Engagement level: ${engagementLevel}`,
//         ],
//         recommendations: [
//           "Use visual insights for customer segmentation",
//           "Track customer activity patterns from images",
//           "Engage based on observed behavior",
//         ],
//       };
//     } catch (error: any) {
//       console.error("Hugging Face image error:", error);
//       throw error;
//     }
//   }
  
//   // Other functions not needed for HuggingFace
//   export async function analyzeChurnRisk(customers: any[]) {
//     throw new Error("Use OpenAI or Gemini for churn analysis");
//   }
  
//   export async function personalizeEmail(template: string, customer: any) {
//     throw new Error("Use OpenAI or Gemini for email personalization");
//   }
  
//   export async function generateReport(reportData: any) {
//     throw new Error("Use OpenAI or Gemini for report generation");
//   }
  
//   export async function createEmbedding(_text: string): Promise<number[]> {
//     throw new Error("Embeddings disabled");
//   }
  
//   export async function createEmbeddingsBatch(_texts: string[]): Promise<number[][]> {
//     throw new Error("Embeddings disabled");
//   }


/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================
// HUGGING FACE (Free Tier)
// ============================================

// ============================================
// IMAGE ANALYSIS - Fixed to send binary data!
// ============================================
/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================
// HUGGING FACE (Free Tier) - FIXED ENDPOINT!
// ============================================

// ============================================
// IMAGE ANALYSIS - NEW ENDPOINT!
// ============================================
export async function analyzeImage(imageData: string, mimeType: string) {
    try {
      console.log("📸 Analyzing with Hugging Face (NEW endpoint)...");
  
      // Convert base64 to binary
      const binaryData = Buffer.from(imageData, 'base64');
  
      // ✅ NEW ENDPOINT: router.huggingface.co
      const response = await fetch(
        "https://api.huggingface.co/models/Salesforce/blip-image-captioning-large",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            "Content-Type": "image/jpeg", // ✅ Changed!
          },
          body: binaryData,
        }
      );
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Hugging Face error:", response.status, errorText);
        throw new Error(`Hugging Face API error: ${response.status}`);
      }
  
      const result = await response.json();
      console.log("✅ Hugging Face result:", result);
  
      const caption = result[0]?.generated_text || "Image analyzed";
  
      const peopleMatch = caption.match(/(\d+)\s+people/i);
      const peopleCount = peopleMatch ? parseInt(peopleMatch[1]) : 
                         caption.toLowerCase().includes("people") ? 2 : 0;
  
      let engagementLevel: "low" | "medium" | "high" = "medium";
      if (caption.toLowerCase().includes("crowd") || peopleCount > 5) {
        engagementLevel = "high";
      } else if (peopleCount <= 1) {
        engagementLevel = "low";
      }
  
      return {
        peopleCount,
        engagementLevel,
        activities: [caption],
        mood: "neutral",
        insights: [
          `AI detected: ${caption}`,
          `Estimated ${peopleCount} people in image`,
          `Engagement level: ${engagementLevel}`,
        ],
        recommendations: [
          "Use visual insights for customer segmentation",
          "Track customer activity patterns from images",
          "Engage based on observed behavior",
        ],
      };
    } catch (error: any) {
      console.error("❌ Hugging Face error:", error);
      throw error;
    }
  }
  
  // ... rest of the file stays same
  
  // ============================================
  // CHATBOT - Free Text Generation
  // ============================================
  export async function chatbotResponse(
    userMessage: string,
    customerContext: any[] = [],
    conversationHistory: Array<{ role: string; content: string }> = []
  ) {
    try {
      const contextText =
        customerContext.length > 0
          ? `\n\nCustomer data: ${JSON.stringify(customerContext.slice(0, 10), null, 2)}`
          : "";
  
      const historyText =
        conversationHistory.length > 0
          ? `\n\nHistory:\n${conversationHistory
              .slice(-3)
              .map((msg) => `${msg.role}: ${msg.content}`)
              .join("\n")}`
          : "";
  
      const prompt = `You are ChurnGuard AI, a customer retention expert.
  
  ${historyText}${contextText}
  
  User: "${userMessage}"
  
  Respond as a helpful retention advisor. Give 3-5 actionable recommendations.`;
  
      const response = await fetch(
        "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: 500,
              temperature: 0.7,
              return_full_text: false,
            },
            options: {
              wait_for_model: true,
            },
          }),
        }
      );
  
      if (!response.ok) {
        throw new Error(`Hugging Face API error: ${response.statusText}`);
      }
  
      const result = await response.json();
      const text = result[0]?.generated_text?.trim() || "";
      
      return text || "I'm here to help with customer retention. Please ask me about your customers!";
    } catch (error: any) {
      console.error("Hugging Face chat error:", error);
      throw error;
    }
  }
  
  // Other functions not needed for HuggingFace
  export async function analyzeChurnRisk(customers: any[]) {
    throw new Error("Use OpenAI or Gemini for churn analysis");
  }
  
  export async function personalizeEmail(template: string, customer: any) {
    throw new Error("Use OpenAI or Gemini for email personalization");
  }
  
  export async function generateReport(reportData: any) {
    throw new Error("Use OpenAI or Gemini for report generation");
  }
  
  export async function createEmbedding(_text: string): Promise<number[]> {
    throw new Error("Embeddings disabled");
  }
  
  export async function createEmbeddingsBatch(_texts: string[]): Promise<number[][]> {
    throw new Error("Embeddings disabled");
  }