<template>
  <Header />
  <div class="product-list-container">
    <div class="main-content">
      <FilterSidebar @filter-changed="updateFilters" />

      <div class="product-results-area">
        <h1 class="page-title">{{ pageTitle }}</h1>
        <div v-if="loading" class="loading-state">
          <p>{{ t('general.loading_products') }}</p>
        </div>
        <div v-else-if="products.length > 0">
          <ProductGrid :products="products" />
        </div>
        <div v-else class="no-results">
          <p>{{ t('product.no_products_in_category') }}</p>
        </div>
      </div>
    </div>
  </div>
  <Footer />
</template>

<script setup>
import Header from './header.vue';
import { ref, watch, computed, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { getApiUrl } from '@/config/api';
import ProductGrid from './ProductGrid.vue';
import Footer from './Footer.vue';
import FilterSidebar from './FilterSidebar.vue';
import { useI18n } from 'vue-i18n'; // <-- New Import

const { t } = useI18n(); // <-- New Setup

const route = useRoute();
const router = useRouter();
const products = ref([]);
const loading = ref(true);
const categories = ref([]);
const isInitialized = ref(false);
let fetchTimeout = null;
// Using centralized API configuration

// Helper function for capitalizing slugs (from previous response)
const formatSlug = (slug) => {
  if (!slug) return '';
  const words = slug.replace(/[-_]/g, ' ').split(' ');
  return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};


const pageTitle = computed(() => {
  // Get selected categories from the filter sidebar
  const selectedCategoryIds = route.query.category ? route.query.category.toString().split(',').map(Number) : [];
  
  if (selectedCategoryIds.length > 0) {
    // If we have multiple categories selected, show them all
    const categoryNames = selectedCategoryIds.map(id => {
      // This will be populated when categories are loaded
      const category = categories.value.find(cat => cat.id === id);
      // Use translation key for fallback category ID display
      return category ? category.name : t('general.category_id_prefix', { id });
    });
    return categoryNames.join(' & ');
  }
  
  if (route.params.subCategoryName) {
    // Use the slug formatter for route names
    return formatSlug(route.params.subCategoryName);
  }
  if (route.params.categoryName) {
    // Use the slug formatter for route names
    return formatSlug(route.params.categoryName);
  }
  
  // Translatable default title
  return t('home.all');
});

const fetchCategories = async () => {
  try {
    const response = await axios.get(getApiUrl('categories/'));
    
    if (Array.isArray(response.data)) {
      categories.value = response.data;
    } else if (response.data && Array.isArray(response.data.results)) {
      categories.value = response.data.results;
    }
    
    // Try to fetch subcategories separately if they're not included
    if (categories.value.length > 0 && !categories.value[0].subcategories) {
      try {
        const subcategoriesResponse = await axios.get(getApiUrl('subcategories/'));
        
        // Map subcategories to their parent categories
        if (Array.isArray(subcategoriesResponse.data)) {
          const subcategories = subcategoriesResponse.data;
          categories.value.forEach(category => {
            category.subcategories = subcategories.filter(sub => 
              sub.parent_category && sub.parent_category.id === category.id
            );
          });
        }
      } catch (subError) {
        console.error('Error fetching subcategories:', subError);
      }
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    categories.value = [];
  }
};

const fetchProducts = async (query, immediate = false) => {
  // Clear any existing timeout
  if (fetchTimeout) {
    clearTimeout(fetchTimeout);
  }
  
  // If not immediate, debounce the call
  if (!immediate) {
    fetchTimeout = setTimeout(() => {
      performFetch(query);
    }, 300);
  } else {
    performFetch(query);
  }
};

const performFetch = async (query) => {
  loading.value = true;
  try {
    const response = await axios.get(getApiUrl('products/'), {
      params: query,
    });
    
    // Handle different response formats
    if (Array.isArray(response.data)) {
      products.value = response.data;
    } else if (response.data && Array.isArray(response.data.results)) {
      products.value = response.data.results;
    } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      products.value = response.data.data;
    } else {
      console.warn('Unexpected API response format:', response.data);
      products.value = [];
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    // Only clear products if this is the first load
    if (products.value.length === 0) {
      products.value = [];
    }
  } finally {
    loading.value = false;
  }
};

const updateFilters = (newFilters) => {
  const currentQuery = { ...route.query };
  
  // Remove existing filter parameters that might be empty
  const filterKeys = ['category', 'colors', 'rating', 'original_price__gte', 'original_price__lte', 'ordering'];
  
  // Clear existing filter parameters
  filterKeys.forEach(key => {
    if (currentQuery[key] !== undefined) {
      delete currentQuery[key];
    }
  });
  
  // Add new filter parameters
  const combinedQuery = {
    ...currentQuery,
    ...newFilters,
  };
  
  // Remove any undefined or empty values
  Object.keys(combinedQuery).forEach(key => {
    if (combinedQuery[key] === undefined || combinedQuery[key] === null || combinedQuery[key] === '') {
      delete combinedQuery[key];
    }
  });
  
  router.push({ query: combinedQuery });
};

watch(
  () => [route.params, route.query],
  ([newParams, newQuery]) => {
    // Wait for initialization to complete
    if (!isInitialized.value) {
      return;
    }
    
    let apiQuery = { ...newQuery };
    
    // Dynamically add category and subcategory filters from route parameters
    if (newParams.subCategoryName) {
      // Clear any existing category filters when filtering by subcategory
      delete apiQuery['category__name'];
      delete apiQuery['category'];
      
      // Add subcategory name filter
      apiQuery['subcategory__name'] = newParams.subCategoryName;
      
      // Also add subcategory ID and parent category for better filtering
      const parentCategory = categories.value.find(cat => 
        cat.name.toLowerCase() === newParams.categoryName.toLowerCase()
      );
      
      if (parentCategory && parentCategory.subcategories) {
        const subcategory = parentCategory.subcategories.find(sub => {
          const subName = sub.name ? sub.name.toLowerCase().trim() : '';
          const paramName = newParams.subCategoryName.toLowerCase().trim();
          
          // Try exact match first
          if (subName === paramName) return true;
          
          // Try contains match
          if (subName.includes(paramName) || paramName.includes(subName)) return true;
          
          // Try word boundary match for better accuracy
          const subWords = subName.split(/\s+/);
          const paramWords = paramName.split(/\s+/);
          return subWords.some(word => 
            paramWords.some(paramWord => word.includes(paramWord) || paramWord.includes(word))
          );
        });
        if (subcategory) {
          apiQuery['subcategory'] = subcategory.id.toString();
          apiQuery['category'] = parentCategory.id.toString();
        }
      }
    } else if (newParams.categoryName) {
      apiQuery['category__name'] = newParams.categoryName;
      
      // Also add category ID to the query for better filtering
      const categoryFromRoute = categories.value.find(cat => 
        cat.name.toLowerCase() === newParams.categoryName.toLowerCase()
      );
      if (categoryFromRoute) {
        apiQuery['category'] = categoryFromRoute.id.toString();
      }
    }
    
    // Remove the search query param as this is for category browsing
    if (apiQuery.q) {
      delete apiQuery.q;
    }
    
    fetchProducts(apiQuery, true); // Immediate fetch for route changes
  },
  { immediate: false }
);

onMounted(async () => {
  // Initialize categories first
  await fetchCategories();
  
  // Set initialization flag
  isInitialized.value = true;
  
  // Now fetch products with current route
  const apiQuery = { ...route.query };
  
  // Add route parameters
  if (route.params.subCategoryName) {
    // Clear any existing category filters when filtering by subcategory
    delete apiQuery['category__name'];
    delete apiQuery['category'];
    
    // Add subcategory name filter
    apiQuery['subcategory__name'] = route.params.subCategoryName;
    
    // Also add subcategory ID and parent category for better filtering
    const parentCategory = categories.value.find(cat => 
      cat.name.toLowerCase() === route.params.categoryName.toLowerCase()
    );
    
    if (parentCategory && parentCategory.subcategories) {
      const subcategory = parentCategory.subcategories.find(sub => {
        const subName = sub.name ? sub.name.toLowerCase().trim() : '';
        const paramName = route.params.subCategoryName.toLowerCase().trim();
        
        // Try exact match first
        if (subName === paramName) return true;
        
        // Try contains match
        if (subName.includes(paramName) || paramName.includes(subName)) return true;
        
        // Try word boundary match for better accuracy
        const subWords = subName.split(/\s+/);
        const paramWords = paramName.split(/\s+/);
        return subWords.some(word => 
          paramWords.some(paramWord => word.includes(paramWord) || paramWord.includes(word))
        );
      });
      if (subcategory) {
        apiQuery['subcategory'] = subcategory.id.toString();
        apiQuery['category'] = parentCategory.id.toString();
      }
    }
  } else if (route.params.categoryName) {
    apiQuery['category__name'] = route.params.categoryName;
    
    // Also add category ID to the query for better filtering
    const categoryFromRoute = categories.value.find(cat => 
      cat.name.toLowerCase() === route.params.categoryName.toLowerCase()
    );
    if (categoryFromRoute) {
      apiQuery['category'] = categoryFromRoute.id.toString();
    }
  }
  
  // Remove search query param
  if (apiQuery.q) {
    delete apiQuery.q;
  }
  
  fetchProducts(apiQuery, true);
});
</script>

<style scoped>
.product-list-container {
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

.page-title {
  text-transform: capitalize;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
}

.loading-state,
.no-results {
  text-align: center;
  font-size: 1.2rem;
  color: #888;
  margin-top: 2rem;
}
</style>