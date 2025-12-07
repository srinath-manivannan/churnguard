// ============================================
// DATABASE SCHEMA - ALL TABLES DEFINITION
// ============================================

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
export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ============================================
// CUSTOMERS TABLE
// ============================================
export const customers = sqliteTable("customers", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  externalId: text("external_id"),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  company: text("company"),
  segment: text("segment"),
  status: text("status").default("active"), // ✅ ADDED THIS
  lastActivityDate: text("last_activity_date"),
  totalRevenue: real("total_revenue").default(0),
  supportTickets: integer("support_tickets").default(0),
  churnScore: real("churn_score").default(0),
  riskLevel: text("risk_level").default("low"),
  riskFactors: text("risk_factors"),
  metadata: text("metadata"),
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
export const customerEvents = sqliteTable("customer_events", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  customerId: text("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(),
  eventData: text("event_data"),
  occurredAt: integer("occurred_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ============================================
// CAMPAIGNS TABLE
// ============================================
export const campaigns = sqliteTable("campaigns", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  status: text("status").default("draft"),
  targetFilter: text("target_filter"),
  
  // ✅ ADDED THESE FIELDS
  subject: text("subject"),
  content: text("content"),
  emailSubject: text("email_subject"),
  emailTemplate: text("email_template"),
  smsTemplate: text("sms_template"),
  
  recipientCount: integer("recipient_count").default(0), // ✅ ADDED
  sentCount: integer("sent_count").default(0),
  deliveredCount: integer("delivered_count").default(0),
  openedCount: integer("opened_count").default(0),
  clickedCount: integer("clicked_count").default(0),
  convertedCount: integer("converted_count").default(0),
  
  scheduledAt: integer("scheduled_at", { mode: "timestamp" }),
  sentAt: integer("sent_at", { mode: "timestamp" }), // ✅ ADDED
  completedAt: integer("completed_at", { mode: "timestamp" }),
  
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ============================================
// CAMPAIGN RECIPIENTS TABLE - ✅ NEW TABLE
// ============================================
export const campaignRecipients = sqliteTable("campaign_recipients", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  
  campaignId: text("campaign_id")
    .notNull()
    .references(() => campaigns.id, { onDelete: "cascade" }),
  customerId: text("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  
  status: text("status").default("pending"),
  
  sentAt: integer("sent_at", { mode: "timestamp" }),
  deliveredAt: integer("delivered_at", { mode: "timestamp" }),
  openedAt: integer("opened_at", { mode: "timestamp" }),
  
  errorMessage: text("error_message"), // ✅ This field
  
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ============================================
// CAMPAIGN LOGS TABLE
// ============================================
export const campaignLogs = sqliteTable("campaign_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  campaignId: text("campaign_id")
    .notNull()
    .references(() => campaigns.id, { onDelete: "cascade" }),
  customerId: text("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  messageType: text("message_type").notNull(),
  personalizedContent: text("personalized_content"),
  status: text("status").default("pending"),
  messageId: text("message_id"),
  sentAt: integer("sent_at", { mode: "timestamp" }),
  deliveredAt: integer("delivered_at", { mode: "timestamp" }),
  openedAt: integer("opened_at", { mode: "timestamp" }),
  clickedAt: integer("clicked_at", { mode: "timestamp" }),
  errorMessage: text("error_message"),
});

// ============================================
// CHAT HISTORY TABLE
// ============================================
export const chatHistory = sqliteTable("chat_history", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  userMessage: text("user_message").notNull(),
  aiResponse: text("ai_response").notNull(),
  contextUsed: text("context_used"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ============================================
// IMAGE METADATA TABLE
// ============================================
export const imageMetadata = sqliteTable("image_metadata", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  googleDriveFileId: text("google_drive_file_id"),
  filename: text("filename").notNull(),
  mimeType: text("mime_type"),
  fileSize: integer("file_size"),
  exifData: text("exif_data"),
  analysis: text("analysis"),
  uploadedAt: integer("uploaded_at", { mode: "timestamp" }),
  analyzedAt: integer("analyzed_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ============================================
// FILE UPLOADS TABLE
// ============================================
export const fileUploads = sqliteTable("file_uploads", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(),
  fileType: text("file_type"),
  fileSizeBytes: integer("file_size_bytes"),
  status: text("status").default("pending"),
  recordsImported: integer("records_imported").default(0),
  recordsFailed: integer("records_failed").default(0),
  validationResults: text("validation_results"),
  errorMessage: text("error_message"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  processedAt: integer("processed_at", { mode: "timestamp" }),
});

// ============================================
// REPORTS TABLE
// ============================================
export const reports = sqliteTable("reports", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  reportType: text("report_type").notNull(),
  title: text("title").notNull(),
  htmlContent: text("html_content"),
  reportData: text("report_data"),
  startDate: integer("start_date", { mode: "timestamp" }),
  endDate: integer("end_date", { mode: "timestamp" }),
  emailSent: integer("email_sent").default(0),
  emailSentAt: integer("email_sent_at", { mode: "timestamp" }),
  generatedAt: integer("generated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});