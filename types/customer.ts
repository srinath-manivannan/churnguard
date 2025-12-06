// ============================================
// CUSTOMER-RELATED TYPE DEFINITIONS
// ============================================

// CSV upload mapping - tells us which CSV column maps to which DB field
export type CsvColumnMapping = {
    name: string | null; // Which CSV column contains customer name
    email: string | null; // Which CSV column contains email
    phone: string | null;
    company: string | null;
    segment: string | null;
    lastActivityDate: string | null;
    totalRevenue: string | null;
    supportTickets: string | null;
    // Allow any additional fields
    [key: string]: string | null;
  };
  
  // Parsed CSV row (before DB insert)
  export type ParsedCustomerRow = {
    rowNumber: number; // Which row in CSV (for error reporting)
    data: {
      name: string;
      email?: string;
      phone?: string;
      company?: string;
      segment?: string;
      lastActivityDate?: string;
      totalRevenue?: number;
      supportTickets?: number;
      metadata?: Record<string, any>; // Extra fields go here
    };
    errors: string[]; // Validation errors for this row
    isValid: boolean;
  };
  
  // CSV validation result
  export type CsvValidationResult = {
    isValid: boolean;
    totalRows: number;
    validRows: number;
    invalidRows: number;
    errors: Array<{
      row: number;
      column: string;
      value: any;
      error: string;
    }>;
    preview: ParsedCustomerRow[]; // First 10 rows
  };
  
  // Churn analysis request to Gemini
  export type ChurnAnalysisRequest = {
    customers: Array<{
      id: string;
      name: string;
      email?: string;
      lastActivityDate?: string;
      totalRevenue: number;
      supportTickets: number;
      segment?: string;
    }>;
  };
  
  // Churn analysis response from Gemini
  export type ChurnAnalysisResponse = {
    customerId: string;
    churnScore: number; // 0-100
    riskLevel: "low" | "medium" | "high" | "critical";
    riskFactors: string[]; // Array of reasons
    recommendedAction: string;
  }[];
  
  // Customer filter for queries
  export type CustomerFilter = {
    riskLevel?: RiskLevel | RiskLevel[];
    segment?: string | string[];
    minRevenue?: number;
    maxRevenue?: number;
    minDaysSinceActivity?: number;
    maxDaysSinceActivity?: number;
    search?: string; // Search by name or email
  };