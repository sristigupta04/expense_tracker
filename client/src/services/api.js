import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token
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

// Centralized error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED") {
      error.message = "Request timed out. Please try again.";
    } else if (!error.response) {
      error.message =
        "Cannot connect to the server. Check whether your backend is running.";
    } else {
      const serverMessage = error.response.data?.message;

      if (serverMessage) {
        error.message = serverMessage;
      } else if (error.response.status === 401) {
        error.message = "Session expired. Please log in again.";
      } else if (error.response.status === 403) {
        error.message = "You do not have permission to perform this action.";
      } else if (error.response.status >= 500) {
        error.message = "Server error. Please try again later.";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
