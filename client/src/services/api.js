
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT
api.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token")
        : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Centralized response handling
api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.code === "ECONNABORTED") {
      error.message = "Request timed out. Please try again.";
    } else if (!error.response) {
      error.message =
        "Cannot connect to the server. Check whether your backend is running.";
    } else {
      const status = error.response.status;
      const serverMessage = error.response.data?.message;

      if (status === 401) {
        const requestUrl = error.config?.url || "";

        // Do not clear session for failed login/register requests.
        const isAuthRequest =
          /\/auth\/(login|register|forgot-password|reset-password)(\?|$)/.test(
            requestUrl
          );

        if (!isAuthRequest && typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("currentUser");

          // Notify React application to synchronize auth state.
          window.dispatchEvent(
            new Event("auth:session-expired")
          );
        }

        error.message =
          serverMessage || "Session expired. Please log in again.";
      } else if (status === 403) {
        error.message =
          serverMessage || "You do not have permission to perform this action.";
      } else if (status >= 500) {
        error.message =
          serverMessage || "Server error. Please try again later.";
      } else if (serverMessage) {
        error.message = serverMessage;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
