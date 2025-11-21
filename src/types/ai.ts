// src/types/ai.ts
export type AnalyzeType = "code" | "sql" | "log" | "other";
export type LanguageCode = "vi" | "en";
export type EmailTone = "client" | "manager" | "internal";

export interface ExplainFixRequest {
  type: AnalyzeType;
  content: string;
  language: LanguageCode;
}

export interface ExplainFixResponse {
  explanation: string;
  issues?: string[];
  suggestions?: string[];
}

export interface TestCaseRequest {
  requirement: string;
  language: LanguageCode;
  includeBoundary: boolean;
}

export interface TestCaseItem {
  id: string;
  title: string;
  steps: string;
  expected: string;
  priority: "Low" | "Medium" | "High";
}

export interface TestCaseResponse {
  testCases: TestCaseItem[];
}

export interface EmailHelperRequest {
  note: string;
  language: LanguageCode;
  tone: EmailTone;
}

export interface EmailHelperResponse {
  subject: string;
  body: string;
}
