<template>
  <header class="simple-header">
    <div class="header-container">
      <div class="logo-container">
        <a href="/" class="logo">
          <img :src="logo" alt="Company Logo" />
        </a>
      </div>

      <div 
        class="language-selector" 
        @click="toggleLang"
        :aria-label="$t('general.toggle_language')" 
        role="button"
        tabindex="0"
      >
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
        >
          <circle cx="12" cy="12" r="10" />
          <path
            d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
          />
          <line x1="2" y1="12" x2="22" y2="12" />
        </svg>
        <span>{{ langLabel }}</span>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import logo from "../assets/Group 44.png";

const { locale } = useI18n();
const lang = ref(localStorage.getItem("lang") || locale.value || "en");

// The label displays the current language code (AR/EN)
const langLabel = computed(() => (lang.value === "ar" ? "AR" : "EN")); 

const applyLang = () => {
  try {
    document.documentElement.lang = lang.value;
    document.documentElement.dir = lang.value === "ar" ? "rtl" : "ltr";
  } catch (e) {}
};
const toggleLang = () => {
  lang.value = lang.value === "en" ? "ar" : "en";
  localStorage.setItem("lang", lang.value);
  locale.value = lang.value;
  applyLang(lang.value);
};

onMounted(() => {
  locale.value = lang.value;
  applyLang(lang.value);
});
</script>

<style scoped>
.simple-header {
  background-color: #fff;

  padding: 1rem 2rem;
}
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}
.logo-container img {
  max-height: 40px;
}
.language-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #333;
  font-size: 0.9rem;
  cursor: pointer;
}
</style>