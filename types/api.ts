/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

export interface CustomersResponse {
  success: boolean;
  customers: any[];
  count: number;
}

export interface CustomerCreateResponse {
  success: boolean;
  message: string;
  customer: any;
}

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
