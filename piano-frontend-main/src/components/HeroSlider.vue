<template>
  <div class="hero-slider-wrapper">
    <div class="slider-container">
      <div 
        class="slides-wrapper" 
        :style="{ transform: `translateX(${isRTL ? currentSlideIndex * 100 : -currentSlideIndex * 100}%)` }"
      >
        <div v-for="(slide, index) in slides" :key="index" class="slide">
          <img 
            :src="slide.image || fallbackImage" 
            :alt="slide.title" 
            @error="e => { e.target.src = fallbackImage; }"
          />
          <div class="slide-content">
            <h1 v-if="slide.title">{{ slide.title }}</h1>
            <p v-if="slide.subtitle">{{ slide.subtitle }}</p>
            <button v-if="slide.button_text" @click="navigateTo(slide.button_link)">
              {{ slide.button_text }}
            </button>
          </div>
        </div>
      </div>

      <button class="nav-button prev-button" @click="prevSlide">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <button class="nav-button next-button" @click="nextSlide">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
      </button>
    </div>

    <div class="dots-container">
      <span v-for="(slide, index) in slides" :key="index"
            class="dot"
            :class="{ active: index === currentSlideIndex }"
            @click="currentSlideIndex = index">
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import axios from 'axios';
import { getApiUrl } from '@/config/api';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();

// Detect if we are in Arabic mode
const isRTL = computed(() => locale.value === 'ar');

const slides = ref([]);
const currentSlideIndex = ref(0);
const fallbackImage = '/default-fallback.png'; 
let intervalId = null;

const fetchSlides = async () => {
  try {
    const response = await axios.get(getApiUrl('hero-slides/'));
    slides.value = response.data;
    if (slides.value.length > 1) startAutoSlide();
  } catch (error) {
    console.error('Error:', error);
  }
};

const nextSlide = () => {
  clearInterval(intervalId);
  currentSlideIndex.value = (currentSlideIndex.value + 1) % slides.value.length;
  startAutoSlide();
};

const prevSlide = () => {
  clearInterval(intervalId);
  currentSlideIndex.value = (currentSlideIndex.value - 1 + slides.value.length) % slides.value.length;
  startAutoSlide();
};

const startAutoSlide = () => {
  if (slides.value.length > 1) {
    // Note: I restored your 10s interval, but used nextSlide instead of random 
    // to keep the movement predictable across the screen.
    intervalId = setInterval(nextSlide, 10000); 
  }
};

const navigateTo = (url) => url && (window.location.href = url);

onMounted(fetchSlides);
onUnmounted(() => clearInterval(intervalId));
</script>

<style scoped>
/* ALL YOUR ORIGINAL STYLES RESTORED */
.hero-slider-wrapper { max-width: 1400px; margin: 2rem auto; }
.slider-container { max-width: 100%; overflow: hidden; position: relative; border-radius: 8px; }
.slides-wrapper { display: flex; transition: transform 0.8s ease-in-out; }
.slide { flex-shrink: 0; width: 100%; height: 500px; position: relative; }
.slide img { width: 100%; height: 100%; object-fit: cover; }

.slide-content {
  position: absolute;
  top: 50%;
  left: 10%;
  transform: translateY(-50%);
  color: #fff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  max-width: 500px;
}

/* RTL adjustment for content */
[dir="rtl"] .slide-content {
  left: auto;
  right: 10%;
  text-align: right;
}

.slide-content h1 { font-size: 3rem; margin-bottom: 0.5rem; }
.slide-content p { font-size: 1.2rem; }
.slide-content button {
  margin-top: 1.5rem; padding: 12px 24px; font-size: 1rem; font-weight: bold;
  background-color: #007bff; color: white; border: none; border-radius: 999px;
  cursor: pointer; transition: background-color 0.2s;
}

.nav-button {
  position: absolute; top: 50%; transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.4); color: white; border: none;
  padding: 10px; cursor: pointer; z-index: 10; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}

.prev-button { left: 20px; }
.next-button { right: 20px; }

/* Flip arrows for Arabic */
[dir="rtl"] .prev-button { 
  left: auto; right: 20px; transform: translateY(-50%) rotate(180deg); 
}
[dir="rtl"] .next-button { 
  right: auto; left: 20px; transform: translateY(-50%) rotate(180deg); 
}

.dots-container { display: flex; justify-content: center; margin-top: 1rem; gap: 10px; }
.dot { width: 12px; height: 12px; background: #ccc; border-radius: 50%; cursor: pointer; }
.dot.active { background: #007bff; width: 30px; border-radius: 10px; }

@media (max-width: 768px) {
  .slide {
    height: 300px;
  }
  
  .slide-content h1 {
    font-size: 1.8rem;
  }
  
  .slide-content p {
    font-size: 1rem;
  }
  
  .slide-content {
    left: 5%;
    max-width: 90%;
  }
  
  [dir="rtl"] .slide-content {
    right: 5%;
  }
}
</style>