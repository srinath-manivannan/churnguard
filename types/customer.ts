/* eslint-disable @typescript-eslint/no-explicit-any */
import { RiskLevel } from "./database";

export type CsvColumnMapping = {
  name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  segment: string | null;
  lastActivityDate: string | null;
  totalRevenue: string | null;
  supportTickets: string | null;
  [key: string]: string | null;
};

export type ParsedCustomerRow = {
  rowNumber: number;
  data: {
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    segment?: string;
    lastActivityDate?: string;
    totalRevenue?: number;
    supportTickets?: number;
    metadata?: Record<string, any>;
  };
  errors: string[];
  isValid: boolean;
};

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
  preview: ParsedCustomerRow[];
};

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

export type ChurnAnalysisResponse = {
  customerId: string;
  churnScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  riskFactors: string[];
  recommendedAction: string;
}[];

export type CustomerFilter = {
  riskLevel?: RiskLevel | RiskLevel[];
  segment?: string | string[];
  minRevenue?: number;
  maxRevenue?: number;
  minDaysSinceActivity?: number;
  maxDaysSinceActivity?: number;
  search?: string;
};
