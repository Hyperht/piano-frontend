<template>
  <div class="grid-container">
    <div class="column">
      <div 
        class="field field-long clickable"
        :style="{ backgroundImage: sortedPromos[0] ? `url(${sortedPromos[0].image})` : '' }"
        v-if="sortedPromos[0]"
        @click="handlePromoClick(0)"
      >
        <div class="overlay" :style="{ backgroundColor: sortedPromos[0].background_color }"></div>
        <div class="content">
          <h2>{{ localizedName(sortedPromos[0]) }}</h2>
        </div>
      </div>
      <div 
        class="field field-short clickable"
        :style="{ backgroundImage: sortedPromos[1] ? `url(${sortedPromos[1].image})` : '' }"
        v-if="sortedPromos[1]"
        @click="handlePromoClick(1)"
      >
        <div class="overlay" :style="{ backgroundColor: sortedPromos[1].background_color }"></div>
        <div class="content">
          <h2>{{ localizedName(sortedPromos[1]) }}</h2>
        </div>
      </div>
    </div>
    <div class="column">
      <div 
        class="field field-short clickable"
        :style="{ backgroundImage: sortedPromos[2] ? `url(${sortedPromos[2].image})` : '' }"
        v-if="sortedPromos[2]"
        @click="handlePromoClick(2)"
      >
        <div class="overlay" :style="{ backgroundColor: sortedPromos[2].background_color }"></div>
        <div class="content">
          <h2>{{ localizedName(sortedPromos[2]) }}</h2>
        </div>
      </div>
      <div 
        class="field field-long clickable"
        :style="{ backgroundImage: sortedPromos[3] ? `url(${sortedPromos[3].image})` : '' }"
        v-if="sortedPromos[3]"
        @click="handlePromoClick(3)"
      >
        <div class="overlay" :style="{ backgroundColor: sortedPromos[3].background_color }"></div>
        <div class="content">
          <h2>{{ localizedName(sortedPromos[3]) }}</h2>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { getApiUrl } from '@/config/api';

const props = defineProps({
  promoFilters: {
    type: Array,
    default: () => [null, null, null, null],
  },
});

const promotions = ref([]);
const sortedPromos = ref([]);

const router = useRouter();

// Translation helper (copied/adapted from header.vue)
const { locale, t } = useI18n();
const slugify = (s) =>
  (s || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');

const localizedName = (obj, field = 'title') => {
  if (!obj) return '';
  const value = obj[field];
  if (value && typeof value === 'object') {
    return value[locale.value] || value.en || Object.values(value)[0] || '';
  }
  // support title_en / title_ar fields
  const short = locale.value ? locale.value.split('-')[0] : 'en';
  const candidate = `${field}_${short}`;
  if (obj[candidate]) return obj[candidate];
  const base = (obj[field] || obj.title || '').toString().trim();
  const slug = slugify(base);
  const variants = [
    `promos.${slug}`,
    `promos.${slug.replace(/_and_/g, '_&_')}`,
    `promos.${slug.replace(/_/g, '-')}`,
    `promos.${base.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}`,
  ];
  for (const key of variants) {
    const translated = t(key);
    if (translated && translated !== key) return translated;
  }
  return obj[field] || obj.title || '';
};

const localizedSubtitle = (obj) => localizedName(obj, 'subtitle');

const fetchPromotions = async () => {
  try {
    const response = await axios.get(getApiUrl('promo-grid-categories/'));
    promotions.value = response.data.sort((a, b) => a.order - b.order);
    sortedPromos.value = promotions.value.slice(0, 4);
  } catch (error) {
    console.error('Failed to fetch promo grid categories:', error);
  }
};

const handlePromoClick = (idx) => {
  const filter = props.promoFilters && props.promoFilters[idx];
  // If filter is an object, pass as query; if string, use as q param; else, just go to search
  if (filter && typeof filter === 'object') {
    router.push({ name: 'Search', query: filter });
  } else if (typeof filter === 'string') {
    router.push({ name: 'Search', query: { q: filter } });
  } else if (sortedPromos.value[idx] && sortedPromos.value[idx].title) {
    // fallback: use promo title as search
    router.push({ name: 'Search', query: { q: localizedName(sortedPromos.value[idx]) } });
  } else {
    router.push({ name: 'Search' });
  }
};

onMounted(() => {
  fetchPromotions();
});
</script>

<style scoped>

.grid-container {
  display: flex;
  justify-content: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  width: 100%;
  max-width: 100vw;
  box-sizing: border-box;
  aspect-ratio: 6 / 3;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: #ccc #f0f0f0;
}

/* Optional: Hide scrollbar for Webkit browsers */
.grid-container::-webkit-scrollbar {
  height: 8px;
  background: #f0f0f0;
}
.grid-container::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

.column {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.5rem;
  flex: 1;
}

.field {
  position: relative;
  background-color: #f0f0f0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  cursor: default;
}

.field.clickable {
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
}
.field.clickable:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  transform: translateY(-2px) scale(1.01);
}

.field-long {
  height: 75%;
}

.field-short {
  height: 25%;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.content {
  position: relative;
  z-index: 2;
  padding: 1rem;
  text-align: center;
  color: white;
}

@media (max-width: 768px) {
  .grid-container {
    flex-direction: column;
    height: auto;
    aspect-ratio: unset;
    overflow-x: visible;
  }

  .column {
    flex-direction: column;
    width: 100%;
  }
  
  .field {
    min-height: 200px;
  }

  .field-long, .field-short {
    height: 200px;
  }
}
</style>
```