import axios from "axios";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({ baseURL: `${BASE}/api` });

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("orbit_token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("orbit_token");
      window.location.href = "/auth/login";
    }
    return Promise.reject(err);
  }
);

export default api;

// Auth
export const login = (email: string, password: string) =>
  api.post("/auth/login", new URLSearchParams({ username: email, password }));
export const register = (email: string, password: string, full_name: string, company: string) =>
  api.post("/auth/register", { email, password, full_name, company });
export const getMe = () => api.get("/auth/me");

// Content
export const generatePost = (data: object) => api.post("/content/generate-post", data);
export const generateVideoScript = (data: object) => api.post("/content/generate-video-script", data);
export const generateStrategy = (data: object) => api.post("/content/generate-strategy", data);
export const repurposeContent = (data: object) => api.post("/content/repurpose", data);
export const generateBanner = (data: object) => api.post("/content/generate-banner", data);

// Schedule
export const listPosts = (status?: string) =>
  api.get("/schedule/posts", { params: status ? { status } : {} });
export const createPost = (data: object) => api.post("/schedule/posts", data);
export const publishNow = (id: number) => api.post(`/schedule/posts/${id}/publish-now`);
export const deletePost = (id: number) => api.delete(`/schedule/posts/${id}`);

// Analytics
export const getOverview = (days = 30) => api.get("/analytics/overview", { params: { days } });
export const getCausalInsights = (refresh = false) =>
  api.get("/analytics/causal-insights", { params: { refresh } });
export const getTopPosts = (limit = 10, metric = "engagements") =>
  api.get("/analytics/top-posts", { params: { limit, metric } });

// Platforms
export const listPlatforms = () => api.get("/platforms/");
export const connectPlatform = (data: object) => api.post("/platforms/connect", data);
export const disconnectPlatform = (platform: string) => api.delete(`/platforms/${platform}`);
