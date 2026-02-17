<template>
  <div class="sidebar-wrapper">
    <transition name="fade">
      <div v-if="isOpen" class="overlay" @click="closeSidebar"></div>
    </transition>

    <div :class="['profile-sidebar', { 'is-open': isOpen }]">
      <div class="sidebar-header">
        <h2>{{ $t("profile.title") }}</h2>
        <button
          @click="closeSidebar"
          class="close-btn"
          :aria-label="$t('profile.close_sidebar')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <ul class="sidebar-menu">
        <li v-for="item in menuItems" :key="item.key">
          <router-link :to="item.path" class="menu-item">
            <component :is="item.icon" class="menu-icon" />
            <span>{{ $t(item.key) }}</span>
            <svg
              class="chevron-right"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </router-link>
        </li>
      </ul>

      <div class="sidebar-footer">
        <button
          @click="handleLogout"
          class="menu-item logout-button"
          :disabled="isLoggingOut"
        >
          <LogoutIcon class="menu-icon log-out-icon" />
          <span>
            {{
              isLoggingOut ? $t("profile.logging_out") : $t("profile.logout")
            }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

// --- Icon Components (omitted for brevity) ---
const UserIcon = {
  template:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-user"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
};
const ShoppingBagIcon = {
  template:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-shopping-bag"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>',
};
const MapPinIcon = {
  template:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-map-pin"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>',
};
const LogoutIcon = {
  template:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>',
};

// --- Props, Emits, and Router Setup ---
const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["update:isVisible"]);
const router = useRouter();

// --- State and Logic ---
const isOpen = ref(props.isVisible);
const isLoggingOut = ref(false);

const { t } = useI18n();

const menuItems = [
  // The 'key' now serves as the translation key
  { key: "profile.menu.details", path: "/profile", icon: UserIcon },
  { key: "profile.menu.orders", path: "/orders", icon: ShoppingBagIcon },
  { key: "profile.menu.addresses", path: "/addresses", icon: MapPinIcon },
];

// Watch for prop changes to update internal state
watch(
  () => props.isVisible,
  (newVal) => {
    isOpen.value = newVal;
  },
  { immediate: true }
);

const closeSidebar = () => {
  isOpen.value = false;
  emit("update:isVisible", false);
};

const handleLogout = async () => {
  isLoggingOut.value = true;
  // Delay matches CSS transition
  setTimeout(async () => {
    await router.push("/login");
    closeSidebar();
    isLoggingOut.value = false;
  }, 300);
};

// Listen for route changes to close the sidebar
watch(
  () => router.currentRoute.value.path,
  (newPath, oldPath) => {
    // Only close if the route actually changed and the sidebar is open
    if (newPath !== oldPath && isOpen.value && !isLoggingOut.value) {
      // Delay matches CSS transition to allow the close animation to start
      setTimeout(() => {
        closeSidebar();
      }, 300);
    }
  }
);
</script>

<style scoped>
/* (Styles are the same as provided in the original request) */

/*
 * 1. BASE STRUCTURE AND TRANSITION - Using a class for open/close state
 * The sidebar slides in using a CSS transition triggered by the .is-open class.
 */
.sidebar-wrapper {
  /* This wrapper holds the absolute/fixed positioned elements */
  position: relative;
  height: 100%;
}

.profile-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: 300px;
  max-width: 85vw; /* Added max-width for better mobile handling */
  height: 100%;
  background-color: white;
  box-shadow: -2px 0 15px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  display: flex;
  flex-direction: column;

  /* Default state: fully off-screen */
  transform: translateX(100%);
  transition: transform 0.3s ease-out; /* Slide transition */
}

.profile-sidebar.is-open {
  /* Open state: moved to its final position */
  transform: translateX(0);
}

/*
 * 2. OVERLAY TRANSITION - Using Vue's <transition>
 */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4); /* Slightly darker overlay */
  z-index: 999;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/*
 * 3. SIDEBAR STYLING
 */
.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.sidebar-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  margin: -0.5rem; /* For a larger clickable area without visual change */
}

.close-btn svg {
  width: 20px;
  height: 20px;
  stroke: #555;
}

.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1; /* Pushes the footer to the bottom */
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between; /* To push the chevron to the right */
  width: 100%;
  padding: 1.25rem 1.5rem;
  color: #333;
  text-decoration: none;
  transition: background-color 0.2s ease;
  font-size: 1rem;
  background: none; /* For button to look like a link */
  border: none;
  text-align: left;
  cursor: pointer;
}

.menu-item:hover,
.menu-item:focus {
  background-color: #f5f5f5;
  outline: none;
}

.menu-item span {
  flex-grow: 1; /* Allows the span to take up space and push the chevron */
}

.menu-icon {
  width: 20px;
  height: 20px;
  stroke: #777; /* Slightly different color for icons */
  margin-right: 1rem;
  flex-shrink: 0;
}

.chevron-right {
  width: 16px;
  height: 16px;
  stroke: #ccc;
  flex-shrink: 0;
  margin-left: 1rem;
}

.sidebar-footer {
  border-top: 1px solid #eee;
}

.logout-button {
  justify-content: flex-start; /* Log out button doesn't need the chevron at the end */
}

.log-out-icon {
  stroke: #d9534f;
}
</style>