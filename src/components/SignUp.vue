<template>
  <SimpleHeader />
  <div class="SignUp-page">
    <img
      :src="bottomLeftImage"
      alt="Decorative image"
      class="bottom-left-image"
    />

    <div class="SignUp-card">
      <h2>{{ $t("signup.title") }}</h2>
      <p class="subtitle">{{ $t("signup.subtitle") }}</p>

      <form @submit.prevent="register">
        <label for="Full name">{{ $t("signup.full_name_label") }}</label>
        <input
          v-model="fullName"
          type="text"
          id="Full name"
          :placeholder="$t('signup.full_name_placeholder')"
        />
        <label for="email">{{ $t("signup.email_label") }}</label>
        <input
          v-model="email"
          type="email"
          id="email"
          :placeholder="$t('signup.email_placeholder')"
        />
        <label for="phone">{{ $t("signup.phone_label") }}</label>
        <input
          v-model="phoneNumber"
          type="tel"
          id="phone"
          :placeholder="$t('signup.phone_placeholder')"
        />
        <label for="password">{{ $t("signup.password_label") }}</label>
        <div class="password-container">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            id="password"
            name="password"
            :placeholder="$t('signup.password_placeholder')"
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

        <p v-if="error" class="error-message">{{ error }}</p>

        <button type="submit">{{ $t("signup.create_account") }}</button>
        <div class="divider">
          <hr />
          <span>{{ $t("signup.or") }}</span>
          <hr />
        </div>
        <div class="social-login">
          <button class="social-btn google" @click="socialLogin('google')">
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
            />
            {{ $t("signup.continue_with_google") }}
          </button>
          <button class="social-btn facebook" @click="socialLogin('facebook')">
            <img
              src="https://www.svgrepo.com/show/475647/facebook-color.svg"
              alt="Facebook"
            />
            {{ $t("signup.continue_with_facebook") }}
          </button>
        </div>
      </form>

      <p class="create-account-link">
        {{ $t("signup.already_have_account") }}
        <router-link to="/login">{{ $t("signup.login_link") }}</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import axios from "axios";
// FIX: Added API_CONFIG import
import { getApiUrl, API_CONFIG } from "@/config/api";
import { useRouter } from "vue-router";
import bottomLeftImage from "../assets/Group 2 (1).png";
import SimpleHeader from "./SimpleHeader.vue";

const router = useRouter();

const fullName = ref("");
const email = ref("");
const phoneNumber = ref("");
const password = ref("");
const showPassword = ref(false);
const error = ref(null);

const { t } = useI18n();

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

// FIX: Added the socialLogin function from the working component
const socialLogin = (provider) => {
  const authUrl = `${API_CONFIG.BASE_URL.replace(
    /\/api\/?$/,
    ""
  )}/accounts/${provider}/login/`;
  const authWindow = window.open(authUrl, "_blank", "width=500,height=600");

  // Check if the pop-up window is closed
  const checkWindowClosed = setInterval(() => {
    if (authWindow.closed) {
      clearInterval(checkWindowClosed);
      // Reload the page to check if the user is authenticated.
      window.location.reload();
    }
  }, 500);
};

const register = async () => {
  error.value = null;

  try {
    const response = await axios.post(getApiUrl("register/"), {
      name: fullName.value,
      email: email.value,
      phone_number: phoneNumber.value,
      password: password.value,
    });

    console.log("Registration successful:", response.data);
    router.push("/login");
  } catch (err) {
    if (err.response && err.response.data) {
      console.error("Registration failed:", err.response.data);

      const backendError = err.response.data;
      if (backendError.email) {
        error.value = `${t("signup.errors.email")}: ${backendError.email[0]}`;
      } else if (backendError.name) {
        error.value = `${t("signup.errors.name")}: ${backendError.name[0]}`;
      } else if (backendError.phone_number) {
        error.value = `${t("signup.errors.phone_number")}: ${
          backendError.phone_number[0]
        }`;
      } else if (backendError.password) {
        error.value = `${t("signup.errors.password")}: ${
          backendError.password[0]
        }`;
      } else {
        error.value = t("signup.errors.unexpected");
      }
    } else {
      console.error("Network error or unexpected issue:", err);
      error.value = t("signup.errors.network");
    }
  }
};
</script>
<style scoped>
/*
  All styles are the same as your original code, they are just included for completeness.
*/
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

.SignUp-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #ffffff;
  position: relative;
}

.SignUp-card {
  width: 400px;
  padding: 40px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1; /* Ensure the card is on top of the image */
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
input[type="text"],
input[type="password"],
input[type="tel"], /* New: Added style for tel type */
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

/* Also hide for older versions just in case */
input::-ms-clear {
  display: none;
}
.SignUp-page {
  position: relative; /* This is crucial for positioning the image */
}

.bottom-left-image {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 200px;
  height: auto;
  opacity: 1; /* To make it a subtle background element */
  z-index: 0; /* Ensure it's behind the signup card */
}

/* Add a style for the error message */
.error-message {
  color: red;
  font-size: 0.85rem;
  margin-top: -10px;
  text-align: center;
}
</style>
