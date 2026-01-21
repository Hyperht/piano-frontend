<template>
  <div class="profile-page-wrapper">
    <Header />

    <div class="main-content-container">
      <div class="page-layout">
        <aside class="sidebar-nav">
          <div class="nav-item active">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="feather feather-user"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            {{ $t("profile.menu.details") }}
          </div>
          <router-link to="/orders" class="nav-item">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="feather feather-package"
            >
              <path d="M12.89 2.89L2 7l11.23 4.11L24 7l-11.11-4.11z"></path>
              <polyline points="2 17 12 21 22 17"></polyline>
              <polyline points="2 12 12 16 22 12"></polyline>
            </svg>
            {{ $t("profile.menu.orders") }}
          </router-link>
          <router-link to="/addresses" class="nav-item">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="feather feather-map-pin"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            {{ $t("profile.menu.addresses") }}
          </router-link>
          <div class="nav-item" @click="logoutUser">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="feather feather-log-out"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            {{ $t("profile.logout") }}
          </div>
        </aside>

        <main class="profile-content">
          <h1 class="content-header">{{ $t("profile.details_header") }}</h1>

          <div v-if="loading" class="loading-state">
            <p>{{ $t("profile.loading") }}</p>
          </div>

          <div v-else-if="error" class="error-state">
            <p>{{ error || $t("profile.loading_error") }}</p>
          </div>

          <div v-else class="profile-details-container">
            <div class="form-group">
              <label for="name">{{ $t("profile.field.name") }}</label>
              <input
                id="name"
                type="text"
                v-model="profileData.name"
                readonly
                class="readonly-input"
              />
            </div>

            <div class="form-group">
              <label for="email">{{ $t("profile.field.email") }}</label>
              <input
                id="email"
                type="email"
                v-model="profileData.email"
                readonly
                class="readonly-input"
              />
            </div>
          </div>
        </main>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import axios from "axios";
import { getApiUrl } from "@/config/api";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "vue-toastification";
import Header from "./header.vue";
import Footer from "./Footer.vue";

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();
const { t } = useI18n();

const profileData = ref({
  name: "",
  email: "",
});
const loading = ref(true);
const error = ref(null);

/**
 * Fetches the user's current profile information from the backend.
 */
const fetchProfile = async () => {
  // 🌟 IMPROVEMENT: Resolve the actual token value from the Pinia store
  // The store may expose a ref or a plain string depending on context,
  // so normalize to the raw token string before using it.
  const rawToken = authStore.token;
  const token =
    rawToken && rawToken.value !== undefined ? rawToken.value : rawToken;

  if (!token) {
    // If no token exists, but we are on the profile page, force logout/redirect.
    if (authStore.isAuthenticated) {
      if (typeof authStore.clearAuth === "function") {
        authStore.clearAuth();
      } else if (typeof authStore.logout === "function") {
        authStore.logout();
      }
      toast.error(t("profile.auth_required"));
    }
    router.push("/login");
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const response = await axios.get(getApiUrl("user/profile/"), {
      headers: {
        Authorization: `Bearer ${token}`, // Use the resolved token string
      },
    });

    const data = response.data;

    // Assign the 'name' field directly from the API response
    profileData.value.name = data.name || "";
    profileData.value.email = data.email || "";
  } catch (err) {
    console.error("Error fetching profile:", err);
    error.value = t("profile.loading_error");
    if (err.response && err.response.status === 401) {
      // This block correctly handles the 401 response from the server.
      authStore.logout();
      router.push("/login");
      toast.error(t("profile.session_expired"));
    }
  } finally {
    loading.value = false;
  }
};

/**
 * Logs out the user and redirects to the home page or login page.
 */
const logoutUser = () => {
  authStore.logout();
  router.push("/");
  toast.info(t("profile.logged_out"));
};

// Fetch data when the component is mounted
onMounted(() => {
  fetchProfile();
});
</script>

<style scoped>
/* Page Layout */
.profile-page-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content-container {
  flex-grow: 1;
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 2rem;
  width: 100%;
}

.page-layout {
  display: flex;
  gap: 3rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  min-height: 500px; /* Ensure content is visible */
}

/* Sidebar Navigation */
.sidebar-nav {
  width: 280px;
  background-color: #f7f7f7;
  border-right: 1px solid #e0e0e0;
  padding: 1.5rem 0;
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s;
  text-decoration: none; /* For router-link */
}

.nav-item svg {
  margin-right: 0.75rem;
  color: #666;
  width: 20px;
  height: 20px;
}

.nav-item:hover {
  background-color: #eeeeee;
}

.nav-item.active {
  color: #008080; /* The teal color from the image */
  background-color: #e0f2f2; /* Light teal background */
  border-left: 5px solid #008080;
  margin-left: -5px; /* Adjust for border */
}

.nav-item.active svg {
  color: #008080;
}

/* Profile Content */
.profile-content {
  flex-grow: 1;
  padding: 2.5rem;
}

.content-header {
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 2rem;
}

.profile-details-container {
  max-width: 500px;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 0.5rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.form-group input:focus {
  border-color: #008080;
  outline: none;
}

/* Added back .readonly-input to style non-editable fields */
.readonly-input {
  background-color: #f0f0f0;
  cursor: default; /* Use default cursor to show it's not interactive */
  color: #555;
}

/* Removed styles related to update-btn and submission messages */

/* Loading and Error States */
.loading-state,
.error-state {
  padding: 2rem 0;
  text-align: center;
  font-size: 1.2rem;
  color: #888;
}

/* Submission Message styles removed */
</style>
