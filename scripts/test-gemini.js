import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function testGemini() {
  console.log("\n🧪 Testing Gemini API...\n");

  const apiKey = process.env.GEMINI_API_KEY;
  console.log("🔑 Key prefix:", apiKey?.slice(0, 12) + "...");

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent("Say OK");

    console.log("✅ Response:", result.response.text());
  } catch (e) {
    console.error("❌ Test failed:", e.status, e.message);
  }
}

testGemini();
