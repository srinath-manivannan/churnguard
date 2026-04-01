import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function testDatabase() {
  try {
    console.log("Testing database connection...\n");

    const result = await client.execute("SELECT 1 as test");
    console.log("[OK] Database connection successful");

    const tables = await client.execute(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    );

    const tableNames = tables.rows.map((r) => r.name as string);
    const expected = [
      "users",
      "customers",
      "campaigns",
      "campaign_logs",
      "chat_history",
      "customer_events",
      "image_metadata",
      "file_uploads",
      "reports",
    ];

    for (const table of expected) {
      if (tableNames.includes(table)) {
        console.log(`[OK] ${table} table exists`);
      } else {
        console.log(`[MISSING] ${table} table not found`);
      }
    }

    console.log("\nDatabase is ready!");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}

testDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Test failed:", error);
    process.exit(1);
  });
