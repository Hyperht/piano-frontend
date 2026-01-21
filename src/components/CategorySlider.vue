<template>
  <div class="category-slider-section">
    <h3 class="section-title">{{ $t("category_slider.title") }}</h3>

    <div class="slider-container">
      <button 
        class="slider-arrow left" 
        @click="slide(-1)" 
        v-show="!isAtStart"
        aria-label="Previous Subcategory"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>

      <div class="category-slider-wrapper" ref="sliderRef">
        <div class="category-item" v-for="subcategory in subcategories" :key="subcategory.id">
          <router-link
            :to="{
              name: 'SubCategoryPage',
              params: {
                categoryName: subcategory.parent_category.name.toLowerCase(),
                subCategoryName: subcategory.name.toLowerCase()
              }
            }"
            class="category-link"
          >
            <img :src="subcategory.image" :alt="subcategory.name" class="category-image" />
            <span class="category-name">{{ subcategory.name }}</span>
          </router-link>
        </div>
      </div>

      <button 
        class="slider-arrow right" 
        @click="slide(1)" 
        v-show="!isAtEnd"
        aria-label="Next Subcategory"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { getApiUrl } from '@/config/api';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();
const subcategories = ref([]);
const sliderRef = ref(null);
const isAtStart = ref(true);
const isAtEnd = ref(false);

const getLocalized = (obj, field) => {
  if (!obj) return '';
  const value = obj[field];
  if (value && typeof value === 'object') {
    return value[locale.value] || value.en || Object.values(value)[0] || '';
  }
  // Support field_en / field_ar variants
  const short = locale.value ? locale.value.split('-')[0] : 'en';
  const candidate = `${field}_${short}`;
  if (obj[candidate]) return obj[candidate];
  return value || obj[field] || '';
};

const fetchSubcategories = async () => {
  try {
    const response = await axios.get(getApiUrl('subcategories/'));
    // Map localized fields for name and parent_category.name
    subcategories.value = response.data.map(sub => ({
      ...sub,
      name: getLocalized(sub, 'name'),
      parent_category: {
        ...sub.parent_category,
        name: getLocalized(sub.parent_category, 'name')
      }
    }));
  } catch (error) {
    console.error('Error fetching subcategories:', error);
  }
};

const checkScrollPosition = () => {
  const slider = sliderRef.value;
  if (!slider) return;

  // Use a small tolerance (-1) for scroll end check
  isAtStart.value = slider.scrollLeft === 0;
  isAtEnd.value = slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 1;
};

const slide = (direction) => {
  const slider = sliderRef.value;
  if (!slider) return;

  const itemWidth = slider.querySelector('.category-item').clientWidth;
  const scrollAmount = itemWidth * 5;

  // If Arabic, reverse the scroll direction for RTL
  const dir = locale.value.startsWith('ar') ? -1 : 1;
  slider.scrollBy({ left: dir * direction * scrollAmount, behavior: 'smooth' });
};


onMounted(async () => {
  await fetchSubcategories();
  const slider = sliderRef.value;
  if (slider) {
    slider.addEventListener('scroll', checkScrollPosition);
    checkScrollPosition();
  }
});

// Watch locale changes and re-fetch subcategories for translation
watch(locale, async () => {
  await fetchSubcategories();
});
</script>

<style scoped>
.category-slider-section {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 2rem;
}

.section-title {
  font-size: 2rem;
  font-weight: 600;
  color: #000000;
  margin-bottom: 1.5rem;
}

.slider-container {
  position: relative;
}

.slider-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(255, 255, 255, 0.7);
  border: 1px solid #e0e0e0;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 10;
  transition: background-color 0.2s ease;
}

.slider-arrow:hover {
  background-color: #f0f0f0;
}

.slider-arrow.left {
  left: -20px;
}

.slider-arrow.right {
  right: -20px;
}

.category-slider-wrapper {
  display: flex;
  gap: 20px;
  overflow-x: scroll; /* Changed from hidden to scroll to allow native scrolling and for checkScrollPosition logic to work reliably */
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x mandatory;
  padding-bottom: 10px; /* To prevent scrollbar from hiding content */
}

/* Hide scrollbar for aesthetics */
.category-slider-wrapper::-webkit-scrollbar {
  display: none;
}
.category-slider-wrapper {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.category-item {
  flex: 0 0 calc(20% - 16px);
  scroll-snap-align: start;
  text-align: center;
}

.category-item, .category-link, .category-image {
  background: none;
}

.category-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #555;
  transition: transform 0.2s ease;
}

.category-link:hover {
  transform: translateY(-5px);
}

.category-image {
  width: 100%;
  height: auto;
  aspect-ratio: 1 / 1;
  object-fit: contain;
  border-radius: 50%;
  border: 3px solid #f0f0f0; /* Added a subtle border for visual separation */
  padding: 5px;
}

.category-name {
  margin-top: 10px;
  font-size: 1.1rem;
  font-weight: 500;
  color: #000000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>