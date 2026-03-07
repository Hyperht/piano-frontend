<template>
  <v-container class="fill-height d-flex justify-center align-center bg-grey-lighten-4" fluid>
    <v-card class="pa-10 text-center rounded-xl shadow-lg" max-width="500" elevation="0">
      <v-icon color="error" size="100" class="mb-4">mdi-lock-alert-outline</v-icon>
      <h1 class="text-h3 font-weight-bold text-error mb-2">401</h1>
      <h2 class="text-h5 font-weight-medium mb-4">Access Denied</h2>
      <p class="text-body-1 text-medium-emphasis mb-8">
        You do not have the required administrative permissions to view this page.
      </p>
      <v-divider class="mb-8"></v-divider>
      <div class="d-flex flex-column gap-3 sm:flex-row justify-center">
        <v-btn color="primary" variant="flat" size="large" @click="$router.push('/')" class="text-none font-weight-bold">
          <v-icon start>mdi-home</v-icon>
          Return Home
        </v-btn>
        <v-btn color="grey-darken-3" variant="outlined" size="large" @click="handleLogout" class="text-none font-weight-bold mt-3 mt-sm-0 ml-sm-3">
          <v-icon start>mdi-login</v-icon>
          Sign In as Admin
        </v-btn>
      </div>
    </v-card>
  </v-container>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
    authStore.clearAuth();
    router.push('/login');
};
</script>

<style scoped>
.shadow-lg {
  box-shadow: 0 10px 40px -10px rgba(0,0,0,0.1) !important;
}
</style>
