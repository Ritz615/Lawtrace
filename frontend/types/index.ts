/**
 * LexAI TypeScript Type Definitions
 */

// ── User & Auth ───────────────────────────────────────────────────────────────

export type UserRole =
  | "admin"
  | "lawyer"
  | "hr_manager"
  | "business_user"
  | "client";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  avatar_url?: string;
  department?: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  access_token: string | null;
  refresh_token: string | null;
  isAuthenticated: boolean;
}

// ── Documents ─────────────────────────────────────────────────────────────────

export type DocumentStatus =
  | "uploaded"
  | "processing"
  | "analyzed"
  | "error"
  | "archived";

export interface Document {
  id: string;
  owner_id: string;
  title: string;
  original_filename: string;
  file_type: "pdf" | "docx" | "image" | string;
  file_size: number;
  status: DocumentStatus;
  folder?: string;
  tags: string[];
  version: number;
  page_count?: number;
  created_at: string;
  updated_at: string;
  ai_report?: AIReport;
}

// ── AI Analysis ───────────────────────────────────────────────────────────────

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type ContractType =
  | "employment"
  | "nda"
  | "rental"
  | "partnership"
  | "service"
  | "freelance"
  | "internship"
  | "privacy_policy"
  | "terms_conditions"
  | "other";

export interface ClauseData {
  renewal?: string;
  payment_terms?: string;
  confidentiality?: string;
  termination?: string;
  liability?: string;
  ip?: string;
  governing_law?: string;
  arbitration?: string;
  penalty?: string;
  notice_period?: string;
  force_majeure?: string;
}

export interface AIReport {
  id: string;
  document_id: string;
  contract_type?: ContractType;
  parties: string[];
  effective_date?: string;
  expiration_date?: string;
  clauses: ClauseData;
  executive_summary?: string;
  rights: string[];
  obligations: string[];
  key_risks: string[];
  missing_clauses: string[];
  recommendations: string[];
  risk_level?: RiskLevel;
  risk_score?: number;
  risk_explanation?: string;
  ai_confidence?: number;
  model_used?: string;
  processing_time_seconds?: number;
  created_at: string;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export interface DashboardOverview {
  total_contracts: number;
  high_risk: number;
  expiring_soon: number;
  ai_analyzed: number;
  pending_review: number;
}

// ── Notifications ─────────────────────────────────────────────────────────────

export type NotificationType =
  | "expiry_warning"
  | "renewal_due"
  | "pending_review"
  | "ai_complete"
  | "high_risk";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  document_id?: string;
  created_at: string;
}

// ── Charts ────────────────────────────────────────────────────────────────────

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

// ── API Responses ─────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface JobStatus {
  job_id: string;
  status: "pending" | "progress" | "complete" | "error";
  progress: number;
  step?: string;
  result?: unknown;
  error?: string;
}
