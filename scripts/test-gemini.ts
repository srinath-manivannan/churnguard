/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function testGemini() {
  console.log("\n🧪 Testing Gemini API with gemini-2.5-flash...\n");
  
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("✅ API Key found:", apiKey?.substring(0, 20) + "...");
  
  const genAI = new GoogleGenerativeAI(apiKey!);
  
  try {
    // Test 1: Simple response
    console.log("🤖 Test 1: Simple greeting...");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result1 = await model.generateContent("Say hello in one word");
    const response1 = result1.response.text();
    console.log("✅ Response:", response1);
    
    // Test 2: Chat functionality
    console.log("\n💬 Test 2: Customer retention question...");
    const result2 = await model.generateContent(`You are ChurnGuard AI, a customer retention assistant.

User asks: "How can I reduce customer churn?"

Provide a brief helpful response.`);
    
    const response2 = result2.response.text();
    console.log("✅ Response:", response2);
    
    console.log("\n✨ All tests passed! Gemini 2.5 Flash is working perfectly!\n");
    console.log("🚀 You can now use the chat feature!\n");
    
  } catch (error: any) {
    console.error("\n❌ Test failed:", error.message);
    console.error("Status:", error.status);
  }
}

testGemini();