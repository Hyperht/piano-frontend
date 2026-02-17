<template>
  <div class="product-slider-container">
    <div class="slider-header" v-if="title">
      <h2>{{ title }}</h2> 
      <a href="#" class="view-all" @click.prevent="viewAllProducts">{{ t('product.view_all') }}</a>
    </div>

    <div class="products-wrapper">
      <button class="nav-button prev-button" @click="scrollSlider('left')">
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
          class="feather feather-chevron-left"
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <div class="products-slider" ref="slider">
        <router-link
          v-for="product in products"
          :key="product.id"
          :to="{ name: 'Product', params: { id: product.id } }"
          class="product-card-link"
        >
          <div class="product-card">
            <div class="card-image-container">
              <img
                :src="product.image"
                :alt="product.name"
                class="product-image"
              />
              <div class="sale-badge" v-if="product.is_on_sale">
                <img :src="activeSaleImg" :alt="t('product.sale_badge_alt')" class="sale-image" />
              </div>
              <div
                class="favorite-icon"
                @click.prevent="toggleFavorite(product)"
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
                  class="feather feather-heart"
                  :class="{ filled: product.is_favorite }"
                >
                  <path
                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                  ></path>
                </svg>
              </div>
            </div>

            <div class="card-content">
              <h3 class="product-name">{{ product.name }}</h3>
              <p class="product-short-desc">{{ product.short_description }}</p>
              <p class="product-dimensions">{{ product.dimensions }}</p>

              <div class="colors">
                <div
                  v-for="color in product.colors"
                  :key="color.hex_code"
                  class="color-circle"
                  :style="{ backgroundColor: color.hex_code }"
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

      <button class="nav-button next-button" @click="scrollSlider('right')">
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
          class="feather feather-chevron-right"
        >
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import axios from "axios";
import api from "@/config/api";
import { useToast } from "vue-toastification";
import { useCartStore } from "@/stores/Cart";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n"; // <-- NEW IMPORT

const { t } = useI18n(); // <-- NEW SETUP
import activeSaleImg from "@/assets/active_sale.png";

const props = defineProps({
  title: {
    type: String,
    required: false,
  },
  endpoint: {
    type: String,
    required: true,
  },
});

const products = ref([]);
const slider = ref(null);
const isAdding = ref(false);
const toast = useToast();
import { API_CONFIG, getApiUrl } from "@/config/api";
const API_URL = API_CONFIG.BASE_URL + "/";

const cartStore = useCartStore();
const authStore = useAuthStore();
const router = useRouter();

const favoriteProductIds = ref(new Set());

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

const { locale } = useI18n();
const getLocalized = (obj, field) => {
  if (!obj) return "";
  const value = obj[field];
  if (value && typeof value === "object") {
    return value[locale.value] || value.en || Object.values(value)[0] || "";
  }
  // Support field_en / field_ar variants
  const short = locale.value ? locale.value.split("-")[0] : "en";
  const candidate = `${field}_${short}`;
  if (obj[candidate]) return obj[candidate];
  return value || obj[field] || "";
};

const fetchProducts = async () => {
  try {
    await fetchFavorites();

    const token = authStore.token && (authStore.token.value || authStore.token);
    // Use API client which sets Authorization header via interceptor
    const response = await api.get(props.endpoint);

    let fetchedProducts = [];
    if (props.endpoint === "favorites/") {
      fetchedProducts = response.data.map(
        (favoriteItem) => favoriteItem.product
      );
    } else {
      fetchedProducts = response.data;
    }

    products.value = fetchedProducts.map((product) => ({
      ...product,
      name: getLocalized(product, "name"),
      short_description: getLocalized(product, "short_description"),
      dimensions: getLocalized(product, "dimensions"),
      is_favorite: favoriteProductIds.value.has(product.id),
    }));
  } catch (error) {
    console.error(`Error fetching products from ${props.endpoint}:`, error);
    products.value = [];
  }
};


onMounted(() => {
  fetchProducts();
});

// Watch locale changes and re-fetch products for updated translations
watch(() => locale.value, (newLocale, oldLocale) => {
  fetchProducts();
});

watch(
  () => props.endpoint,
  (newEndpoint) => {
    fetchProducts();
  }
);

const viewAllProducts = () => {
  const parts = props.endpoint.split("?");
  const path = parts[0].replace("products/", "").replace("/", "") || "search";

  let query = {};
  if (parts.length > 1) {
    const params = new URLSearchParams(parts[1]);
    params.forEach((value, key) => {
      query[key] = value;
    });
  }

  router.push({
    name: "Search",
    query: query,
  });
};

const toggleFavorite = async (product) => {
  if (!authStore.isAuthenticated) {
    // UPDATED: Translatable toast error message
    toast.error(t('auth.login_required_favorites')); 
    return;
  }
  try {
    const response = await api.post("favorites/add_or_remove/", {
      product_id: product.id,
    });
    await fetchProducts();
    if (response.status === 201) {
      // UPDATED: Translatable toast success message
      toast.success(t('product.added_to_favorites')); 
    } else if (response.status === 200) {
      // UPDATED: Translatable toast info message
      toast.info(t('product.removed_from_favorites')); 
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    if (error.response && error.response.status === 401) {
      // UPDATED: Translatable toast error message
      toast.error(t('auth.authentication_failed')); 
    } else {
      // UPDATED: Translatable toast error message
      toast.error(t('product.failed_to_update_favorites')); 
    }
  }
};

const addToCart = async (product) => {
  isAdding.value = true;
  try {
    if (!authStore.isAuthenticated) {
      // UPDATED: Translatable toast error message
      toast.error(t('auth.login_required_cart')); 
      return;
    }
    await cartStore.addItem(product.id, 1);
    // UPDATED: Translatable toast success message with interpolation
    toast.success(t('cart.added_to_cart_success', { productName: product.name })); 
  } catch (error) {
    console.error("Error adding product to cart:", error);
    // UPDATED: Translatable toast error message
    toast.error(t('cart.add_to_cart_failure')); 
  } finally {
    isAdding.value = false;
  }
};

const scrollSlider = (direction) => {
  if (!slider.value) return;
  
  const isMobile = window.innerWidth <= 640;
  
  if (isMobile) {
    const scrollAmount = slider.value.clientWidth;
    if (direction === "left") {
      slider.value.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else {
      slider.value.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  } else {
    // Desktop logic
    const cardWidth = slider.value.querySelector(".product-card")?.offsetWidth || 280;
    const gap = 24; // 1.5rem
    const itemsPerView = 4;
    const scrollAmount = (cardWidth + gap) * itemsPerView;
    
    if (direction === "left") {
      slider.value.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else {
      slider.value.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  }
};
</script>

<style scoped>
.favorite-icon svg.filled {
  fill: #ff6347;
  stroke: #ff6347;
}

.product-slider-container {
  max-width: 99%;
  margin: 2rem auto;
  position: relative;
}

.slider-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 1.5rem;
}

.slider-header h2 {
  font-size: 2rem;
  font-weight: bold;
}

.view-all {
  color: orange;
  font-weight: bold;
  text-decoration: none;
}

.products-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.products-slider {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  gap: 1.5rem;
  padding-bottom: 1rem;
  -ms-overflow-style: none;
  scrollbar-width: none;
  max-width: 100%;
  padding-left: 0;
  padding-right: 0;
}

.products-slider::-webkit-scrollbar {
  display: none;
}

.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.prev-button {
  left: 0;
}

.next-button {
  right: 0;
}

.product-card-link {
  text-decoration: none;
  color: inherit;
  display: block;
  flex: 0 0 auto; /* Changed from flex: 1 to ensure width is respected */
  width: 280px; /* Fixed width for desktop/tablet */
  scroll-snap-align: start;
}

@media (max-width: 640px) {
  .product-card-link {
    width: calc(100% - 24px); /* Show 1 item minus gap (gap is 1.5rem = 24px) */
    margin-right: 0; /* Align with scroll snap */
  }
}
.product-card-link {
  min-height: 410px;
}

.product-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
  height: 100%;
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

.sale-badge {
  position: absolute;
  top: 0px;
  left: 0px;
  z-index: 5;
}

.sale-image {
  width: 70px;
  height: auto;
}

.favorite-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 0.3rem;
  cursor: pointer;
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