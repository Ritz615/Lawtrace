// Typed API client for LexAI frontend — all endpoints with auth headers.
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// ── Axios instance ─────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

// Attach Bearer token from localStorage on every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) {
        try {
          const res = await axios.post(`${BASE_URL}/auth/refresh`, { refresh_token: refresh });
          const newToken = res.data.access_token;
          localStorage.setItem("access_token", newToken);
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);
        } catch {
          localStorage.clear();
          window.location.href = "/auth/login";
        }
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

// ── Auth ───────────────────────────────────────────────────────────────────────
export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    return data;
  },
  register: async (payload: { email: string; full_name: string; password: string; role: string }) => {
    const { data } = await api.post("/auth/register", payload);
    return data;
  },
  refresh: async (refresh_token: string) => {
    const { data } = await api.post("/auth/refresh", { refresh_token });
    return data;
  },
  forgotPassword: async (email: string) => {
    const { data } = await api.post("/auth/forgot-password", { email });
    return data;
  },
  resetPassword: async (token: string, new_password: string) => {
    const { data } = await api.post("/auth/reset-password", { token, new_password });
    return data;
  },
  me: async () => {
    const { data } = await api.get("/auth/me");
    return data;
  },
};

// ── Documents ──────────────────────────────────────────────────────────────────
export const documentsApi = {
  upload: async (file: File, folder?: string, tags?: string) => {
    const form = new FormData();
    form.append("file", file);
    const params = new URLSearchParams();
    if (folder) params.append("folder", folder);
    if (tags) params.append("tags", tags);
    const { data } = await api.post(`/documents/upload?${params}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  list: async (params?: { folder?: string; tag?: string; search?: string; page?: number; limit?: number }) => {
    const { data } = await api.get("/documents/", { params });
    return data;
  },
  get: async (id: string) => {
    const { data } = await api.get(`/documents/${id}`);
    return data;
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/documents/${id}`);
    return data;
  },
  getDownloadUrl: async (id: string) => {
    const { data } = await api.get(`/documents/${id}/download-url`);
    return data;
  },
  getVersions: async (id: string) => {
    const { data } = await api.get(`/documents/${id}/versions`);
    return data;
  },
};

// ── AI ─────────────────────────────────────────────────────────────────────────
export const aiApi = {
  analyze: async (document_id: string) => {
    const { data } = await api.post("/ai/analyze", { document_id });
    return data;
  },
  chat: async (document_id: string, question: string, history: object[] = []) => {
    const { data } = await api.post("/ai/chat", { document_id, question, conversation_history: history });
    return data;
  },
  compare: async (document_id_a: string, document_id_b: string) => {
    const { data } = await api.post("/ai/compare", { document_id_a, document_id_b });
    return data;
  },
  generate: async (contract_type: string, form_data: Record<string, string>) => {
    const { data } = await api.post("/ai/generate", { contract_type, form_data });
    return data;
  },
  getReport: async (document_id: string) => {
    const { data } = await api.get(`/ai/report/${document_id}`);
    return data;
  },
};

// ── Analytics ──────────────────────────────────────────────────────────────────
export const analyticsApi = {
  summary: async () => {
    const { data } = await api.get("/analytics/summary");
    return data;
  },
  monthly: async (months = 6) => {
    const { data } = await api.get("/analytics/monthly", { params: { months } });
    return data;
  },
  riskByType: async () => {
    const { data } = await api.get("/analytics/risk-by-type");
    return data;
  },
  expiring: async (days = 30) => {
    const { data } = await api.get("/analytics/expiring", { params: { days } });
    return data;
  },
};

// ── Notifications ──────────────────────────────────────────────────────────────
export const notificationsApi = {
  list: async (unread_only = false) => {
    const { data } = await api.get("/notifications/", { params: { unread_only } });
    return data;
  },
  markRead: async (id: string) => {
    const { data } = await api.patch(`/notifications/${id}/read`);
    return data;
  },
  markAllRead: async () => {
    const { data } = await api.patch("/notifications/read-all");
    return data;
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/notifications/${id}`);
    return data;
  },
};

// ── Reports ────────────────────────────────────────────────────────────────────
export const reportsApi = {
  downloadPdf: (document_id: string) => `${BASE_URL}/reports/${document_id}/pdf`,
  downloadDocx: (document_id: string) => `${BASE_URL}/reports/${document_id}/docx`,
};

export default api;
