<template>
  <SimpleHeader />
  <div class="login-page">
    <div class="login-card">
      <h2>{{ $t("login.title") }}</h2>
      <p class="subtitle">{{ $t("login.subtitle") }}</p>

      <form @submit.prevent="login" autocomplete="off">
        <label for="email">{{ $t("login.email_label") }}</label>
        <input
          v-model="email"
          type="email"
          id="email"
          :placeholder="$t('login.email_placeholder')"
        />

        <label for="password">{{ $t("login.password_label") }}</label>
        <div class="password-container">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            id="password"
            name="password"
            :placeholder="$t('login.password_placeholder')"
            autocomplete="new-password"
            spellcheck="false"
          />

          <span class="toggle-password" @click="togglePassword">
            <svg
              v-if="showPassword"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#888"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>

            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#888"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M17.94 17.94A10.38 10.38 0 0 1 12 20C7 20 2.73 16.11 1 12c.74-1.64 1.87-3.09 3.25-4.23"
              />
              <path d="M10.59 10.59A2 2 0 0 0 12 14a2 2 0 0 0 1.41-.59" />
              <path d="M14.12 14.12A4 4 0 0 1 9.88 9.88" />
              <path
                d="M3.51 3.51a19.77 19.77 0 0 1 16.98 6.49A19.77 19.77 0 0 1 21 12"
              />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          </span>
        </div>

        <div class="extra-options">
          <label class="remember-me">
            <input type="checkbox" />
            {{ $t("login.remember") }}
          </label>
          <a href="#" class="forgot-password-link">{{
            $t("login.forgot_password")
          }}</a>
        </div>

        <p v-if="error" class="error-message">{{ error }}</p>

        <button type="submit">{{ $t("login.submit") }}</button>

        <div class="divider">
          <hr />
          <span>{{ $t("login.or") }}</span>
          <hr />
        </div>

        <div class="social-login">
          <button class="social-btn google" @click="socialLogin('google')">
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
            />
            {{ $t("login.continue_with_google") }}
          </button>
          <button class="social-btn facebook" @click="socialLogin('facebook')">
            <img
              src="https://www.svgrepo.com/show/475647/facebook-color.svg"
              alt="Facebook"
            />
            {{ $t("login.continue_with_facebook") }}
          </button>
        </div>
      </form>

      <p class="create-account-link">
        {{ $t("login.no_account") }}
        <router-link to="/signup">{{ $t("login.create_account") }}</router-link>
      </p>
    </div>

    <img
      :src="bottomLeftImage"
      alt="Decorative image"
      class="bottom-left-image"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import axios from "axios";
import { getApiUrl, API_CONFIG } from "@/config/api";
import SimpleHeader from "./SimpleHeader.vue";
import { useAuthStore } from "@/stores/auth";
import bottomLeftImage from "../assets/Group 2.png";

// Use a variable named 'email' for the v-model, which is good practice
const email = ref("");
const password = ref("");
const showPassword = ref(false);
const error = ref(null);
const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const login = async () => {
  error.value = null;

  try {
    const response = await axios.post(getApiUrl("login/"), {
      // FIX: This sends the email value to the backend under the 'username' field,
      // which the backend is expecting.
      username: email.value,
      password: password.value,
    });

    // Persist tokens
    localStorage.setItem("access_token", response.data.access);
    localStorage.setItem("refresh_token", response.data.refresh);

    // Prefer any user object returned directly in the login response.
    // Common fields are `user`, `user_info`, or `profile` depending on backend.
    const resp = response.data || {};
    const returnedUser = resp.user || resp.user_info || resp.profile || null;

    if (returnedUser) {
      // Store the token and the returned user so UI updates immediately
      authStore.setToken(response.data.access, returnedUser);
    } else {
      // No user in login response: set token and a lightweight placeholder (email),
      // then fetch the full profile in background. Do not await to avoid blocking UI.
      authStore.setToken(response.data.access, {
        email: email.value,
        name: "",
      });
      authStore.fetchUser().catch(() => {
        // swallow fetch errors — we already log them in the store
      });
    }

    // Navigate to home (don't wait for fetchUser)
    router.push("/");
  } catch (err) {
    if (err.response && err.response.data) {
      console.error("Login failed:", err.response.data);
      error.value = t("login.errors.invalid_credentials");
    } else {
      console.error("Network error or unexpected issue:", err);
      error.value = t("login.errors.network");
    }
  }
};

// New social login function - uses full-page redirect instead of popup
const socialLogin = (provider) => {
  console.log(`[SocialLogin] Starting ${provider} login with full-page redirect`);
  
  // Use the Vite proxy to redirect to the backend OAuth URL
  // The backend will handle the OAuth flow and redirect back to /auth/callback
  const authUrl = `/accounts/${provider}/login/`;
  
  console.log(`[SocialLogin] Redirecting to: ${authUrl}`);
  
  // Full-page redirect - much better UX than popup
  window.location.href = authUrl;
};
</script>

<style scoped>
/* Your existing styles... */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: sans-serif;
}
.error-message {
  color: red;
  font-size: 0.85rem;
  margin-top: -10px;
  text-align: center;
}
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #ffffff;
  position: relative;
}

.login-card {
  width: 400px;
  padding: 40px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1;
}
.subtitle {
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.25rem;
  margin-bottom: 1rem;
  text-align: center;
}
h2 {
  font-size: 22px;
  font-weight: 600;
  color: #333;
  margin-bottom: 25px;
  text-align: center;
}
form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
label {
  font-size: 14px;
  font-weight: 500;
  color: #444;
}
input[type="email"],
.password-container input {
  width: 100%;
  padding: 12px 14px;
  font-size: 15px;
  border: 1px solid #ccc;
  border-radius: 6px;
}
input::placeholder {
  color: #999;
}
.password-container {
  position: relative;
}
.password-container input {
  padding-right: 40px;
}
.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
}
.extra-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}
.remember-me {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #333;
  white-space: nowrap;
}
.forgot-password-link {
  color: #007bff;
  text-decoration: none;
}
button {
  margin-top: 10px;
  padding: 14px;
  width: 100%;
  background-color: #007bff;
  color: #fff;
  border: none;
  font-weight: bold;
  font-size: 16px;
  border-radius: 6px;
  cursor: pointer;
}
button:hover {
  background-color: #0056b3;
}
.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 25px 0 10px;
  gap: 10px;
}
.divider hr {
  flex-grow: 1;
  border: none;
  border-top: 1px solid #ccc;
}
.divider span {
  color: #888;
  font-size: 14px;
}
.social-login {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 15px;
}
.social-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border: none;
  border-radius: 999px;
  background-color: white;
  color: #333;
  font-weight: bold;
  font-size: 12px;
  cursor: pointer;
  flex: 1;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s ease;
}
.social-btn img {
  width: 18px;
  height: 18px;
}
.social-btn:hover {
  background-color: #f0f0f0;
}
.create-account-link {
  margin-top: 20px;
  font-size: 14px;
  text-align: center;
}
.create-account-link a {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
}
input::-ms-reveal {
  display: none;
}
input::-ms-clear {
  display: none;
}

.bottom-left-image {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 200px;
  height: auto;
  opacity: 1;
  z-index: 0;
}
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #ffffff;
  position: relative;
}
</style>
