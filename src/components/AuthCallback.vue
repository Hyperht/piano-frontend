<template>
  <div class="auth-callback-page">
    <div class="loading-container">
      <div class="spinner"></div>
      <h2>{{ $t('auth.completing_login') }}</h2>
      <p>{{ $t('auth.please_wait') }}</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

onMounted(() => {
  console.log('[AuthCallback] Component mounted');
  console.log('[AuthCallback] Query params:', route.query);
  
  // Extract tokens and user data from URL parameters
  const accessToken = route.query.access_token;
  const refreshToken = route.query.refresh_token;
  const userId = route.query.user_id;
  const userEmail = route.query.user_email;
  const userName = route.query.user_name;
  const error = route.query.error;
  
  // Check for errors
  if (error) {
    console.error('[AuthCallback] Authentication error:', error);
    alert('Authentication failed. Please try again.');
    router.push('/login');
    return;
  }
  
  // Validate tokens
  if (!accessToken || !refreshToken) {
    console.error('[AuthCallback] Missing tokens in URL');
    alert('Authentication failed. Missing tokens.');
    router.push('/login');
    return;
  }
  
  console.log('[AuthCallback] Tokens received successfully');
  
  // Save tokens to localStorage
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
  
  // Create user object
  const user = {
    id: userId,
    email: userEmail,
    name: userName || '',
  };
  
  // Update auth store
  authStore.setToken(accessToken, user);
  
  console.log('[AuthCallback] User logged in:', user);
  
  // Fetch full user profile in background
  authStore.fetchUser().catch(err => {
    console.warn('[AuthCallback] Failed to fetch full user profile:', err);
  });
  
  // Redirect to home page
  setTimeout(() => {
    router.push('/');
  }, 500);
});
</script>

<style scoped>
.auth-callback-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.loading-container {
  text-align: center;
  color: white;
}

.spinner {
  width: 50px;
  height: 50px;
  margin: 0 auto 20px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 10px;
}

p {
  font-size: 16px;
  opacity: 0.9;
}
</style>
