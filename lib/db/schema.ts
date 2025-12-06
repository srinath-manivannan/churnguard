// ============================================
// DATABASE SCHEMA - ALL TABLES DEFINITION
// ============================================
// This file defines the structure of all database tables
// Each table represents a different entity in our ChurnGuard system

import { sql } from "drizzle-orm";
import { 
  text, 
  integer, 
  real, 
  sqliteTable 
} from "drizzle-orm/sqlite-core";

// ============================================
// USERS TABLE
// ============================================
// Stores user account information for authentication
export const users = sqliteTable("users", {
  // Primary key - unique identifier for each user
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  
  // User credentials
  email: text("email").notNull().unique(), // Email must be unique
  passwordHash: text("password_hash").notNull(), // Encrypted password (bcrypt)
  
  // User profile information
  name: text("name"),
  avatarUrl: text("avatar_url"),
  
  // Account metadata
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`), // Unix timestamp when account created
});

// ============================================
// CUSTOMERS TABLE
// ============================================
// Stores customer information and churn-related data
export const customers = sqliteTable("customers", {
  // Primary key
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  
  // Foreign key - which user owns this customer data
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }), // If user deleted, delete their customers
  
  // Customer identification
  externalId: text("external_id"), // Customer's ID in their system (optional)
  
  // Basic customer information
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  company: text("company"),
  segment: text("segment"), // e.g., "enterprise", "smb", "startup"
  
  // Behavioral data (from CSV upload or integrations)
  lastActivityDate: text("last_activity_date"), // ISO date string
  totalRevenue: real("total_revenue").default(0), // Total $ spent
  supportTickets: integer("support_tickets").default(0), // Number of support tickets
  
  // AI-calculated churn metrics
  churnScore: real("churn_score").default(0), // 0-100 score calculated by Gemini
  riskLevel: text("risk_level").default("low"), // "low", "medium", "high", "critical"
  riskFactors: text("risk_factors"), // JSON string array of risk reasons
  
  // Additional metadata (JSON format for flexibility)
  metadata: text("metadata"), // Store any extra fields from CSV
  
  // Timestamps
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ============================================
// CUSTOMER EVENTS TABLE
// ============================================
// Tracks individual customer activities/interactions
export const customerEvents = sqliteTable("customer_events", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  
  // Foreign keys
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  customerId: text("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  
  // Event details
  eventType: text("event_type").notNull(), // "login", "purchase", "support_ticket", "feature_use"
  eventData: text("event_data"), // JSON string with event-specific data
  
  // When this event occurred
  occurredAt: integer("occurred_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ============================================
// CAMPAIGNS TABLE
// ============================================
// Stores retention campaign information
export const campaigns = sqliteTable("campaigns", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  
  // Owner
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  // Campaign details
  name: text("name").notNull(),
  type: text("type").notNull(), // "email", "sms", "both"
  status: text("status").default("draft"), // "draft", "scheduled", "sending", "completed", "paused"
  
  // Targeting
  targetFilter: text("target_filter"), // JSON: {"riskLevel": "high", "segment": "enterprise"}
  
  // Message content
  emailSubject: text("email_subject"),
  emailTemplate: text("email_template"), // HTML or plain text
  smsTemplate: text("sms_template"),
  
  // Campaign statistics
  sentCount: integer("sent_count").default(0),
  deliveredCount: integer("delivered_count").default(0),
  openedCount: integer("opened_count").default(0),
  clickedCount: integer("clicked_count").default(0),
  convertedCount: integer("converted_count").default(0),
  
  // Scheduling
  scheduledAt: integer("scheduled_at", { mode: "timestamp" }),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  
  // Metadata
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ============================================
// CAMPAIGN LOGS TABLE
// ============================================
// Tracks individual message sends and their status
export const campaignLogs = sqliteTable("campaign_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  
  // Foreign keys
  campaignId: text("campaign_id")
    .notNull()
    .references(() => campaigns.id, { onDelete: "cascade" }),
  customerId: text("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  
  // Message details
  messageType: text("message_type").notNull(), // "email" or "sms"
  personalizedContent: text("personalized_content"), // The actual message sent
  
  // Delivery tracking
  status: text("status").default("pending"), // "pending", "sent", "delivered", "opened", "clicked", "bounced", "failed"
  
  // External IDs from email/SMS providers
  messageId: text("message_id"), // ID from Resend/Twilio
  
  // Timestamps for each stage
  sentAt: integer("sent_at", { mode: "timestamp" }),
  deliveredAt: integer("delivered_at", { mode: "timestamp" }),
  openedAt: integer("opened_at", { mode: "timestamp" }),
  clickedAt: integer("clicked_at", { mode: "timestamp" }),
  
  // Error information
  errorMessage: text("error_message"),
});

// ============================================
// CHAT HISTORY TABLE
// ============================================
// Stores conversations between user and AI chatbot
export const chatHistory = sqliteTable("chat_history", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  
  // Owner
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  // Conversation
  userMessage: text("user_message").notNull(),
  aiResponse: text("ai_response").notNull(),
  
  // Context used in response (for debugging/improvement)
  contextUsed: text("context_used"), // JSON string with customer data used
  
  // Metadata
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ============================================
// IMAGE METADATA TABLE
// ============================================
// Stores information about analyzed images
export const imageMetadata = sqliteTable("image_metadata", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  
  // Owner
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  // Image source
  googleDriveFileId: text("google_drive_file_id"),
  filename: text("filename").notNull(),
  mimeType: text("mime_type"),
  fileSize: integer("file_size"), // in bytes
  
  // EXIF data (from image metadata)
  exifData: text("exif_data"), // JSON: {timestamp, location, device, etc.}
  
  // AI analysis results (from Gemini Vision)
  analysis: text("analysis"), // JSON: {peopleCount, engagement, activities, insights}
  
  // Timestamps
  uploadedAt: integer("uploaded_at", { mode: "timestamp" }),
  analyzedAt: integer("analyzed_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ============================================
// FILE UPLOADS TABLE
// ============================================
// Tracks CSV file uploads and processing status
export const fileUploads = sqliteTable("file_uploads", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  
  // Owner
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  // File details
  filename: text("filename").notNull(),
  fileType: text("file_type"), // "csv", "xlsx"
  fileSizeBytes: integer("file_size_bytes"),
  
  // Processing status
  status: text("status").default("pending"), // "pending", "processing", "completed", "failed"
  
  // Results
  recordsImported: integer("records_imported").default(0),
  recordsFailed: integer("records_failed").default(0),
  validationResults: text("validation_results"), // JSON with errors
  
  // Error information
  errorMessage: text("error_message"),
  
  // Timestamps
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  processedAt: integer("processed_at", { mode: "timestamp" }),
});

// ============================================
// REPORTS TABLE
// ============================================
// Stores generated analytical reports
export const reports = sqliteTable("reports", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  
  // Owner
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  // Report details
  reportType: text("report_type").notNull(), // "weekly", "monthly", "campaign", "custom"
  title: text("title").notNull(),
  
  // Report content (generated by Gemini)
  htmlContent: text("html_content"), // Full HTML report
  
  // Report data (for regeneration)
  reportData: text("report_data"), // JSON with raw data used
  
  // Date range covered
  startDate: integer("start_date", { mode: "timestamp" }),
  endDate: integer("end_date", { mode: "timestamp" }),
  
  // Email status
  emailSent: integer("email_sent").default(0), // 0 or 1 (boolean)
  emailSentAt: integer("email_sent_at", { mode: "timestamp" }),
  
  // Metadata
  generatedAt: integer("generated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ============================================
// INDEXES FOR PERFORMANCE
// ============================================
// These help queries run faster by creating quick lookups

// Index on customer's userId for fast filtering
// Index on churnScore for sorting by risk
// Index on lastActivityDate for finding inactive customers
// (These are created automatically by Drizzle based on our references)