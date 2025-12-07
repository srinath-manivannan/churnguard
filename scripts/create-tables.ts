// ============================================
// DIRECT TABLE CREATION SCRIPT
// ============================================
// This script creates all tables directly in Turso
// Use this if drizzle-kit push has issues

import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

// Create Turso client
const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function createTables() {
  try {
    console.log("🔄 Creating tables...");

    // Create users table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        name TEXT,
        avatar_url TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      )
    `);
    console.log("✅ users table created");

    // Create customers table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        external_id TEXT,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        company TEXT,
        segment TEXT,
        last_activity_date TEXT,
        total_revenue REAL DEFAULT 0,
        support_tickets INTEGER DEFAULT 0,
        churn_score REAL DEFAULT 0,
        risk_level TEXT DEFAULT 'low',
        risk_factors TEXT,
        metadata TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log("✅ customers table created");

    // Create customer_events table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS customer_events (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        customer_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        event_data TEXT,
        occurred_at INTEGER NOT NULL DEFAULT (unixepoch()),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
      )
    `);
    console.log("✅ customer_events table created");

    // Create campaigns table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT DEFAULT 'draft',
        target_filter TEXT,
        email_subject TEXT,
        email_template TEXT,
        sms_template TEXT,
        sent_count INTEGER DEFAULT 0,
        delivered_count INTEGER DEFAULT 0,
        opened_count INTEGER DEFAULT 0,
        clicked_count INTEGER DEFAULT 0,
        converted_count INTEGER DEFAULT 0,
        scheduled_at INTEGER,
        completed_at INTEGER,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log("✅ campaigns table created");

    // Create campaign_logs table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS campaign_logs (
        id TEXT PRIMARY KEY,
        campaign_id TEXT NOT NULL,
        customer_id TEXT NOT NULL,
        message_type TEXT NOT NULL,
        personalized_content TEXT,
        status TEXT DEFAULT 'pending',
        message_id TEXT,
        sent_at INTEGER,
        delivered_at INTEGER,
        opened_at INTEGER,
        clicked_at INTEGER,
        error_message TEXT,
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
      )
    `);
    console.log("✅ campaign_logs table created");

    // Create chat_history table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS chat_history (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        user_message TEXT NOT NULL,
        ai_response TEXT NOT NULL,
        context_used TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log("✅ chat_history table created");

    // Create image_metadata table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS image_metadata (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        google_drive_file_id TEXT,
        filename TEXT NOT NULL,
        mime_type TEXT,
        file_size INTEGER,
        exif_data TEXT,
        analysis TEXT,
        uploaded_at INTEGER,
        analyzed_at INTEGER NOT NULL DEFAULT (unixepoch()),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log("✅ image_metadata table created");

    // Create file_uploads table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS file_uploads (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        filename TEXT NOT NULL,
        file_type TEXT,
        file_size_bytes INTEGER,
        status TEXT DEFAULT 'pending',
        records_imported INTEGER DEFAULT 0,
        records_failed INTEGER DEFAULT 0,
        validation_results TEXT,
        error_message TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        processed_at INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log("✅ file_uploads table created");

    // Create reports table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        report_type TEXT NOT NULL,
        title TEXT NOT NULL,
        html_content TEXT,
        report_data TEXT,
        start_date INTEGER,
        end_date INTEGER,
        email_sent INTEGER DEFAULT 0,
        email_sent_at INTEGER,
        generated_at INTEGER NOT NULL DEFAULT (unixepoch()),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log("✅ reports table created");

    // Create indexes for performance
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id)
    `);
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_customers_risk_level ON customers(risk_level)
    `);
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_customers_churn_score ON customers(churn_score)
    `);
    console.log("✅ indexes created");

    console.log("\n🎉 All tables created successfully!");
    
  } catch (error) {
    console.error("❌ Error creating tables:", error);
    throw error;
  }
}

// Run the script
createTables()
  .then(() => {
    console.log("✅ Database setup complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  });