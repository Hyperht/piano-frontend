<template>
  <v-app-bar elevation="0" height="70" class="border-b px-4" :class="customizer.actTheme === 'darkTheme' ? 'bg-surface' : 'bg-white'">
    
    <!-- Left: Search Bar -->
    <div class="d-flex align-center flex-grow-1" style="max-width: 400px;">
        <v-text-field
            density="compact"
            variant="solo"
            label="Search anything..."
            hide-details
            single-line
            rounded="lg"
            bg-color="grey-lighten-4"
            class="search-bar"
        >
            <template v-slot:prepend-inner>
                <i class="fa-solid fa-magnifying-glass text-medium-emphasis mr-2"></i>
            </template>
        </v-text-field>
    </div>

    <v-spacer />

    <!-- Right: Actions -->
    <div class="d-flex align-center gap-3">
        
        <!-- Theme Toggle -->
        <v-btn icon size="small" variant="text" @click="customizer.toggleTheme" color="medium-emphasis" class="mr-2">
            <i :class="['fa-solid', customizer.actTheme === 'lightTheme' ? 'fa-moon' : 'fa-sun', 'fa-lg']"></i>
        </v-btn>

        <!-- Account Section: Email + Circular Logout -->
        <div class="d-flex align-center rounded-pill pl-4 pr-1 py-1" :class="customizer.actTheme === 'darkTheme' ? 'bg-surface-variant' : 'bg-grey-lighten-4'">
            <span class="text-caption font-weight-bold mr-3 text-medium-emphasis">{{ username }}</span>
            <v-btn 
                icon 
                size="small" 
                color="error" 
                variant="flat" 
                @click="handleLogout"
                class="rounded-circle"
                width="32"
                height="32"
            >
                <i class="fa-solid fa-power-off fa-xs"></i>
            </v-btn>
        </div>
    </div>
  </v-app-bar>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAdminStore } from '../store/adminStore';
import { useAuthStore } from '@/stores/auth';

const customizer = useAdminStore();
const authStore = useAuthStore();
const router = useRouter();

// Get username from auth store
const username = computed(() => {
  if (authStore.user) {
    return authStore.user.name || authStore.user.username || authStore.user.email || 'Admin';
  }
  return 'Admin';
});

// Logout handler
const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push('/login');
  } catch (error) {
    console.error('Logout error:', error);
    router.push('/login');
  }
};
</script>

<style scoped>
.bg-white {
  background-color: #ffffff !important;
}

.bg-surface {
  background-color: #222936 !important;
}
</style>
