import axios from "axios";

// --- API Configuration ---
// Change this URL to match your backend server
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "/api",
};

// Helper function to get the full API URL (Used for manual URL creation if needed)
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return `${API_CONFIG.BASE_URL}/${cleanEndpoint}`;
};

// Default axios configuration
export const axiosConfig = {
  baseURL: API_CONFIG.BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
};

// ------------------------------------
// 🎯 FIX: Create and Export Axios Instance
// ------------------------------------

// 1. Create the Axios instance using the exported configuration
const api = axios.create(axiosConfig);

// 2. Add an interceptor to handle authentication (CRUCIAL for user-specific data)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      // Attach the JWT token to the Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Also attach Accept-Language so backend can return localized payloads
    try {
      const lang =
        localStorage.getItem("lang") ||
        (navigator && navigator.language) ||
        "en";
      if (lang) config.headers["Accept-Language"] = lang;
    } catch (e) {
      // ignore in non-browser envs
    }

    // CSRF Token injection
    if (['post', 'put', 'patch', 'delete'].includes(config.method ? config.method.toLowerCase() : 'get')) {
      // Helper to get cookie
      const getCookie = (name) => {
        let cookieValue = null;
        if (typeof document !== 'undefined' && document.cookie && document.cookie !== '') {
          const cookies = document.cookie.split(';');
          for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
            }
          }
        }
        return cookieValue;
      };

      const csrftoken = getCookie('csrftoken');
      if (csrftoken) {
        config.headers['X-CSRFToken'] = csrftoken;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 3. Export the instantiated client as the default export.
// This resolves the "does not provide an export named 'default'" error.
export default api;
