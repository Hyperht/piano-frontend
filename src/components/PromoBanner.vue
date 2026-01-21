<template>
  <div class="promo-banner">
    <img :src="backgroundOverlayImage" alt="Background overlay" class="background-overlay" />

    <img :src="artworkLeft" alt="Left artwork" class="artwork-left" />
    <img :src="artworkRight" alt="Right artwork" class="artwork-right" />

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

    <router-link :to="saleLinkTarget" class="view-all-link">
      {{ $t("general.view_all") }}
    </router-link>
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

// 💡 EDITED: Define the target link for sale products using the specific query parameter
const saleLinkTarget = { 
  name: 'Search', // Assuming your product list/search route is named 'Search'
  query: { is_on_sale: 'true' } // Use the specific query for sale products
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

// New function to fetch the promo date from the backend
const fetchPromo = async () => {
    try {
      const response = await axios.get(getApiUrl('promo-banner/'));
      const targetDate = response.data.end_date;
      startCountdown(targetDate);
    } catch (error) {
      console.error("Error fetching promo banner data:", error);
    }
};

onMounted(() => {
  fetchPromo();
});

onUnmounted(() => {
  clearInterval(countdownInterval);
});
</script>
<style scoped>
.promo-banner {
  max-width: 99%;
  margin: 2rem auto;
  position: relative;
  height: 250px;
  border-radius: 12px;
  overflow: hidden;
  background-color: orange;
}

/* New background overlay image style */
.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1; 
}

.artwork-left,
.artwork-right {
  position: absolute;
  width: 200px;
  height: auto;
  z-index: 2;
  top: 50%;
  transform: translateY(-50%);
}

.artwork-left {
  left: 50px;
}

.artwork-right {
  right: 150px;
}

.timer-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  
  backdrop-filter: blur(5px);
  padding: 1rem 2rem;
  border-radius: 10px;
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
}

.timer-value {
  font-size: 2.5rem;
  font-weight: bold;
}

.timer-label {
  font-size: 0.8rem;
  text-transform: uppercase;
  margin-top: -5px;
}

.view-all-link {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 3;
  color: #fff;
  
  padding: 10px 20px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.2s ease;
}

.view-all-link:hover {
  background-color: rgb(184, 121, 5);
}
</style>