<template>
  <div class="style-slider-container">
    <h2>{{ $t("home.styles.header") }}</h2>
    <div class="slider-wrapper">
      <button 
        class="nav-button prev-button" 
        @click="scrollSlider('left')"
        :aria-label="$t('general.scroll_left')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <div class="styles-slider" ref="slider">
        <div 
          class="style-card" 
          v-for="style in styles" 
          :key="style.id" 
          @click="goToStyleSearch(style.name)"
        >
          <img :src="style.image" :alt="style.name" class="style-image">
          <div class="style-name">{{ style.name }}</div>
        </div>
      </div>

      <button 
        class="nav-button next-button" 
        @click="scrollSlider('right')"
        :aria-label="$t('general.scroll_right')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router'; 
import { useI18n } from 'vue-i18n'; // Added i18n
import axios from 'axios';
import { getApiUrl } from '@/config/api';

const router = useRouter(); 
const { t } = useI18n(); // Added i18n

const styles = ref([]);
const slider = ref(null);

const fetchStyles = async () => {
  try {
    const response = await axios.get(getApiUrl('styles/'));
    styles.value = response.data;
  } catch (error) {
    console.error('Failed to fetch styles:', error);
  }
};

const scrollSlider = (direction) => {
  if (!slider.value) return;

  const cardWidth = 300; 
  const gap = 24; // This must match the gap in your CSS (1.5rem = 24px)
  const scrollAmount = cardWidth + gap;
  
  if (direction === 'left') {
    slider.value.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  } else {
    slider.value.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }
};

/**
 * Navigates to the search results page, filtering by the selected style name.
 * @param {string} styleName The name of the style (e.g., "Modern", "Boho").
 */
const goToStyleSearch = (styleName) => {
    // We route to the 'Search' page, using the style name as the query parameter 'q'
    router.push({ 
      name: 'Search', 
      query: { q: styleName.trim() } 
    });
};

onMounted(() => {
  fetchStyles();
});
</script>
<style scoped>
.style-slider-container {
  padding: 2rem 1rem;
  position: relative;
}

h2 {
  text-align: top left;
  margin-bottom: 2rem;
  font-family: 'Playfair Display', serif;
}

.slider-wrapper {
  display: flex;
  align-items: center;
  position: relative;
  overflow-x: hidden;
}

.styles-slider {
  display: flex;
  gap: 1.5rem;
  padding: 0 1rem;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-behavior: smooth;
}

.styles-slider::-webkit-scrollbar {
  display: none;
}

.style-card {
  flex-shrink: 0;
  /* FIX: Use a fixed width (300px) instead of percentage calculation */
  width: 300px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  cursor: pointer;
}

.style-card:hover {
  transform: scale(1.03);
}

.style-image {
  width: 100%;
  height: 250px;
  object-fit: cover;
}

.style-name {
  text-align: center;
  padding: 1rem;
  font-weight: bold;
}

.nav-button {
  background-color: #fff;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

.prev-button {
  left: 10px;
}

.next-button {
  right: 10px;
}
</style>