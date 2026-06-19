import axios from "axios";

export const AUTH_TOKEN_KEY = "storeflow_auth_token";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const api = axios.create({
  baseURL,
  timeout: 15000,
});

export function getAuthToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token) {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const MAX_RETRIES = 2;
const RETRYABLE_STATUSES = [408, 429, 500, 502, 503, 504];

function isRetryable(error) {
  if (!error || !error.config || error.config._retryCount >= MAX_RETRIES) return false;
  if (error.code === "ECONNABORTED") return true;
  if (error.response && RETRYABLE_STATUSES.includes(error.response.status)) return true;
  return false;
}

function normalizeError(error) {
  if (error._normalized) return error;
  const status = error?.response?.status || 0;
  const data = error?.response?.data || {};
  const err = new Error(
    data?.message || data?.error || error?.message || "Request failed"
  );
  err.status = status;
  err.success = false;
  err.data = data;
  err._normalized = true;
  return err;
}

export function createCancelToken() {
  const controller = new AbortController();
  return { signal: controller.signal, cancel: () => controller.abort() };
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isCancel(error)) {
      const err = new Error("Request cancelled");
      err.isCancelled = true;
      return Promise.reject(err);
    }

    if (error.response?.status === 401) {
      setAuthToken(null);
      window.location.href = "/login";
    }

    if (isRetryable(error)) {
      error.config._retryCount = (error.config._retryCount || 0) + 1;
      await new Promise((r) => setTimeout(r, 1000 * error.config._retryCount));
      return api(error.config);
    }

    return Promise.reject(normalizeError(error));
  }
);

export default api;
