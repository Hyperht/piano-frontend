<template>
  <v-app :theme="customizer.actTheme" :dir="customizer.isRTL ? 'rtl' : 'ltr'">
    <AdminSidebar />
    <AdminHeader />
    
    <v-main class="page-wrapper">
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { onMounted } from 'vue';
import AdminSidebar from '../components/AdminSidebar.vue';
import AdminHeader from '../components/AdminHeader.vue';
import { useAdminStore } from '../store/adminStore';

const customizer = useAdminStore();

// Initialize RTL state on mount
onMounted(() => {
  document.documentElement.dir = customizer.isRTL ? 'rtl' : 'ltr';
});
</script>

<style scoped>
.page-wrapper {
  min-height: 100vh;
}
</style>
