<template>
  <div class="room-slider-container">
    <h2>{{ $t("home.rooms.header") }}</h2>
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

      <div class="rooms-slider" ref="slider">
        <div class="room-card" v-for="room in rooms" :key="room.id" @click="goToCategory(room.name)">
          <img :src="room.image" :alt="room.name" class="room-image">
          <div class="room-name">{{ room.name }}</div>
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
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import { getApiUrl } from '@/config/api';

const router = useRouter(); 
const { t } = useI18n();

const rooms = ref([]);
const slider = ref(null);

const fetchRooms = async () => {
  try {
    const response = await axios.get(getApiUrl('rooms/'));
    rooms.value = response.data;
  } catch (error) {
    console.error('Failed to fetch rooms:', error);
  }
};

const scrollSlider = (direction) => {
  if (!slider.value) return;

  const firstCard = slider.value.querySelector('.room-card');
  if (!firstCard) return;

  // Dynamically calculate the width of one card + the gap
  const cardWidth = firstCard.offsetWidth;
  const gap = parseInt(window.getComputedStyle(slider.value).gap) || 0;
  const scrollAmount = cardWidth + gap;
  
  slider.value.scrollBy({ 
    left: direction === 'left' ? -scrollAmount : scrollAmount, 
    behavior: 'smooth' 
  });
};

const goToCategory = (roomName) => {
    router.push({ 
      name: 'Search', 
      query: { q: roomName.trim() } 
    });
};

onMounted(() => {
  fetchRooms();
});
</script>

<style scoped>
.room-slider-container {
  padding: 2rem 1rem;
  position: relative;
}

h2 {
  text-align: left;
  margin-bottom: 2rem;
  font-family: 'Playfair Display', serif;
}

.slider-wrapper {
  display: flex;
  align-items: center;
  position: relative;
}

.rooms-slider {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-behavior: smooth;
  scroll-snap-type: x mandatory;
  padding: 10px 0; /* Ensures box-shadow isn't cut off */
}

.rooms-slider::-webkit-scrollbar {
  display: none;
}

.room-card {
  flex-shrink: 0;
  width: 300px; /* PC Width */
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  cursor: pointer;
  scroll-snap-align: start;
}

/* MOBILE FIX: Exactly one card */
@media (max-width: 640px) {
  .rooms-slider {
    gap: 0; /* Remove gap so the next card is perfectly hidden */
    padding: 10px 0;
  }

  .room-card {
    width: 100%; /* Take up full slider width */
    scroll-snap-align: center;
    border-radius: 0; /* Optional: cleaner edge-to-edge look on mobile */
  }

  .nav-button {
    width: 32px;
    height: 32px;
  }
}

.room-card:hover {
  transform: scale(1.03);
}

.room-image {
  width: 100%;
  height: 250px;
  object-fit: cover;
}

.room-name {
  text-align: center;
  padding: 1rem;
  font-weight: bold;
}

.nav-button {
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
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
  left: 0;
}

.next-button {
  right: 0;
}
</style>