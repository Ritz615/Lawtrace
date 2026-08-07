/**
 * LexAI – API Client
 * Centralized fetch wrapper for all backend calls
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_V1 = `${API_BASE}/api/v1`;

interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_V1}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    // Try refresh
    typeof window !== "undefined" && localStorage.removeItem("access_token");
    window.location.href = "/auth/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.error || "Request failed");
  }

  return res.json() as Promise<T>;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: {
    email: string;
    full_name: string;
    password: string;
    role?: string;
  }) => request("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (email: string, password: string) => {
    const form = new URLSearchParams({ username: email, password });
    return request("/auth/login", {
      method: "POST",
      body: form.toString(),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  },

  refresh: (refresh_token: string) =>
    request("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token }),
    }),

  forgotPassword: (email: string) =>
    request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
};

// ── Documents ─────────────────────────────────────────────────────────────────
export const documentsApi = {
  upload: (file: File, folder?: string, tags?: string[]) => {
    const form = new FormData();
    form.append("file", file);
    if (folder) form.append("folder", folder);
    if (tags) form.append("tags", tags.join(","));
    return request("/documents/upload", {
      method: "POST",
      body: form,
      headers: {},
    });
  },

  list: (params?: { folder?: string; tag?: string; search?: string; page?: number }) => {
    const q = new URLSearchParams(params as Record<string, string>);
    return request(`/documents/?${q}`);
  },

  get: (id: string) => request(`/documents/${id}`),
  delete: (id: string) => request(`/documents/${id}`, { method: "DELETE" }),
  versions: (id: string) => request(`/documents/${id}/versions`),
};

// ── AI ────────────────────────────────────────────────────────────────────────
export const aiApi = {
  analyze: (document_id: string) =>
    request("/ai/analyze", { method: "POST", body: JSON.stringify({ document_id }) }),

  chat: (document_id: string, question: string, history: unknown[] = []) =>
    request("/ai/chat", {
      method: "POST",
      body: JSON.stringify({ document_id, question, conversation_history: history }),
    }),

  compare: (document_id_a: string, document_id_b: string) =>
    request("/ai/compare", {
      method: "POST",
      body: JSON.stringify({ document_id_a, document_id_b }),
    }),

  generate: (contract_type: string, form_data: Record<string, unknown>) =>
    request("/ai/generate", {
      method: "POST",
      body: JSON.stringify({ contract_type, form_data }),
    }),
};

// ── Analytics ─────────────────────────────────────────────────────────────────
export const analyticsApi = {
  overview: () => request("/analytics/overview"),
  monthlyUploads: (months = 6) => request(`/analytics/monthly-uploads?months=${months}`),
  riskDistribution: () => request("/analytics/risk-distribution"),
  contractTypes: () => request("/analytics/contract-types"),
};

// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationsApi = {
  list: () => request("/notifications/"),
  markRead: (id: string) => request(`/notifications/${id}/read`, { method: "PATCH" }),
  markAllRead: () => request("/notifications/read-all", { method: "PATCH" }),
};

// ── Reports ───────────────────────────────────────────────────────────────────
export const reportsApi = {
  generate: (document_id: string) =>
    request(`/reports/generate/${document_id}`, { method: "POST" }),
  downloadPdf: (report_id: string) =>
    `${API_V1}/reports/${report_id}/download/pdf`,
  downloadDocx: (report_id: string) =>
    `${API_V1}/reports/${report_id}/download/docx`,
};
