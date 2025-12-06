// ============================================
// DATABASE TYPE DEFINITIONS
// ============================================
// These types match our database schema
// They help TypeScript catch errors at compile time

import { 
    users, 
    customers, 
    customerEvents,
    campaigns,
    campaignLogs,
    chatHistory,
    imageMetadata,
    fileUploads,
    reports
  } from "@/lib/db/schema";
  
  // ============================================
  // INFERRED TYPES FROM SCHEMA
  // ============================================
  // Drizzle automatically generates these types from our schema
  
  export type User = typeof users.$inferSelect; // User object from SELECT
  export type NewUser = typeof users.$inferInsert; // User object for INSERT
  
  export type Customer = typeof customers.$inferSelect;
  export type NewCustomer = typeof customers.$inferInsert;
  
  export type CustomerEvent = typeof customerEvents.$inferSelect;
  export type NewCustomerEvent = typeof customerEvents.$inferInsert;
  
  export type Campaign = typeof campaigns.$inferSelect;
  export type NewCampaign = typeof campaigns.$inferInsert;
  
  export type CampaignLog = typeof campaignLogs.$inferSelect;
  export type NewCampaignLog = typeof campaignLogs.$inferInsert;
  
  export type ChatHistory = typeof chatHistory.$inferSelect;
  export type NewChatHistory = typeof chatHistory.$inferInsert;
  
  export type ImageMetadata = typeof imageMetadata.$inferSelect;
  export type NewImageMetadata = typeof imageMetadata.$inferInsert;
  
  export type FileUpload = typeof fileUploads.$inferSelect;
  export type NewFileUpload = typeof fileUploads.$inferInsert;
  
  export type Report = typeof reports.$inferSelect;
  export type NewReport = typeof reports.$inferInsert;
  
  // ============================================
  // CUSTOM TYPES FOR APPLICATION USE
  // ============================================
  
  // Customer with calculated fields (not in DB)
  export type CustomerWithAnalytics = Customer & {
    daysSinceLastActivity: number;
    churnProbabilityPercent: number;
    recommendedActions: string[];
  };
  
  // Campaign with statistics
  export type CampaignWithStats = Campaign & {
    openRate: number; // percentage
    clickRate: number; // percentage
    conversionRate: number; // percentage
    recipientCount: number;
  };
  
  // Chat message for UI
  export type ChatMessage = {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    contextCustomers?: Customer[]; // Customers referenced in this message
  };
  
  // Risk level enum
  export type RiskLevel = "low" | "medium" | "high" | "critical";
  
  // Campaign status enum
  export type CampaignStatus = "draft" | "scheduled" | "sending" | "completed" | "paused" | "failed";
  
  // File upload status enum  
  export type UploadStatus = "pending" | "processing" | "completed" | "failed";