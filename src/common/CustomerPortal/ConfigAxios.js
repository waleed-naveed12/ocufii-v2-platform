import axios from "axios";
import Toast from "../../utility/CustomerPortal/Toast";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: window.CustomerPortalBaseAPIURL, // Fallback to /api if window.baseAPIURL is not available
  timeout: 60000, // 60 seconds timeout
  headers: {
    // Remove Content-Type and Accept to avoid preflight
    "Content-Type": "application/json",
    Accept: "application/json",
    "access-control-allow-origin": "*",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from sessionStorage (tab-specific)
    const token = sessionStorage.getItem("ocufii_auth_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid - clear this tab's session
      sessionStorage.removeItem("ocufii_auth_token");
      sessionStorage.removeItem("ocufii_user_session");

      // With HashRouter the route lives in window.location.hash (#/login)
      const isOnLogin = window.location.hash.includes("/login");
      if (!isOnLogin) {
        Toast.warn("Your session has expired. Please log in again.");
        setTimeout(() => {
          window.location.replace(
            window.location.origin + window.location.pathname + "#/login",
          );
        }, 3500);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
