<template>
  <div class="promo-banner">
    <img :src="bgImage" alt="Background overlay" class="background-overlay" />

    <div class="content-container">
      <div class="left-section">
        <img :src="leftImage" alt="Flash Sale" class="artwork-left" />
      </div>

      <div class="center-section">
        <div class="timer-container">
          <div class="timer-item">
            <span class="timer-value">{{ days }}</span>
            <span class="timer-label">{{ $t('promo.days') }}</span>
          </div>
          <div class="timer-separator">:</div>
          <div class="timer-item">
            <span class="timer-value">{{ hours }}</span>
            <span class="timer-label">{{ $t('promo.hours') }}</span>
          </div>
          <div class="timer-separator">:</div>
          <div class="timer-item">
            <span class="timer-value">{{ minutes }}</span>
            <span class="timer-label">{{ $t('promo.minutes') }}</span>
          </div>
          <div class="timer-separator">:</div>
          <div class="timer-item">
            <span class="timer-value">{{ seconds }}</span>
            <span class="timer-label">{{ $t('promo.seconds') }}</span>
          </div>
        </div>
      </div>

      <div class="right-section">
        <img :src="rightImage" alt="Up to 70% off" class="artwork-right" />
        <router-link :to="saleLinkTarget" class="view-all-link">
          {{ $t("general.view_all") }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router'; 
import axios from 'axios';
import { getApiUrl } from '@/config/api';

// Import your images
import backgroundOverlayImage from '../assets/Frame 201388.png';
import artworkLeft from '../assets/Group 3.png';
import artworkRight from '../assets/Group 5.png';

const router = useRouter(); 

// Define the target link for sale products using the specific query parameter
const saleLinkTarget = { 
  name: 'Search', 
  query: { is_on_sale: 'true' } 
};

// Timer logic
const days = ref('00');
const hours = ref('00');
const minutes = ref('00');
const seconds = ref('00');
let countdownInterval = null;

const startCountdown = (targetDateString) => {
  const targetDate = new Date(targetDateString);

  countdownInterval = setInterval(() => {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
      clearInterval(countdownInterval);
      days.value = hours.value = minutes.value = seconds.value = '00';
      return;
    }

    const d = Math.floor(distance / (1000 * 60 * 60 * 24));
    const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((distance % (1000 * 60)) / 1000);

    days.value = d < 10 ? '0' + d : d;
    hours.value = h < 10 ? '0' + h : h;
    minutes.value = m < 10 ? '0' + m : m;
    seconds.value = s < 10 ? '0' + s : s;
  }, 1000);
};

// Reactive refs for images
const bgImage = ref(backgroundOverlayImage);
const leftImage = ref(artworkLeft);
const rightImage = ref(artworkRight);

// Function to fetch the promo date from the backend
const fetchPromo = async () => {
    try {
        const response = await axios.get(getApiUrl('dashboard/promo-banners/active/'));
        const data = response.data;
        
        if (data && data.end_date) {
            startCountdown(data.end_date);
            
            // Update images if available
            if (data.background_image) bgImage.value = data.background_image;
            if (data.left_image) leftImage.value = data.left_image;
            if (data.right_image) rightImage.value = data.right_image;
        } else {
             // Fallback to default/hardcoded if no active banner
             const now = new Date();
             const durationInMs = (1 * 24 * 60 * 60 * 1000) + (19 * 60 * 60 * 1000);
             startCountdown(new Date(now.getTime() + durationInMs));
        }
    } catch (error) {
        console.error("Error fetching promo banner data:", error);
         // Fallback
         const now = new Date();
         const durationInMs = (1 * 24 * 60 * 60 * 1000) + (19 * 60 * 60 * 1000);
         startCountdown(new Date(now.getTime() + durationInMs));
    }
};

onMounted(() => {
  fetchPromo();
});

onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval);
});
</script>

<style scoped>
.promo-banner {
  width: 100%;
  max-width: 100%;
  margin: 1.5rem auto;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background-color: #FFA500;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 250px;
}

/* Background overlay image style */
.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1; 
  pointer-events: none;
}

.content-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 2;
  padding: 1rem 3%; /* Default padding */
}

.left-section, .right-section, .center-section {
  flex: 1;
  display: flex;
  align-items: center;
}

.center-section {
  flex: 2; /* Give timer more space */
  justify-content: center;
}

.left-section {
  justify-content: flex-start;
}

.right-section {
  justify-content: flex-end;
  /* position: relative; removed to allow natural flow */
  flex-direction: column; /* Stack image and link */
  align-items: flex-end;
  gap: 10px;
}

.artwork-left {
  width: 100%;
  max-width: 250px;
  height: auto;
  object-fit: contain;
}

.artwork-right {
  width: 100%;
  max-width: 250px;
  height: auto;
  object-fit: contain;
}

.timer-container {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  color: #fff;
  text-align: center;
}

.timer-item {
  display: flex;
  flex-direction: column;
}

.timer-separator {
  font-size: 2.5rem;
  font-weight: bold;
  line-height: 1;
  margin-top: -15px;
}

.timer-value {
  font-size: 3rem;
  font-weight: bold;
}

.timer-label {
  font-size: 0.85rem;
  text-transform: uppercase;
  margin-top: 0px;
  opacity: 0.9;
}

.view-all-link {
  color: #fff;
  font-size: 1rem;
  text-decoration: none;
  font-weight: bold;
  transition: opacity 0.2s ease;
  white-space: nowrap;
}

.view-all-link:hover {
  text-decoration: underline;
}

/* RESPONSIVE BREAKPOINTS */

/* Tablet (< 992px) */
@media (max-width: 992px) {
  .timer-value {
    font-size: 2.5rem;
  }
  .timer-separator {
    font-size: 2rem;
  }
  .artwork-left, .artwork-right {
    max-width: 180px;
  }
  .timer-container {
    gap: 1rem;
  }
}

/* Mobile (< 768px) */
@media (max-width: 768px) {
  .promo-banner {
    padding: 1.5rem 0;
    height: auto;
    min-height: auto;
  }

  .content-container {
    flex-direction: column;
    padding: 1rem;
    gap: 2rem;
    align-items: center;
  }

  .left-section, .right-section, .center-section {
    width: 100%;
    justify-content: center;
    flex: unset; /* Remove flex weights */
  }

  .right-section {
    align-items: center;
  }

  /* Order adjustment: Image -> Timer -> Discount */
  .left-section { order: 1; }
  .center-section { order: 2; margin-top: -10px; margin-bottom: -10px; }
  .right-section { order: 3; }

  .artwork-left {
    max-width: 200px;
  }
  .artwork-right {
    max-width: 200px;
  }
  
  .timer-value {
    font-size: 2rem;
  }
  .timer-separator {
    font-size: 1.8rem;
  }
}

/* Small Mobile (< 480px) */
@media (max-width: 480px) {
  .timer-value {
    font-size: 1.8rem;
  }
  .timer-separator {
    font-size: 1.5rem;
  }
  .timer-container {
    gap: 0.5rem;
  }
  .artwork-left, .artwork-right {
    max-width: 160px;
  }
}
</style>