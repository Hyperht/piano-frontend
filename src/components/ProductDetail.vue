<template>
  <div class="product-page-wrapper">
    <Header />
    
    <div class="product-page-container" v-if="product && product.id && !loading">
      <nav class="breadcrumbs">
        <router-link to="/">{{ $t("product.breadcrumb_home") }}</router-link>
        <span v-if="product.category">></span>
        <router-link
          v-if="product.category"
          :to="{
            name: 'CategoryPage',
            params: { categoryName: slugify(product.category.name || product.category) }
          }"
        >{{ product.category.name }}</router-link>
        <span v-if="product.subcategory">></span>
        <router-link
          v-if="product.subcategory"
          :to="{
            name: 'SubCategoryPage',
            params: {
              categoryName: slugify(product.category.name || product.category),
              subCategoryName: slugify(product.subcategory.name || product.subcategory)
            }
          }"
        >{{ product.subcategory.name }}</router-link>
        <span>></span>
        <span>{{ product.name }}</span>
      </nav>

      <div class="product-details-main">
        <div class="product-images">
          <div class="thumbnail-gallery" v-if="hasImages">
            <img
              v-if="product.image"
              :src="product.image"
              :alt="product.name"
              :class="{ active: activeImage === product.image }"
              @click="activeImage = product.image"
            />
            <img
              v-for="(img, index) in filteredImages"
              :key="index"
              :src="img.image"
              :alt="img.alt_text || product.name"
              :class="{ active: activeImage === img.image }"
              @click="activeImage = img.image"
            />
          </div>
          <div class="main-image">
            <img :src="activeImage || product.image" :alt="displayName" />
          </div>
        </div>

        <div class="product-info">
          <h1 class="product-name">{{ displayName }}</h1>
          <p class="product-subtitle">{{ displayShortDescription }}</p>

          <div class="product-rating">
            <span
              v-for="n in 5"
              :key="n"
              class="star"
              :class="{ filled: n <= Math.round(product.rating || 0) }"
              >&#9733;</span
            >
            <span class="reviews-count">
              ({{ product.reviews ? product.reviews.length : 0 }} {{ $t("product.reviews_count") }})
            </span>
          </div>

          <div class="product-price">
            <span v-if="product.is_on_sale" class="original-price">
              ${{ Number(product.original_price).toFixed(2) }}
            </span>
            <span class="sale-price" :class="{ 'no-sale': !product.is_on_sale }">
              ${{ Number(currentPrice).toFixed(2) }}
            </span>
            <span v-if="product.is_on_sale" class="save-info">
              {{ $t('product.price_saved', { amount: formattedSaved }) }}
            </span>
          </div>




          <div class="color-selector" v-if="true">
            <p>{{ t("product.choose_color") }}</p>
            <div class="color-options">
              <div
                v-for="colorOption in product.colors"
                :key="colorOption.name"
                class="color-option"
                :class="{ selected: selectedColor && selectedColor.hex_code === colorOption.hex_code }"
                @click="selectedColor = colorOption"
              >
                <div
                  class="color-circle"
                  :style="{ backgroundColor: colorOption.hex_code }"
                  :title="colorOption.name"
                ></div>
              </div>
            </div>
          </div>

          <div class="quantity-selector">
            <button @click="changeQuantity(-1)" :disabled="quantity === 1" :aria-label="$t('product.quantity_decrease')">-</button>
            <span>{{ quantity }}</span>
            <button @click="changeQuantity(1)" :aria-label="$t('product.quantity_increase')">+</button>
          </div>

          <div class="action-buttons">
            <button @click="addToCart" class="add-to-cart-btn">
              {{ $t("product.button_add_to_cart") }}
            </button>
            <button
              @click="toggleFavorite"
              class="favorite-btn"
              :class="{ favorited: product.is_favorited }"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div class="product-tabs">
        <div class="tab-headers">
          <button :class="{ active: activeTab === 'description' }" @click="activeTab = 'description'">
            {{ $t("product.tab_description") }}
          </button>
          <button :class="{ active: activeTab === 'measurements' }" @click="activeTab = 'measurements'">
            {{ $t("product.tab_measurements") }}
          </button>
          <button :class="{ active: activeTab === 'reviews' }" @click="activeTab = 'reviews'">
            {{ $t("product.tab_reviews") }}
          </button>
        </div>
        <div class="tab-content">
          <div v-if="activeTab === 'description'">
            <p>{{ displayDescription || $t('product.no_description') }}</p>
          </div>
          <div v-if="activeTab === 'measurements'">
            <p>{{ $t("product.dimensions_prefix") }} {{ displayDimensions || $t('product.na') }}</p>
          </div>
          <div v-if="activeTab === 'reviews'">
            <div class="reviews-list">
                <div v-if="product.reviews && product.reviews.length > 0">
                  <div v-for="review in product.reviews" :key="review.id" class="review-item">
                     <div class="review-header">
                        <span class="review-user">{{ review.user }}</span>
                        <div class="review-rating">
                           <span v-for="n in 5" :key="n" class="star" :class="{ filled: n <= review.rating }">&#9733;</span>
                        </div>
                     </div>
                     <p class="review-comment">{{ review.comment }}</p>
                  </div>
                </div>
                <p v-else>{{$t("product.no_reviews") }}</p>

                <!-- Add review section -->
                <div class="add-review-section" style="margin-top:1.5rem;">
                  <div v-if="authStore.isAuthenticated">
                    <h4>{{ $t('product.review_write_title') }}</h4>
                    <div class="review-form">
                      <label>{{ $t('product.review_label_rating') }}</label>
                      <div class="rating-stars" style="margin:0.5rem 0 1rem 0;">
                        <span v-for="n in 5" :key="n" class="star" :class="{ filled: n <= newReviewRating }" @click="newReviewRating = n">&#9733;</span>
                      </div>

                      <label>{{ $t('product.review_label_comment') }}</label>
                      <textarea v-model="newReviewComment" rows="4" :placeholder="t('product.review_label_comment')"></textarea>

                      <div style="margin-top:1rem;">
                        <button class="submit-review-btn" @click="submitReview" :disabled="submittingReview">
                          {{ $t('product.review_submit_button') }}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div v-else class="login-prompt" style="margin-top:1rem;">
                    <p>
                      {{ $t('product.login_to_review') }}
                      <router-link to="/login">{{ $t('product.login_link') }}</router-link>
                      {{ $t('product.login_to_review_suffix') }}
                    </p>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="loading" class="loading-state">
      <p>{{ $t("product.loading") }}</p>
    </div>
    <div v-else class="error-state">
      <p>{{ $t("product.error_not_found") }}</p>
    </div>
    <Footer />
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { getApiUrl } from "@/config/api";
import Header from "./header.vue";
import Footer from "./Footer.vue";
import { useAuthStore } from "../stores/auth";
import { useCartStore } from "../stores/Cart";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();
const toast = useToast();
const { t, locale } = useI18n();

// Helper to pick a localized field (handles { en: '', ar: '' } shapes or name_en / name_ar)
// Also looks up `products.{slug}.{field}` in locale files as a frontend override.
const slugify = (s) =>
  (s || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");

const localizedValue = (obj, field) => {
  if (!obj) return "";
  const value = obj[field];
  // If server returned an object with locales
  if (value && typeof value === "object") {
    return value[locale.value] || value.en || Object.values(value)[0] || "";
  }

  // Support field_en / field_ar variants
  const short = locale.value ? locale.value.split("-")[0] : "en";
  const candidate = `${field}_${short}`;
  if (obj[candidate]) return obj[candidate];

  // As a last resort, try a frontend translations override: products.{slug}.{field}
  const base = (obj.name || "").toString();
  if (base) {
    const slug = slugify(base);
    const key = `products.${slug}.${field}`;
    const translated = t(key);
    if (translated && translated !== key) return translated;
  }

  return value || obj[field] || "";
};

const displayName = computed(() => localizedValue(product.value, "name") || "");
const displayShortDescription = computed(() => localizedValue(product.value, "short_description") || "");
const displayDescription = computed(() => localizedValue(product.value, "description") || "");
const displayDimensions = computed(() => localizedValue(product.value, "dimensions") || "");

// Currency formatting for saved amount (frontend-only fallback)
const formatCurrency = (value) => {
  const amount = Number(value || 0);
  try {
    const region = locale.value === "ar" ? "ar-EG" : "en-US";
    return new Intl.NumberFormat(region, { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(amount);
  } catch (e) {
    return `$${amount.toFixed(2)}`;
  }
};

const savedAmount = computed(() => {
  if (!product.value || !product.value.is_on_sale) return 0;
  return Number(product.value.original_price || 0) - Number(product.value.sale_price || 0);
});

const formattedSaved = computed(() => formatCurrency(savedAmount.value));

const product = ref(null);
const loading = ref(true);
const activeImage = ref("");
const selectedColor = ref(null);
const quantity = ref(1);
const activeTab = ref("description");

const hasImages = computed(() => {
  return product.value && (product.value.image || (product.value.gallery_images && product.value.gallery_images.length > 0));
});

const currentPrice = computed(() => {
  if (!product.value) return 0;
  return product.value.is_on_sale ? product.value.sale_price : product.value.original_price;
});

const filteredImages = computed(() => {
  if (!product.value || !product.value.gallery_images || !selectedColor.value) return [];
  return product.value.gallery_images.filter(img => img.color_hex === selectedColor.value.hex_code);
});

const fetchProduct = async (id) => {
  loading.value = true;
  try {
    const token = authStore.token;
    // Note: Use getApiUrl specifically ensuring it matches your Django port (8000)
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    const response = await axios.get(getApiUrl(`products/${id}/`), { headers });
    product.value = response.data;

    // Initialize defaults
    if (product.value.colors && product.value.colors.length > 0) {
      selectedColor.value = product.value.colors[0];
    }
    activeImage.value = product.value.image;
    
    await fetchReviews(id);
  } catch (error) {
    console.error("Error fetching product:", error);
    product.value = null;
  } finally {
    loading.value = false;
  }
};

const fetchReviews = async (productId) => {
  try {
    const response = await axios.get(getApiUrl(`products/${productId}/reviews/`));
    if (product.value) product.value.reviews = response.data;
  } catch (error) {
    console.error("Error fetching reviews:", error);
  }
};

const changeQuantity = (delta) => {
  if (quantity.value + delta > 0) quantity.value += delta;
};

// --- Review form state & submit handler ---
const newReviewRating = ref(0);
const newReviewComment = ref("");
const submittingReview = ref(false);

const submitReview = async () => {
  if (!authStore.isAuthenticated) {
    toast.error(t('product.toast_review_login_required'));
    router.push({ name: 'Login' });
    return;
  }

  if (!newReviewRating.value || !newReviewComment.value.trim()) {
    toast.error(t('product.toast_review_required'));
    return;
  }

  submittingReview.value = true;
  try {
    const token = authStore.token && (authStore.token.value || authStore.token);
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.post(
      getApiUrl(`products/${route.params.id}/reviews/`),
      {
        rating: newReviewRating.value,
        comment: newReviewComment.value.trim(),
      },
      { headers }
    );

    // Refresh reviews list and clear the form
    await fetchReviews(route.params.id);
    newReviewRating.value = 0;
    newReviewComment.value = "";
    toast.success(t('product.toast_review_success'));
  } catch (err) {
    console.error('Error submitting review:', err);
    toast.error(t('product.toast_review_failed'));
  } finally {
    submittingReview.value = false;
  }
};

// Toggle image when color changes
watch(selectedColor, (newColor) => {
  if (newColor && filteredImages.value.length > 0) {
    activeImage.value = filteredImages.value[0].image;
  }
});

watch(() => route.params.id, (newId) => {
  if (newId) fetchProduct(newId);
}, { immediate: true });

// Watch locale changes and re-fetch product data for updated translations
watch(locale, (newLocale, oldLocale) => {
  if (route.params.id) fetchProduct(route.params.id);
});

onMounted(() => {
  // Initialization complete
});

// --- Add to Cart handler (ProductSlider style) ---
const addToCart = async () => {
  if (!authStore.isAuthenticated) {
    toast.error(t('auth.login_required_cart'));
    router.push({ name: 'Login' });
    return;
  }
  if (!product.value) {
    toast.error(t('cart.add_to_cart_failure'));
    return;
  }
  try {
    await cartStore.addItem(product.value.id, quantity.value);
    toast.success(t('cart.added_to_cart_success', { productName: displayName.value }));
  } catch (error) {
    console.error('Error adding product to cart:', error);
    toast.error(t('cart.add_to_cart_failure'));
  }
};

// --- Toggle Favorite handler (ProductSlider style) ---
const toggleFavorite = async () => {
  if (!authStore.isAuthenticated) {
    toast.error(t('auth.login_required_favorites'));
    router.push({ name: 'Login' });
    return;
  }
  if (!product.value) return;
  try {
    // Assume you have an API method similar to ProductSlider
    const response = await axios.post(getApiUrl('favorites/add_or_remove/'), {
      product_id: product.value.id,
    });
    // Update local state
    product.value.is_favorited = !product.value.is_favorited;
    if (response.status === 201) {
      toast.success(t('product.added_to_favorites'));
    } else if (response.status === 200) {
      toast.info(t('product.removed_from_favorites'));
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    if (error.response && error.response.status === 401) {
      toast.error(t('auth.authentication_failed'));
    } else {
      toast.error(t('product.failed_to_update_favorites'));
    }
  }
};
</script>

<style scoped>
/* Keep your existing CSS, but ensure .star.filled is gold */
.star.filled {
  color: #ffc107 !important;
}
/* ... rest of your styles ... */

/* Product Page Container */
.product-page-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 2rem;
  font-family: Arial, sans-serif;
  color: #333;
}

/* Breadcrumbs */
.breadcrumbs {
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  color: #666;
}

.breadcrumbs a {
  color: #666;
  text-decoration: none;
}

.breadcrumbs a:hover {
  text-decoration: underline;
}

.breadcrumbs span {
  margin: 0 0.5rem;
}

/* Main Product Details Layout */
.product-details-main {
  display: flex;
  gap: 3rem;
  margin-bottom: 3rem;
}

/* Image Section */
.product-images {
  display: flex;
  gap: 1.5rem;
  width: 50%;
}

.thumbnail-gallery {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.thumbnail-gallery img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border: 1px solid #eee;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.thumbnail-gallery img.active {
  border-color: #007bff;
  box-shadow: 0 0 0 2px #007bff;
}

.main-image {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #eee;
  border-radius: 4px;
  overflow: hidden;
}

.main-image img {
  max-width: 100%;
  max-height: 500px;
  object-fit: contain;
}

/* Product Info Section */
.product-info {
  width: 50%;
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #222;
}

.product-subtitle {
  font-size: 1.1rem;
  color: #555;
  margin-bottom: 1rem;
}

.product-rating {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.product-rating .star {
  color: #ddd; /* FIX: Default color for unfilled stars */
  font-size: 1.3rem;
  margin-right: 2px;
}

.product-rating .star.filled {
  color: gold; /* FIX: Filled stars get the gold color */
}

.reviews-count {
  font-size: 0.9rem;
  color: #777;
  margin-left: 0.5rem;
}

.product-price {
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.product-price .original-price {
  font-size: 1.2rem;
  color: #999;
  text-decoration: line-through;
}

.product-price .sale-price {
  font-size: 2rem;
  font-weight: 700;
  color: #d9534f;
}

.product-price .sale-price.no-sale {
  color: black;
}

.product-price .save-info {
  background-color: #dff0d8;
  color: #3c763d;
  padding: 0.4rem 0.8rem;
  border-radius: 5px;
  font-size: 0.9rem;
  font-weight: 600;
}

.color-selector {
  margin-bottom: 1.5rem;
}

.color-selector p {
  font-weight: 600;
  margin-bottom: 0.8rem;
}

.color-options {
  display: flex;
  gap: 0.75rem;
}

.color-option {
  width: 40px;
  height: 40px;
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
  width: 32px;
  height: 32px;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.quantity-selector button {
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 40px;
  height: 40px;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

.quantity-selector button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.quantity-selector span {
  font-size: 1.2rem;
  font-weight: 600;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.add-to-cart-btn {
  background-color: #28a745;
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 5px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  flex-grow: 1;
}

.add-to-cart-btn:hover {
  background-color: #218838;
}

.favorite-btn {
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 60px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: #666;
}

.favorite-btn:hover {
  background-color: #e0e0e0;
}

.favorite-btn.favorited {
  color: #d9534f;
  border-color: #d9534f;
  background-color: #ffebeb;
}

.share-options {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.9rem;
  color: #666;
}

.social-icons {
  display: flex;
  gap: 0.75rem;
}

.social-icon {
  width: 30px;
  height: 30px;
  background-color: #eee;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #666;
  font-size: 1rem;
  text-decoration: none;
}

/* Product Tabs Section */
.product-tabs {
  margin-bottom: 3rem;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}

.tab-headers {
  display: flex;
  border-bottom: 1px solid #eee;
}

.tab-headers button {
  flex: 1;
  padding: 1rem 1.5rem;
  background-color: #f8f8f8;
  border: none;
  border-right: 1px solid #eee;
  font-size: 1.1rem;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-headers button:last-child {
  border-right: none;
}

.tab-headers button.active {
  background-color: white;
  color: #007bff;
  border-bottom: 2px solid #007bff;
}

.tab-content {
  padding: 2rem;
  background-color: white;
}

.tab-content p {
  margin-bottom: 1rem;
  line-height: 1.6;
}

.tab-content .description-list {
  list-style: none;
  padding: 0;
}

.tab-content .description-list li {
  margin-bottom: 0.5rem;
  color: #555;
}

.tab-content .description-list li span {
  font-weight: 600;
  margin-right: 0.5rem;
  color: #333;
}

/* Review Section Styles */
.reviews-list {
  margin-bottom: 2rem;
}

.review-item {
  border-bottom: 1px solid #eee;
  padding-bottom: 1.5rem;
  margin-bottom: 1.5rem;
}

.review-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.review-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.review-user {
  font-weight: bold;
  margin-right: 1rem;
  color: #222;
}

.review-rating .star {
  color: #ddd; /* FIX: Default color for unfilled stars */
  font-size: 1.1rem;
  margin-right: 2px;
}

.review-rating .star.filled {
  color: gold; /* FIX: Filled stars get the gold color */
}

.review-comment {
  line-height: 1.6;
  color: #444;
}

.review-date {
  font-size: 0.8rem;
  color: #999;
  margin-top: 0.5rem;
}

.add-review-section h4 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #333;
}

.review-form .form-group {
  margin-bottom: 1rem;
}

.review-form label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.review-form textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-family: inherit;
  font-size: 1rem;
}

.review-form .rating-stars .star {
  font-size: 1.5rem;
  cursor: pointer;
  color: #ddd; /* FIX: Default color for unfilled stars */
  transition: color 0.2s ease;
}

.review-form .rating-stars .star.filled {
  color: gold; /* FIX: Filled stars get the gold color */
}

.submit-review-btn {
  background-color: #007bff;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.submit-review-btn:hover {
  background-color: #0056b3;
}

.login-prompt {
  background-color: #f8f9fa;
  border-left: 4px solid #007bff;
  padding: 1rem;
  margin-top: 2rem;
}

.login-prompt p {
  margin: 0;
}

/* Loading and Error States */
.loading-state,
.error-state {
  text-align: center;
  font-size: 1.5rem;
  color: #888;
  margin-top: 5rem;
}

</style>