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
import { useI18n } from 'vue-i18n'; // Added i18n
import axios from 'axios';
import { getApiUrl } from '@/config/api';

const router = useRouter(); 
const { t } = useI18n(); // Added i18n

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

  const cardWidth = 300; 
  const gap = 24; // Matches 1.5rem in CSS
  const scrollAmount = cardWidth + gap;
  
  if (direction === 'left') {
    slider.value.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  } else {
    slider.value.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }
};

// FIX: Change navigation to route to the general 'Search' page 
// using the room name as a query parameter (q) to filter products tagged with that room.
const goToCategory = (roomName) => {
    router.push({ 
      name: 'Search', // Assuming your search results page route name is 'Search'
      query: { q: roomName.trim() } // Use the room name to filter products
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
  text-align: top left;
  margin-bottom: 2rem;
  font-family: 'Playfair Display', serif;
}

.slider-wrapper {
  display: flex;
  align-items: center;
  position: relative;
  /* Keep overflow-x: hidden here for the wrapper */
  overflow-x: hidden; 
}

.rooms-slider {
  display: flex;
  gap: 1.5rem; /* 1.5rem = 24px */
  padding: 0 1rem;
  /* The actual scrolling happens here */
  overflow-x: auto; 
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-behavior: smooth;
}

.rooms-slider::-webkit-scrollbar {
  display: none;
}

.room-card {
  flex-shrink: 0;
  /* FIX: Use a fixed width instead of a percentage calculation */
  width: 300px; 
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  cursor: pointer; /* Already set, but important for user experience */
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