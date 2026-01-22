<template>
  <Header />
  <div class="search-page-container">
    <div class="main-content">
      <FilterSidebar @filter-changed="updateFilters" />

      <div class="product-results-area">
        <div v-if="loading" class="loading-state">
          <p>{{ $t('general.loading_products') }}</p>
        </div>
        <div v-else-if="products.length > 0">
          <ProductGrid 
            :products="products" 
            :title="$t('search.results_header', { query: searchQuery })" 
          />
        </div>
        <div v-else class="no-results">
          <p>{{ $t('search.no_results') }}</p>
        </div>
      </div>
    </div>
  </div>
  <Footer />
</template>

<script setup>
import Header from './header.vue';
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n'; // 1. Import useI18n
import axios from 'axios';
import { getApiUrl } from '@/config/api';
import ProductGrid from './ProductGrid.vue';
import Footer from './Footer.vue';
import FilterSidebar from './FilterSidebar.vue';

const route = useRoute();
const router = useRouter();
const { t } = useI18n(); // 2. Initialize useI18n
const products = ref([]);
const searchQuery = ref('');
const loading = ref(true);

// 4. Function to fetch search results with all current filters
const fetchSearchResults = async (currentQuery) => {
  loading.value = true;
  try {
    // Always send the search query as 'search' (DRF expects this)
    const apiQuery = { ...currentQuery };
    if (apiQuery.q && !apiQuery.search) {
      apiQuery.search = apiQuery.q;
      delete apiQuery.q;
    }
    const response = await axios.get(getApiUrl('products/'), {
      params: apiQuery,
    });
    // Normalize response: always set products.value to an array
    let items = [];
    if (Array.isArray(response.data)) {
      items = response.data;
    } else if (response.data.results) {
      items = response.data.results;
    } else if (response.data.data) {
      items = response.data.data;
    }
    products.value = items;

    // If no category filter is applied yet, infer and set it when clear
    // This auto-checks the category in the sidebar for coherent UX
    if (!('category' in apiQuery) && !('category__in' in apiQuery)) {
      if (Array.isArray(items) && items.length > 0) {
        // Try to extract category id from different shapes
        const extractCategoryId = (p) => {
          if (!p) return undefined;
          if (typeof p.category === 'number') return p.category;
          if (p.category && typeof p.category.id === 'number') return p.category.id;
          if (typeof p.category_id === 'number') return p.category_id;
          return undefined;
        };

        const categoryIds = items.map(extractCategoryId).filter((v) => typeof v === 'number');
        if (categoryIds.length > 0) {
          const first = categoryIds[0];
          const allSame = categoryIds.every((id) => id === first);
          if (allSame) {
            // Push category into the URL so FilterSidebar auto-selects it
            const newQuery = { ...route.query, category: String(first) };
            // Use replace to ensure the query updates immediately without duplicating history
            router.replace({ query: newQuery });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error fetching search results:', error);
    products.value = [];
  } finally {
    loading.value = false;
  }
};

// 5. Update the URL and trigger a new search when filters change
const updateFilters = (newFilters) => {
  const currentQuery = route.query;
  const combinedQuery = {
    ...currentQuery,
    ...newFilters,
  };
  router.push({ query: combinedQuery });
};

// 6. Watch for any changes in the entire route query object
watch(
  () => route.query,
  (newQuery) => {
    // The main search query may come as 'q' (legacy) or 'search' (backend expects this)
    searchQuery.value = newQuery.q || newQuery.search || '';
    
    // If no search query and no filters, fetch all products
    if (!newQuery.q && !newQuery.search && Object.keys(newQuery).length === 0) {
      fetchSearchResults({});
    } else {
      // Normalize query keys for the backend: ensure 'search' is used
      const apiQuery = { ...newQuery };
      if (apiQuery.q && !apiQuery.search) {
        apiQuery.search = apiQuery.q;
        delete apiQuery.q;
      }
      fetchSearchResults(apiQuery);
    }
  },
  { immediate: true } // Run immediately to fetch on initial page load
);
</script>


<style scoped>
.search-page-container {
  max-width: 1400px;
  margin: 2rem auto;
  padding: 0 2rem;
}

.main-content {
  display: flex;
  gap: 2rem;
}

.product-results-area {
  flex-grow: 1;
}

.loading-state,
.no-results {
  text-align: center;
  font-size: 1.2rem;
  color: #888;
  margin-top: 2rem;
}
</style>