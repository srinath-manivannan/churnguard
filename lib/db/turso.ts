// ============================================
// TURSO DATABASE CONNECTION
// ============================================
// This file creates the connection to Turso database
// and sets up Drizzle ORM

import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

// ============================================
// CREATE TURSO CLIENT
// ============================================
// This connects to our Turso database using credentials from .env
const tursoClient = createClient({
  url: process.env.TURSO_DATABASE_URL!, // Database URL
  authToken: process.env.TURSO_AUTH_TOKEN!, // Authentication token
});

// ============================================
// CREATE DRIZZLE ORM INSTANCE
// ============================================
// This wraps the Turso client with Drizzle ORM for easier queries
export const db = drizzle(tursoClient, { schema });

// ============================================
// TEST CONNECTION FUNCTION
// ============================================
// Use this to verify database connection works
export async function testConnection() {
  try {
    // Try a simple query
    const result = await tursoClient.execute("SELECT 1 as test");
    console.log("✅ Database connected successfully!");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}