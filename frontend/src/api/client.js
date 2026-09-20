import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

/**
 * withCredentials: true is required — our backend sends the JWT as an
 * httpOnly cookie (not a header), so the browser needs to be told to
 * send/receive cookies on cross-origin requests to the API.
 */
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let pendingQueue = [];

function resolveQueue(error) {
  pendingQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve()));
  pendingQueue = [];
}

/**
 * On a 401, try exactly one silent refresh (via /auth/refresh, which
 * reads the refreshToken cookie) and replay the original request.
 * If a refresh is already in-flight, subsequent 401s queue and wait
 * for it instead of firing parallel refresh calls.
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status !== 401 || originalRequest._retry || originalRequest.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then(() => api(originalRequest));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await api.post("/auth/refresh");
      resolveQueue(null);
      return api(originalRequest);
    } catch (refreshError) {
      resolveQueue(refreshError);
      // Refresh token is also invalid/expired — force a real logout.
      window.dispatchEvent(new CustomEvent("auth:expired"));
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);