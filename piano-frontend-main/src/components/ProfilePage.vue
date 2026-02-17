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
import api from "@/config/api";
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
  if (!authStore.isAuthenticated) {
     // If store says not authenticated, redirect
     router.push("/login");
     return;
  }

  loading.value = true;
  error.value = null;

  try {
    // Use configured API instance which handles base URL and cookies/headers
    const response = await api.get("user/profile/");

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
const logoutUser = async () => {
  try {
    // Call backend logout to invalidate session
    await api.post("/auth/logout/");
  } catch (err) {
    console.warn("Backend logout failed:", err);
    // Continue with client-side logout anyway
  } finally {
    authStore.logout();
    router.push("/");
    toast.info(t("profile.logged_out"));
  }
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
  background-color: var(--bg-color);
}

.main-content-container {
  flex-grow: 1;
  max-width: var(--container-width);
  margin: var(--spacing-lg) auto;
  padding: 0 var(--spacing-sm);
  width: 100%;
}

.page-layout {
  display: flex;
  gap: var(--spacing-lg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  min-height: 500px;
  background-color: var(--bg-card);
  overflow: hidden; /* Contains rounded corners */
}

/* Sidebar Navigation */
.sidebar-nav {
  width: 280px;
  background-color: var(--bg-card);
  border-right: 1px solid var(--border-color);
  padding: var(--spacing-md) 0;
  flex-shrink: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 1rem var(--spacing-md);
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--text-color);
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
  text-decoration: none;
  border-left: 5px solid transparent;
}

.nav-item svg {
  margin-right: var(--spacing-xs);
  color: var(--text-light);
  width: 20px;
  height: 20px;
  transition: color 0.2s;
}

.nav-item:hover {
  background-color: var(--bg-color);
}

.nav-item.active {
  color: var(--primary-color);
  background-color: var(--primary-light);
  border-left-color: var(--primary-color);
}

.nav-item.active svg {
  color: var(--primary-color);
}

/* Profile Content */
.profile-content {
  flex-grow: 1;
  padding: var(--spacing-lg);
}

.content-header {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: var(--spacing-lg);
}

.profile-details-container {
  max-width: 600px;
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-group label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-light);
  margin-bottom: var(--spacing-xs);
}

.form-group input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: var(--font-size-base);
  box-sizing: border-box;
  transition: border-color 0.2s;
  color: var(--text-color);
  background-color: var(--bg-card);
}

.form-group input:focus {
  border-color: var(--primary-color);
  outline: none;
}

.readonly-input {
  background-color: var(--bg-color) !important;
  cursor: default;
  color: var(--text-light) !important;
}

/* Loading and Error States */
.loading-state,
.error-state {
  padding: var(--spacing-lg) 0;
  text-align: center;
  font-size: var(--font-size-lg);
  color: var(--text-light);
}

.error-state {
  color: var(--error);
}

/* Responsive Breakpoints */

/* XXL */
@media (min-width: 1400px) {
  .main-content-container {
    max-width: 1400px;
  }
}

/* MD to LG (Tablet Landscape) */
@media (max-width: 992px) {
  .sidebar-nav {
    width: 240px;
  }
}

/* SM to MD (Tablet Portrait / Large Phone) */
@media (max-width: 768px) {
  .page-layout {
    flex-direction: column;
    gap: 0;
  }

  .sidebar-nav {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    overflow-x: auto;
    padding: 0;
  }

  .nav-item {
    padding: var(--spacing-sm);
    flex-shrink: 0;
    border-left: none;
    border-bottom: 3px solid transparent;
    margin-left: 0;
  }
  
  .nav-item.active {
    border-left: none;
    border-bottom-color: var(--primary-color);
  }

  .profile-content {
    padding: var(--spacing-md);
  }
}

/* XS (Phone) */
@media (max-width: 576px) {
  .main-content-container {
    margin: var(--spacing-sm) auto;
    padding: 0 var(--spacing-xs);
  }
  
  .content-header {
    font-size: var(--font-size-xl);
  }
  
  .sidebar-nav {
    /* Keep horizontal scroll for menu on small screens */
  }
}
</style>
