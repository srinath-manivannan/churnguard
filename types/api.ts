/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================
// API RESPONSE TYPES
// ============================================
// Type definitions for API responses

// Generic API response
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    error?: string;
    data?: T;
  }
  
  // Customer list response
  export interface CustomersResponse {
    success: boolean;
    customers: any[];
    count: number;
  }
  
  // Customer create response
  export interface CustomerCreateResponse {
    success: boolean;
    message: string;
    customer: any;
  }
  
  // Churn analysis response
  export interface ChurnAnalysisResponse {
    success: boolean;
    message: string;
    stats: {
      totalAnalyzed: number;
      highRiskCount: number;
      averageChurnScore: number;
    };
    results: Array<{
      customerId: string;
      churnScore: number;
      riskLevel: string;
      riskFactors: string[];
      recommendedAction: string;
    }>;
  }
  
  // CSV upload response
  export interface CsvUploadResponse {
    success: boolean;
    message: string;
    results: {
      total: number;
      imported: number;
      failed: number;
      errors: Array<{
        row: number;
        error: string;
      }>;
    };
  }
  
  // Chat response
  export interface ChatResponse {
    success: boolean;
    response: string;
    context: {
      customersReferenced: number;
      customers: Array<{
        id: string;
        name: string;
        riskLevel: string;
      }>;
    };
  }