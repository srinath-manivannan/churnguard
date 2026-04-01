import {
  users,
  customers,
  customerEvents,
  campaigns,
  campaignLogs,
  chatHistory,
  imageMetadata,
  fileUploads,
  reports,
} from "@/lib/db/schema";

// Inferred types from Drizzle schema
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

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

// Derived application types
export type CustomerWithAnalytics = Customer & {
  daysSinceLastActivity: number;
  churnProbabilityPercent: number;
  recommendedActions: string[];
};

export type CampaignWithStats = Campaign & {
  openRate: number;
  clickRate: number;
  conversionRate: number;
  recipientCount: number;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  contextCustomers?: Customer[];
};

export type RiskLevel = "low" | "medium" | "high" | "critical";
export type CampaignStatus = "draft" | "scheduled" | "sending" | "completed" | "paused" | "failed";
export type UploadStatus = "pending" | "processing" | "completed" | "failed";
