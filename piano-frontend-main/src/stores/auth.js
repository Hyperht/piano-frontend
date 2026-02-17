import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "axios";
import api, { API_CONFIG, getApiUrl } from "@/config/api";

const API_URL = API_CONFIG.BASE_URL + "/";

export const useAuthStore = defineStore("auth", () => {
  const token = ref(localStorage.getItem("access_token") || null);
  const user = ref(JSON.parse(localStorage.getItem("user")) || null);
  const isInitialized = ref(false);

  const isAuthenticated = computed(() => !!user.value);
  const username = computed(() => (user.value ? user.value.name : "Guest"));

  const setToken = (newToken, newUser) => {
    token.value = newToken;
    user.value = newUser;
    localStorage.setItem("access_token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    // Set the Authorization header for all subsequent API calls
    api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
  };

  const clearAuth = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
    delete axios.defaults.headers.common["Authorization"];
  };

  const refreshAuth = () => {
    const storedToken = localStorage.getItem("access_token");
    const storedUserRaw = localStorage.getItem("user");

    if (storedToken) {
      token.value = storedToken;
      api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
    }

    if (storedUserRaw) {
      try {
        user.value = JSON.parse(storedUserRaw);
      } catch (e) {
        console.warn("Failed to parse stored user JSON", e);
        user.value = null;
      }
    }
  };

  // 🚀 NEW ACTION: fetchUser
  const fetchUser = async () => {
    // We try to fetch user even if no token is present in state,
    // because we might rely on HttpOnly cookies.


    try {
      // Try several common endpoints for fetching the current user profile.
      // Some backends expose `auth/me`, others `user/profile/` or `auth/user/`.
      const candidateEndpoints = ["user/profile/"];

      let response = null;
      for (const ep of candidateEndpoints) {
        try {
          response = await api.get(ep);
          // stop at first successful response
          if (response && response.status >= 200 && response.status < 300)
            break;
        } catch (err) {
          // if 404, try next endpoint; otherwise rethrow to be handled below
          if (err.response && err.response.status === 404) {
            continue;
          }
          throw err;
        }
      }

      if (!response) {
        throw new Error(
          "No profile endpoint responded (404 on known endpoints)"
        );
      }

      // Assuming the API returns the user object in response.data
      const fetchedUser = response.data;

      // Update the user state and local storage
      user.value = fetchedUser;
      localStorage.setItem("user", JSON.stringify(fetchedUser));
      console.log("User profile fetched successfully.");
    } catch (error) {
      // Only clear auth when the server indicates the token is invalid/unauthorized
      const status = error && error.response && error.response.status;
      if (status === 401 || status === 403) {
        console.error(
          "fetchUser failed with unauthorized status. Clearing authentication.",
          error
        );
        clearAuth();
      } else {
        console.warn(
          "fetchUser failed but not unauthorized; keeping tokens. Error:",
          error
        );
      }
    }
  };

  const initAuth = async () => {
    if (isInitialized.value) return;
    refreshAuth(); // <--- Sync headers from localStorage to axios/api instances
    try {
      await fetchUser();
    } catch (e) {
      console.warn("initAuth: fetchUser failed", e);
    } finally {
      isInitialized.value = true;
    }
  };

  return {
    token,
    user,
    isAuthenticated,
    isInitialized,
    username,
    setToken,
    clearAuth,
    refreshAuth,
    fetchUser,
    initAuth,
  };
});
