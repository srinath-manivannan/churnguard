/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================
// REPLICATE (Cheap Vision API - $5 free credits!)
// ============================================

// ============================================
// IMAGE ANALYSIS - LLaVA Vision Model
// ============================================
export async function analyzeImage(imageData: string, mimeType: string) {
    try {
      console.log("📸 Analyzing with Replicate LLaVA...");
  
      // Start prediction
      const response = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          "Authorization": `Token ${process.env.REPLICATE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          version: "2e1dddc8621f72155f24cf2e0adbde548458d3cab9f00c0139eea8408460f6c6",
          input: {
            image: `data:${mimeType};base64,${imageData}`,
            prompt: "Describe this image in detail. Count any people, assess engagement level (low/medium/high), describe activities, and mood.",
          },
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Replicate API error: ${response.statusText}`);
      }
  
      let prediction = await response.json();
      console.log("Replicate prediction started:", prediction.id);
  
      // Poll for result (usually takes 2-5 seconds)
      const maxAttempts = 30; // 30 seconds max
      let attempts = 0;
  
      while (
        prediction.status !== "succeeded" &&
        prediction.status !== "failed" &&
        attempts < maxAttempts
      ) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        const pollResponse = await fetch(
          `https://api.replicate.com/v1/predictions/${prediction.id}`,
          {
            headers: {
              "Authorization": `Token ${process.env.REPLICATE_API_KEY}`,
            },
          }
        );
  
        prediction = await pollResponse.json();
        attempts++;
      }
  
      if (prediction.status === "failed") {
        throw new Error("Image analysis failed");
      }
  
      if (prediction.status !== "succeeded") {
        throw new Error("Image analysis timed out");
      }
  
      // Parse AI output
      const aiOutput = Array.isArray(prediction.output)
        ? prediction.output.join(" ")
        : prediction.output;
  
      console.log("✅ Replicate result:", aiOutput);
  
      // Extract insights from AI description
      const text = aiOutput.toLowerCase();
      
      // Count people
      const peopleMatch = text.match(/(\d+)\s+people/i);
      const peopleCount = peopleMatch ? parseInt(peopleMatch[1]) : 
                         text.includes("people") || text.includes("person") ? 1 : 0;
  
      // Determine engagement
      let engagementLevel: "low" | "medium" | "high" = "medium";
      if (text.includes("crowd") || text.includes("busy") || peopleCount > 5) {
        engagementLevel = "high";
      } else if (peopleCount <= 1 || text.includes("empty") || text.includes("quiet")) {
        engagementLevel = "low";
      }
  
      // Determine mood
      let mood = "neutral";
      if (text.includes("happy") || text.includes("smiling") || text.includes("excited")) {
        mood = "positive";
      } else if (text.includes("sad") || text.includes("frustrated") || text.includes("angry")) {
        mood = "negative";
      }
  
      return {
        peopleCount,
        engagementLevel,
        activities: [aiOutput.substring(0, 200)], // First 200 chars
        mood,
        insights: [
          `AI Analysis: ${aiOutput}`,
          `Detected ${peopleCount} people`,
          `Engagement: ${engagementLevel}`,
          `Mood: ${mood}`,
        ],
        recommendations: [
          "Use visual insights for customer segmentation",
          "Track customer activity patterns",
          "Optimize store layout based on observed behavior",
        ],
      };
    } catch (error: any) {
      console.error("❌ Replicate error:", error);
      throw error;
    }
  }
  
  // Not used for Replicate
  export async function chatbotResponse() {
    throw new Error("Use OpenAI or Gemini for chat");
  }
  
  export async function analyzeChurnRisk() {
    throw new Error("Use OpenAI or Gemini for churn analysis");
  }
  
  export async function personalizeEmail() {
    throw new Error("Use OpenAI or Gemini for email");
  }
  
  export async function generateReport() {
    throw new Error("Use OpenAI or Gemini for reports");
  }
  
  export async function createEmbedding(_text: string): Promise<number[]> {
    throw new Error("Embeddings disabled");
  }
  
  export async function createEmbeddingsBatch(_texts: string[]): Promise<number[][]> {
    throw new Error("Embeddings disabled");
  }