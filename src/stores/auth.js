import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "axios";
import { API_CONFIG, getApiUrl } from "@/config/api";

const API_URL = API_CONFIG.BASE_URL + "/";

export const useAuthStore = defineStore("auth", () => {
  const token = ref(localStorage.getItem("access_token") || null);
  const user = ref(JSON.parse(localStorage.getItem("user")) || null);

  const isAuthenticated = computed(() => !!token.value);
  const username = computed(() => (user.value ? user.value.name : "Guest"));

  const setToken = (newToken, newUser) => {
    token.value = newToken;
    user.value = newUser;
    localStorage.setItem("access_token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    // Set the Authorization header for all subsequent API calls
    axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
  };

  const clearAuth = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
  };

  const refreshAuth = () => {
    const storedToken = localStorage.getItem("access_token");
    const storedUserRaw = localStorage.getItem("user");

    if (storedToken) {
      token.value = storedToken;
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
    if (!token.value) {
      console.log("No token available for fetchUser.");
      return;
    }

    try {
      // Try several common endpoints for fetching the current user profile.
      // Some backends expose `auth/me`, others `user/profile/` or `auth/user/`.
      const candidateEndpoints = ["auth/me", "user/profile/", "auth/user/"];

      let response = null;
      for (const ep of candidateEndpoints) {
        try {
          response = await axios.get(getApiUrl(ep));
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

  return {
    token,
    user,
    isAuthenticated,
    username,
    setToken,
    clearAuth,
    refreshAuth,
    fetchUser, // <-- IMPORTANT: Return the new action
  };
});
