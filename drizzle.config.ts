// ============================================
// DRIZZLE ORM CONFIGURATION
// ============================================
// This file configures Drizzle ORM to work with Turso (libSQL)
// It tells Drizzle where to find the schema and how to connect to the database

import type { Config } from "drizzle-kit";

export default {
  // Schema location - where our database table definitions are
  schema: "./lib/db/schema.ts",
  
  // Output directory for SQL migration files
  out: "./drizzle",
  
  // Database driver - we use turso (libSQL) which is SQLite-compatible
  driver: "turso",
  
  // Database connection details from environment variables
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
} satisfies Config;