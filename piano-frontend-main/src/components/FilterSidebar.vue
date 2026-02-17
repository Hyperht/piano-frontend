<template>
  <div class="filter-sidebar">
    <div class="filter-header">
      <h3>
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
          <path d="M22 3H2l8 11.2V21l4-3v-6.8L22 3z" />
        </svg>
        {{ $t("filter.title") }} </h3>
      <button @click="clearFilters" class="clear-filters-btn">{{ $t("filter.clear_btn") }}</button> </div>
      
      <!-- Mobile Toggle -->
      <div class="mobile-filter-toggle">
        <button @click="isExpanded = !isExpanded" class="toggle-btn">
          {{ isExpanded ? $t('filter.hide_filters') : $t('filter.show_filters') }}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            :class="{ 'rotated': isExpanded }"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </div>

    <div v-show="isExpanded || !isMobile" class="filter-content">
      <div v-if="isLoading" class="loading-state">
        <p>{{ $t("filter.loading") }}</p> </div>

    <div v-else>
      <div class="filter-section">
        <h4 class="section-title">{{ $t("filter.sort_title") }}</h4> <div class="sort-options">
          <label>
            <input
              type="radio"
              name="sort"
              value="default"
              v-model="selectedSort"
            />
            {{ $t("filter.sort_default") }} </label>
          <label>
            <input
              type="radio"
              name="sort"
              value="price_asc"
              v-model="selectedSort"
            />
            {{ $t("filter.sort_price_asc") }} </label>
          <label>
            <input
              type="radio"
              name="sort"
              value="price_desc"
              v-model="selectedSort"
            />
            {{ $t("filter.sort_price_desc") }} </label>
        </div>
      </div>

      <div class="filter-section">
        <h4 class="section-title">{{ $t("filter.price_title") }}</h4> <div class="price-inputs">
          <input
            type="number"
            :placeholder="$t('filter.price_from')" v-model.number="priceRange.min"
            @keyup.enter="applyFilters"
          />
          <input
            type="number"
            :placeholder="$t('filter.price_to')" v-model.number="priceRange.max"
            @keyup.enter="applyFilters"
          />
          <button @click="applyFilters" class="price-apply-btn">{{ $t("filter.price_apply") }}</button> </div>
        <div class="price-slider-container">
          <div class="price-slider-track">
            <div class="price-slider-progress" :style="{ left: `${sliderMinPosition}%`, width: `${sliderMaxPosition - sliderMinPosition}%` }"></div>
          </div>
          <input 
            type="range" 
            class="price-slider min-slider"
            :min="0" 
            :max="maxPriceLimit" 
            v-model.number="sliderMin"
            @input="updatePriceFromSlider('min')"
          />
          <input 
            type="range" 
            class="price-slider max-slider"
            :min="0" 
            :max="maxPriceLimit" 
            v-model.number="sliderMax"
            @input="updatePriceFromSlider('max')"
          />
        </div>
      </div>

      <div class="filter-section" v-if="categories.length">
        <h4 class="section-title">{{ $t("filter.category_title") }}</h4>
        <div v-for="category in categories" :key="category.id" class="filter-option">
          <label>
            <input
              type="checkbox"
              :value="category.id"
              v-model="selectedCategories"
            />
            {{ localizedName(category) }}
          </label>
        </div>
      </div>

      <div class="filter-section" v-if="colors.length">
        <h4 class="section-title">{{ $t("filter.color_title") }}</h4> <div class="colors-grid">
          <div
            v-for="color in colors"
            :key="color.id"
            class="color-option"
            @click="toggleColor(color.id)"
            :class="{ 'selected': selectedColors.includes(color.id) }"
          >
            <div class="color-circle" :style="{ backgroundColor: color.hex_code }"></div>
          </div>
        </div>
      </div>

      <div class="filter-section">
        <h4 class="section-title">{{ $t("filter.rating_title") }}</h4> <div v-for="rating in [5, 4, 3, 2, 1]" :key="rating" class="filter-option">
          <label>
            <input
              type="checkbox"
              :value="rating"
              v-model="selectedRatings"
            />
            <span v-for="n in 5" :key="n" class="star" :class="{ 'filled': n <= rating }">&#9733;</span>
            <span class="rating-text">({{ rating }})</span>
          </label>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, watch, defineEmits, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { getApiUrl } from '@/config/api';
import { useI18n } from 'vue-i18n'; // Import i18n
import { useToast } from 'vue-toastification'; // Assuming Toast is used for API errors

const emit = defineEmits(['filter-changed']);
const route = useRoute();
const router = useRouter();
const { t, locale } = useI18n(); // Initialize i18n
// --- Category Localization Helper (copied from header.vue) ---
const slugify = (s) =>
  (s || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");

const localizedName = (obj, field = "name") => {
  if (!obj) return "";
  const value = obj[field];
  if (value && typeof value === "object") {
    return value[locale.value] || value.en || Object.values(value)[0] || "";
  }
  // support name_en / name_ar fields
  const short = locale.value ? locale.value.split("-")[0] : "en";
  const candidate = `${field}_${short}`;
  if (obj[candidate]) return obj[candidate];
  const base = (obj[field] || obj.name || "").toString().trim();
  const slug = slugify(base);
  // Try multiple key variants to handle minor differences/typos from backend
  const variants = [
    `categories.${slug}`,
    `categories.${slug.replace(/_and_/g, "_&_")}`,
    `categories.${slug.replace(/_/g, "-")}`,
    `categories.${base
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "")}`,
  ];
  for (const key of variants) {
    const translated = t(key);
    if (translated && translated !== key) return translated;
  }
  return obj[field] || obj.name || "";
};
const toast = useToast(); // Initialize toast

// Using centralized API configuration

const isLoading = ref(false);
const isExpanded = ref(false); // Mobile toggle state
const isMobile = ref(false); // Mobile detection

// Check for mobile on mount and resize
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 992;
  if (!isMobile.value) isExpanded.value = true;
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
  fetchFilterOptions();
});

const selectedSort = ref('default');
const priceRange = ref({ min: null, max: null });
const categories = ref([]);
const selectedCategories = ref([]);
const colors = ref([]);
const selectedColors = ref([]);
const selectedRatings = ref([]);

// Price slider related refs
const maxPriceLimit = ref(100000); // Maximum price limit for the slider
const sliderMin = ref(0);
const sliderMax = ref(maxPriceLimit.value);
const sliderMinPosition = ref(0);
const sliderMaxPosition = ref(100);

// Function to update price inputs from slider values
const updatePriceFromSlider = (type) => {
  if (type === 'min') {
    // Ensure min doesn't exceed max
    if (sliderMin.value > sliderMax.value) {
      sliderMin.value = sliderMax.value;
    }
    priceRange.value.min = Number(sliderMin.value);
    sliderMinPosition.value = (sliderMin.value / maxPriceLimit.value) * 100;
  } else {
    // Ensure max doesn't go below min
    if (sliderMax.value < sliderMin.value) {
      sliderMax.value = sliderMin.value;
    }
    priceRange.value.max = Number(sliderMax.value);
    sliderMaxPosition.value = (sliderMax.value / maxPriceLimit.value) * 100;
  }

  // Debug logging removed for production
};

// Watch for changes in price inputs to update sliders
watch(() => priceRange.value.min, (newVal) => {
  if (newVal !== null && newVal !== undefined) {
    sliderMin.value = newVal;
    sliderMinPosition.value = (newVal / maxPriceLimit.value) * 100;
  }
});

watch(() => priceRange.value.max, (newVal) => {
  if (newVal !== null && newVal !== undefined) {
    sliderMax.value = newVal;
    sliderMaxPosition.value = (newVal / maxPriceLimit.value) * 100;
  }
});

// Function to fetch filter options from the backend
const fetchFilterOptions = async () => {
  isLoading.value = true;
  
  // --- 1. Fetch Categories ---
  try {
    const categoriesResponse = await axios.get(getApiUrl('categories/'));

    // Robustly check for array structure (direct array or paginated results)
    if (Array.isArray(categoriesResponse.data)) {
        categories.value = categoriesResponse.data;
    } else if (categoriesResponse.data && Array.isArray(categoriesResponse.data.results)) {
        categories.value = categoriesResponse.data.results;
    } else {
        console.error('Categories API did not return a recognizable array structure.');
        categories.value = [];
    }
  } catch (error) {
    // This will catch 404 errors for the categories endpoint if it fails
    console.error('Error fetching categories:', error.message);
    if (error.response) {
      console.error('Categories API Response Status:', error.response.status, 'Data:', error.response.data);
    }
    categories.value = [];
    toast.error(t('filter.api_error')); // Use translated error message
  }

  // --- 2. Fetch Colors from backend ---
  try {
    const colorsResponse = await axios.get(getApiUrl('colors/'));

    let rawColors = [];
    if (Array.isArray(colorsResponse.data)) {
      rawColors = colorsResponse.data;
    } else if (colorsResponse.data && Array.isArray(colorsResponse.data.results)) {
      rawColors = colorsResponse.data.results;
    } else {
      console.error('Colors API did not return a recognizable array structure.');
      rawColors = [];
    }

    // Normalize to expected shape
    colors.value = rawColors.map(c => ({ id: c.id, name: c.name, hex_code: (c.hex_code || '').toUpperCase() })).filter(c => !!c.hex_code);
  } catch (error) {
    console.error('Error fetching colors:', error.message);
    if (error.response) {
      console.error('Colors API Response Status:', error.response.status, 'Data:', error.response.data);
    }
    colors.value = [];
    toast.error(t('filter.api_error')); // Use translated error message
  } finally {
    isLoading.value = false;
  }
};

// Function to build and emit the new query parameters
const applyFilters = () => {
  // If categories aren't loaded yet, allow applying other filters; only block when user explicitly selected categories
  if (selectedCategories.value.length > 0 && categories.value.length === 0) {
    return;
  }

  const newQuery = {};

  // Sort - always include ordering if not default
  if (selectedSort.value !== 'default') {
    if (selectedSort.value === 'price_asc') {
      newQuery.ordering = 'original_price';
    } else if (selectedSort.value === 'price_desc') {
      newQuery.ordering = '-original_price';
    }
  }

  // Price Range (allow 0 values)
  if (priceRange.value.min !== null && priceRange.value.min !== undefined && priceRange.value.min !== '') {
    newQuery['original_price__gte'] = priceRange.value.min;
  }
  if (priceRange.value.max !== null && priceRange.value.max !== undefined && priceRange.value.max !== '') {
    newQuery['original_price__lte'] = priceRange.value.max;
  }

  // Categories - only include if there are selected categories
  if (selectedCategories.value.length > 0) {
    newQuery['category'] = selectedCategories.value.join(',');
  }

  // Colors - only include if there are selected colors
  if (selectedColors.value.length > 0) {
    newQuery['colors'] = selectedColors.value.join(',');
  }
  
  // Ratings - only include if there are selected ratings
  if (selectedRatings.value.length > 0) {
    newQuery['rating'] = selectedRatings.value.join(',');
  }

  emit('filter-changed', newQuery);
};

// Function to clear all filter selections and apply
const clearFilters = async () => {
  selectedSort.value = 'default';
  priceRange.value = { min: null, max: null };
  selectedCategories.value = [];
  selectedColors.value = [];
  selectedRatings.value = [];

  // Deterministic clear: navigate to Search with empty query and emit an empty filter payload after navigation completes
  try {
    await router.push({ name: 'Search', query: {} });
    await nextTick();
    // emit empty filters so parent can react if it prefers (some flows rely on the event)
    emit('filter-changed', {});
  } catch (e) {
    emit('filter-changed', {});
  }
};

// Function to handle individual filter removal (not used in template, but kept for completeness)
const removeFilter = async (filterType, value) => {
  switch (filterType) {
    case 'category':
      const categoryIndex = selectedCategories.value.indexOf(value);
      if (categoryIndex > -1) {
        selectedCategories.value.splice(categoryIndex, 1);
      }
      break;
    case 'rating':
      const ratingIndex = selectedRatings.value.indexOf(value);
      if (ratingIndex > -1) {
        selectedRatings.value.splice(ratingIndex, 1);
      }
      break;
    case 'color':
      const colorIndex = selectedColors.value.indexOf(value);
      if (colorIndex > -1) {
        selectedColors.value.splice(colorIndex, 1);
      }
      break;
  }

  if (filterType === 'category' && selectedCategories.value.length === 0) {
    try {
      if (route.name === 'CategoryPage' || route.name === 'SubCategoryPage') {
        await router.push({ name: 'Search', query: {} });
        return;
      }
    } catch (e) {
      // Navigation failed, continue with filter application
    }
  }

  applyFilters();
};

// Function to toggle a color selection
const toggleColor = (colorId) => {
  const index = selectedColors.value.indexOf(colorId);
  if (index === -1) {
    selectedColors.value.push(colorId);
  } else {
    selectedColors.value.splice(index, 1);
  }
  // Apply filters immediately when a color is selected or deselected
  applyFilters();
};

// Watch for changes in the route query and update filters
watch(
  () => [route.query, route.params],
  ([newQuery, newParams]) => {
    // 1. Sort
    selectedSort.value = newQuery.ordering === 'original_price' 
      ? 'price_asc' 
      : newQuery.ordering === '-original_price' 
        ? 'price_desc' 
        : 'default';
        
    // 2. Price Range
    priceRange.value.min = newQuery.original_price__gte || null;
    priceRange.value.max = newQuery.original_price__lte || null;
    
    // Helper function for robust query parsing
    const parseQueryToArray = (queryValue) => {
        if (!queryValue) return [];
        // Handle both single ID (string) and multiple IDs (comma-separated string/array)
        const idsArray = Array.isArray(queryValue) 
            ? queryValue 
            : queryValue.toString().split(',');
        return idsArray.map(Number);
    };

    // 3. Categories - Handle both route params and query params
    let categoryIds = parseQueryToArray(newQuery['category']);
    
    // If we have a category from route params, add it to the selection
    if (newParams.categoryName && categories.value.length > 0) {
      const categoryFromRoute = categories.value.find(cat => 
        cat.name.toLowerCase() === newParams.categoryName.toLowerCase()
      );
      if (categoryFromRoute) {
        // Always add the category from route params, even if it's already in the list
        if (!categoryIds.includes(categoryFromRoute.id)) {
          categoryIds.push(categoryFromRoute.id);
        }
      }
    }
    
    // If we have a subcategory from route params, also add its parent category
    if (newParams.subCategoryName && newParams.categoryName && categories.value.length > 0) {
      const parentCategory = categories.value.find(cat => 
        cat.name.toLowerCase() === newParams.categoryName.toLowerCase()
      );
      if (parentCategory && !categoryIds.includes(parentCategory.id)) {
        categoryIds.push(parentCategory.id);
      }
    }
    
    // Set the final category selection
    selectedCategories.value = categoryIds;
    
    // Apply filters immediately when category is selected from route
    if (newParams.categoryName) {
      nextTick(() => {
        applyFilters();
      });
    }

    // 4. Colors (Robust Parsing)
    selectedColors.value = parseQueryToArray(newQuery['colors']);

    // 5. Ratings - Handle comma-separated rating values
    if (newQuery.rating) {
      // Handle comma-separated ratings
      if (typeof newQuery.rating === 'string' && newQuery.rating.includes(',')) {
        selectedRatings.value = newQuery.rating.split(',').map(r => parseInt(r.trim())).filter(r => !isNaN(r));
      } else {
        selectedRatings.value = [parseInt(newQuery.rating)];
      }
    } else if (newQuery.rating__gte) {
      selectedRatings.value = [parseInt(newQuery.rating__gte)];
    } else {
      selectedRatings.value = [];
    }
  },
  { immediate: true }
);

// Watch for immediate changes in filter values
watch(selectedSort, (newSort, oldSort) => {
  // Only apply if there's actually a change and not during initial load
  if (newSort !== oldSort && oldSort !== undefined) {
    applyFilters();
  }
});

watch(selectedCategories, (newCategories, oldCategories) => {
  // Only apply if there's actually a change and not during initial load
  if (JSON.stringify(newCategories) !== JSON.stringify(oldCategories) && oldCategories !== undefined) {
    applyFilters();
  }
}, { deep: true });

watch(selectedColors, (newColors, oldColors) => {
  // Only apply if there's actually a change and not during initial load
  if (JSON.stringify(newColors) !== JSON.stringify(oldColors) && oldColors !== undefined) {
    applyFilters();
  }
}, { deep: true });

watch(selectedRatings, (newRatings, oldRatings) => {
  // Only apply if there's actually a change and not during initial load
  if (JSON.stringify(newRatings) !== JSON.stringify(oldRatings) && oldRatings !== undefined) {
    applyFilters();
  }
}, { deep: true });

watch(priceRange, (newPriceRange, oldPriceRange) => {
  // Only apply if there's actually a change and not during initial load
  if (JSON.stringify(newPriceRange) !== JSON.stringify(oldPriceRange) && oldPriceRange !== undefined) {
    applyFilters();
  }
}, { deep: true });

// Watch for when categories are loaded and we have a route param
watch(
  () => categories.value,
  (newCategories) => {
    if (newCategories.length > 0 && route.params.categoryName) {
      // Find the category from route params and add it to selection
      const categoryFromRoute = newCategories.find(cat => 
        cat.name.toLowerCase() === route.params.categoryName.toLowerCase()
      );
      if (categoryFromRoute && !selectedCategories.value.includes(categoryFromRoute.id)) {
        selectedCategories.value.push(categoryFromRoute.id);
        // Don't apply filters here - let ProductListPage handle the API call
        // The ProductListPage will handle the initial API call with the route param
      }
    }
  },
  { immediate: true }
);

// Watch for category selection changes and navigate to category page
watch(
  () => selectedCategories.value,
  (newCategories, oldCategories) => {
    // Only navigate if this is a user selection (not from route params)
    if (newCategories.length > 0 && newCategories !== oldCategories) {
      const selectedCategoryId = newCategories[newCategories.length - 1]; // Get the last selected category
      const selectedCategory = categories.value.find(cat => cat.id === selectedCategoryId);
      
      if (selectedCategory) {
        // Navigate to the category page
        router.push({
          name: 'CategoryPage',
          params: { categoryName: selectedCategory.name.toLowerCase() }
        });
      }
    }
  }
);

onMounted(() => {
  fetchFilterOptions();
});
</script>

<style scoped>
/* (All existing styles remain unchanged) */
.filter-sidebar {
 width: 280px;
 min-width: 280px;
 padding: 1.5rem;
 background-color: #f9f9f9;
 border-radius: 8px;
 box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.filter-header {
 display: flex;
 justify-content: space-between;
 align-items: center;
 margin-bottom: 1.5rem;
}

.filter-header h3 {
 font-size: 1.5rem;
 font-weight: 600;
 color: #333;
 display: flex;
 align-items: center;
 gap: 0.5rem;
}

.clear-filters-btn {
 background: none;
 border: none;
 color: #007bff;
 font-weight: 500;
 cursor: pointer;
 padding: 0;
}

.filter-section {
 padding: 1.5rem 0;
 border-bottom: 1px solid #e0e0e0;
}

.filter-section:last-child {
 border-bottom: none;
}

.section-title {
 font-size: 1.1rem;
 font-weight: 600;
 color: #444;
 margin-bottom: 1rem;
}

.filter-option label,
.sort-options label {
 display: flex;
 align-items: center;
 gap: 0.75rem;
 font-size: 1rem;
 color: #555;
 margin-bottom: 0.75rem;
 cursor: pointer;
}

.filter-option input[type="checkbox"],
.sort-options input[type="radio"] {
 accent-color: #007bff;
 width: 18px;
 height: 18px;
}

/* Price Inputs */
.price-inputs {
 display: flex;
 gap: 0.5rem;
 align-items: center;
}

.price-inputs input {
 width: 80px;
 padding: 0.5rem;
 border: 1px solid #ccc;
 border-radius: 5px;
}

.price-apply-btn {
 background-color: #007bff;
 color: white;
}

/* Price Slider Styling */
.price-slider-container {
  position: relative;
  width: 100%;
  height: 40px;
  margin-top: 20px;
}

.price-slider-track {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  height: 6px;
  background-color: #e0e0e0;
  border-radius: 3px;
}

.price-slider-progress {
  position: absolute;
  height: 100%;
  background-color: #000000;
  border-radius: 3px;
}

.price-slider {
  position: absolute;
  top: 0;
  width: 100%;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  pointer-events: auto; /* enable dragging */
  height: 100%;
  margin: 0;
}

.price-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #000000;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  pointer-events: auto;
  margin-top: -8px;
}

.price-slider::-moz-range-thumb {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #000000;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  pointer-events: auto;
}

.price-apply-btn {
  border: none;
  padding: 0.5rem 1rem;
 border-radius: 5px;
 cursor: pointer;
}

/* Colors Grid */
.colors-grid {
 display: flex;
 flex-wrap: wrap;
 gap: 0.75rem;
}

.color-option {
 width: 30px;
 height: 30px;
 border-radius: 50%;
 display: flex;
 justify-content: center;
 align-items: center;
 cursor: pointer;
 transition: transform 0.2s ease, box-shadow 0.2s ease;
 border: 2px solid transparent;
}

.color-option.selected {
 border-color: #007bff;
 transform: scale(1.1);
}

.color-circle {
 width: 24px;
 height: 24px;
 border-radius: 50%;
 box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
}

/* Rating Stars */
.star {
 color: #ddd;
 font-size: 1.2rem;
}

.star.filled {
 color: gold;
}

.rating-text {
 font-size: 0.9rem;
 color: #888;
}

/* NEW: Loading State Style */
.loading-state {
 text-align: center;
 color: #888;
 margin-top: 2rem;
 padding: 1rem;
 border: 1px dashed #ccc;
 border-radius: 5px;
}

/* Responsive Styles */
.mobile-filter-toggle {
  display: none;
  margin-bottom: 1rem;
}

.toggle-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  cursor: pointer;
}

.toggle-btn svg {
  transition: transform 0.3s ease;
}

.toggle-btn svg.rotated {
  transform: rotate(180deg);
}

@media (max-width: 992px) {
  .filter-sidebar {
    width: 100%;
    min-width: unset;
  }
  
  .mobile-filter-toggle {
    display: block;
  }
  
  .filter-header {
    margin-bottom: 0.5rem;
  }
}
</style>