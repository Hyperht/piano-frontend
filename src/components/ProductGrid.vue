<template>
  <div class="product-grid-container">
    <div class="grid-header" v-if="title && showTitle">
      <h2>{{ title }}</h2>
      <a href="#" class="view-all">{{ $t("product.view_all") }}</a>
    </div>

    <div v-if="loading" class="loading-state">
      <p>{{ $t("product.loading") }}</p>
    </div>
    <div v-else-if="productsToShow.length > 0" class="products-grid">
      <router-link
        v-for="product in productsToShow"
        :key="product.id"
        :to="{ name: 'Product', params: { id: product.id } }"
        class="product-card-link"
      >
        <div class="product-card">
          <div class="card-image-container">
            <img
              :src="product.image"
              :alt="localizedField(product, 'name')"
              class="product-image"
            />

            <div class="sale-badge" v-if="product.is_on_sale">
              <span v-if="product.sale_badge_image">
                <img
                  :src="product.sale_badge_image"
                  alt="Sale"
                  class="sale-image"
                />
              </span>
              <span v-else>{{ $t("product.sale") }}</span>
            </div>
            <div class="favorite-icon" @click.stop.prevent="toggleFavorite(product)">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="#e74c3c"
                stroke="#e74c3c"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="feather feather-heart"
              >
                <path
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                ></path>
              </svg>
            </div>
          </div>

          <div class="card-content">
            <h3 class="product-name">{{ localizedField(product, 'name') }}</h3>
            <p class="product-short-desc">{{ localizedField(product, 'short_description') }}</p>
            <p class="product-dimensions">{{ product.dimensions }}</p>

            <div class="colors">
              <div
                v-for="color in product.colors"
                :key="color.hex_code"
                class="color-circle"
                :style="{
                  backgroundColor: color.hex_code,
                  border: color.selected ? '1px solid #333' : '1px solid #ccc',
                }"
              ></div>
            </div>

            <div class="rating">
              <span
                v-for="n in 5"
                :key="n"
                class="star"
                :class="{ filled: n <= product.rating }"
                >&#9733;</span
              >
              <span class="rating-reviews">({{ product.rating }}/5)</span>
            </div>

            <div class="price-section">
              <span class="original-price" v-if="product.is_on_sale"
                >${{ product.original_price }}</span
              >
              <span class="sale-price" v-if="product.is_on_sale"
                >${{ product.sale_price }}</span
              >
              <span class="regular-price" v-else
                >${{ product.original_price }}</span
              >
            </div>

            <button
              class="add-to-cart-btn"
              @click.prevent="addToCart(product)"
              :disabled="isAdding"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="feather feather-shopping-cart"
              >
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path
                  d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </router-link>
    </div>
    <div v-else class="no-results">
      <p>{{ emptyMessage || $t("product.no_products") }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, defineEmits } from "vue";
import { useI18n } from "vue-i18n";
import axios from "axios";
import api from "@/config/api";
import { useToast } from "vue-toastification";
import { useCartStore } from "@/stores/Cart";
import { useAuthStore } from "@/stores/auth";
import { getApiUrl } from "@/config/api";

// Localization helper: display localized fields when backend provides per-locale objects or name_en/name_ar fields
const { locale } = useI18n();
const fieldForLocale = (fieldName, obj) => {
  if (!obj) return '';
  const short = (locale.value || 'en').split('-')[0];

  // 1) If the field is an object with locale keys
  const val = obj[fieldName];
  if (val && typeof val === 'object') {
    return (
      val[locale.value] || val[short] || val.en || val.ar || Object.values(val)[0] || ''
    );
  }

  // 2) If backend exposes name_en / name_ar style keys
  const candidateKey = `${fieldName}_${short}`;
  if (obj[candidateKey]) return obj[candidateKey];

  // 3) Fallback to direct string field
  return obj[fieldName] || obj.name || '';
};

const localizedField = (product, field = 'name') => {
  // Support nested localized objects or per-locale suffixed fields
  try {
    return fieldForLocale(field, product) || '';
  } catch (e) {
    console.debug('localizedField error', e, product);
    return product[field] || '';
  }
};


// --- NEW: Define the event to send the item count to the parent ---
const emit = defineEmits(["items-loaded"]);
// -----------------------------------------------------------------

const props = defineProps({
  title: {
    type: String,
    required: false,
  },
  endpoint: {
    type: String,
    required: false,
  },
  products: {
    type: Array,
    default: null,
  },
  // Added from the parent component's original structure, ensure it's here
  emptyMessage: {
    type: String,
    default: null,
  },
  showTitle: {
    type: Boolean,
    default: true,
  },
});

const productsFromApi = ref([]);
const isAdding = ref(false);
const toast = useToast();
const favoriteProductIds = ref(new Set());

const { t } = useI18n();

// Initialize Pinia stores
const cartStore = useCartStore();
const authStore = useAuthStore();

const productsToShow = computed(() => {
  const source = props.products || productsFromApi.value;
  return source.map((product) => ({
    ...product,
    is_favorite: favoriteProductIds.value.has(product.id),
  }));
});

const loading = computed(() => {
  if (props.products) {
    return false;
  }
  return productsFromApi.value.length === 0 && props.endpoint !== undefined;
});

const fetchFavorites = async () => {
  const token = authStore.token && (authStore.token.value || authStore.token);
  if (!token) {
    favoriteProductIds.value = new Set();
    return;
  }
  try {
    const response = await api.get("favorites/");
    favoriteProductIds.value = new Set(
      response.data.map((item) => item.product.id)
    );
  } catch (error) {
    console.error(
      "Error fetching favorites:",
      error,
      error.response && error.response.data
    );
    favoriteProductIds.value = new Set();
  }
};

const fetchProducts = async (endpoint) => {
  // Only fetch full product data if we are not passed a product list via props
  if (props.products) return;

  await fetchFavorites();
  const token = authStore.token;
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  try {
    const response = await api.get(endpoint);
    let fetchedProducts = response.data;

    // Check if we are fetching the favorites list itself
    if (endpoint === "favorites") {
      // Assume API returns [{id: fav_id, product: {...}}, ...]
      fetchedProducts = response.data.map((item) => ({
        ...item.product,
        // Keep the favorite ID for easier removal/toggling
        favorite_item_id: item.id,
      }));
    }

    productsFromApi.value = fetchedProducts;

    // --- EDITED: Emit the product count after successful fetch ---
    emit("items-loaded", fetchedProducts.length);
    // ---------------------------------------------------------
  } catch (error) {
    console.error(`Error fetching products from ${endpoint}:`, error);
    productsFromApi.value = [];

    // --- NEW: Emit 0 count if fetching fails ---
    emit("items-loaded", 0);
    // -------------------------------------------
  }
};

onMounted(() => {
  if (props.endpoint) {
    fetchProducts(props.endpoint);
  } else if (!props.products) {
    console.warn(
      "ProductGrid component used without 'endpoint' or 'products' prop. No data will be displayed."
    );
    // --- NEW: Emit 0 count if no endpoint/data is provided ---
    emit("items-loaded", 0);
    // ---------------------------------------------------------
  }
});

watch(
  () => props.endpoint,
  (newEndpoint, oldEndpoint) => {
    if (newEndpoint !== oldEndpoint && newEndpoint) {
      fetchProducts(newEndpoint);
    }
  }
);

const toggleFavorite = async (product) => {
  if (!authStore.isAuthenticated) {
    toast.error(t("product.toasts.must_login_favorites"));
    return;
  }
  try {
    const response = await api.post("favorites/add_or_remove/", {
      product_id: product.id,
    });
    await fetchFavorites();

    if (response.status === 201) {
      toast.success(t("product.toasts.fav_added"));
    } else if (response.status === 200) {
      toast.info(t("product.toasts.fav_removed"));
      // If we are on the favorites page, immediately remove the item from the grid.
      if (props.endpoint === "favorites") {
        productsFromApi.value = productsFromApi.value.filter(
          (p) => p.id !== product.id
        );
        // Update the count after removal
        emit("items-loaded", productsFromApi.value.length);
      }
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    if (error.response && error.response.status === 401) {
      toast.error(t("product.toasts.auth_failed"));
    } else {
      toast.error(t("product.toasts.fav_update_failed"));
    }
  }
};

const addToCart = async (product) => {
  isAdding.value = true;
  try {
    if (!authStore.isAuthenticated) {
      toast.error(t("product.toasts.must_login_add_to_cart"));
      return;
    }
    await cartStore.addItem(product.id, 1);
    toast.success(t("product.toasts.added_to_cart", { name: localizedField(product, 'name') }));
  } catch (error) {
    console.error("Error adding product to cart:", error);
    toast.error(t("product.toasts.add_failed"));
  } finally {
    isAdding.value = false;
  }
};
</script>

<style scoped>
/* Add the new class for the router-link */
.product-card-link {
  text-decoration: none;
  color: inherit;
}

/* Your existing styles... */
.product-grid-container {
  max-width: 99%;
  margin: 2rem auto;
}

.grid-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 1.5rem;
}

.grid-header h2 {
  font-size: 2rem;
  font-weight: bold;
}

.view-all {
  color: orange;
  font-weight: bold;
  text-decoration: none;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.loading-state,
.no-results {
  text-align: center;
  font-size: 1.2rem;
  color: #888;
  margin-top: 2rem;
}

/* Reused Product Card styles */
.product-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-image-container {
  position: relative;
  height: 250px;
  overflow: hidden;
  background-color: #f5f5f5;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ⭐ UPDATED SALE BADGE CSS START ⭐ */
.sale-badge {
  position: absolute;
  top: 10px; /* Adjusted position */
  left: 10px; /* Adjusted position */
  z-index: 5;
}

/* Style for the Sale image inside the badge */
.sale-image {
  width: 70px;
  height: auto;
}

/* Style for the text fallback (when no sale_badge_image is provided) */
.sale-badge {
  position: absolute;
  top: 0px;
  left: 1px;
  color: white;
  font-size: 3rem;
  font-weight: bold;
  border-radius: 10px;
}
/* ⭐ UPDATED SALE BADGE CSS END ⭐ */

.favorite-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 0.3rem;
  cursor: pointer;
}

.favorite-icon svg.filled {
  fill: #ff6347;
  stroke: #ff6347;
}

.card-content {
  padding: 0.8rem 1rem;
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-areas:
    "name colors"
    "desc desc"
    "dims dims"
    "rating rating"
    "price-section cart-btn";
  row-gap: 0.15rem;
  column-gap: 0.6rem;
}

.product-name {
  grid-area: name;
  font-weight: bold;
  font-size: 1.1rem;
  align-self: start;
  margin-bottom: 0;
}

.product-short-desc {
  grid-area: desc;
  color: #666;
  font-size: 0.9rem;
  margin-top: 0.1rem;
  margin-bottom: 0.1rem;
}

.product-dimensions {
  grid-area: dims;
  color: #888;
  font-size: 0.8rem;
  margin-top: 0;
  margin-bottom: 0.1rem;
}

.colors {
  grid-area: colors;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  align-self: start;
}

.color-circle {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid #ccc;
}

.rating {
  grid-area: rating;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.15rem;
}

.star {
  color: #ddd;
}

.star.filled {
  color: gold;
}

.rating-reviews {
  font-size: 0.8rem;
  color: #888;
}

.price-section {
  grid-area: price-section;
  display: flex;
  align-items: center;
  margin-top: 0.15rem;
}

.original-price {
  text-decoration: line-through;
  color: #888;
  font-size: 0.9rem;
  margin-right: 0.5rem;
}

.sale-price,
.regular-price {
  font-weight: bold;
  font-size: 1.2rem;
  color: black;
}

.add-to-cart-btn {
  grid-area: cart-btn;
  justify-self: end;
  background-color: #20b486;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  margin: 0;
}

.add-to-cart-btn svg {
  stroke: white;
}
</style>
