<template>
  <div>
    <Header />

    <main class="cart-page-content">
      <div class="cart-page-container">
        <div v-if="cartStore.isLoading" class="loading-state">
          <p>{{ $t("cart.loading") }}</p>
        </div>
        <div
          v-else-if="!cartStore.items || cartStore.items.length === 0"
          class="empty-cart-state"
        >
          <div class="empty-cart-image">
            <img src="../assets/4.png" :alt="$t('cart.empty.title')" />
          </div>
          <h3>{{ $t("cart.empty.title") }}</h3>
          <p>{{ $t("cart.empty.subtitle") }}</p>
          <router-link to="/" class="start-shopping-btn">{{
            $t("cart.start_shopping")
          }}</router-link>
        </div>
        <div v-else class="full-cart-state">
          <div class="main-cart-area">
            <h1>{{ $t("cart.page.title") }}</h1>
            <div class="cart-items-list">
              <div
                class="cart-item"
                v-for="item in cartStore.items"
                :key="item.id"
              >
                <template v-if="item.product">
                  <img
                    :src="item.product.image"
                    :alt="item.product.name"
                    class="product-thumbnail"
                  />
                  <div class="item-details">
                    <h4 class="product-name">{{ item.product.name }}</h4>
                    <p class="product-description">
                      {{ item.product.short_description }}
                    </p>
                    <div
                      class="product-colors"
                      v-if="
                        item.product.colors && item.product.colors.length > 0
                      "
                    >
                      <div
                        v-for="color in item.product.colors"
                        :key="color.hex_code"
                        class="color-circle"
                        :style="{ backgroundColor: color.hex_code }"
                      ></div>
                    </div>
                  </div>
                  <div class="quantity-controls">
                    <button
                      @click="decrementQuantity(item)"
                      class="quantity-btn"
                    >
                      -
                    </button>
                    <span class="item-quantity">{{ item.quantity }}</span>
                    <button
                      @click="incrementQuantity(item)"
                      class="quantity-btn"
                    >
                      +
                    </button>
                  </div>
                  <div class="item-price">
                    <span class="original-price" v-if="item.product.is_on_sale"
                      >{{
                        parseFloat(item.product.original_price).toFixed(2)
                      }}
                      EGP</span
                    >
                    <span class="sale-price" v-if="item.product.is_on_sale"
                      >{{
                        parseFloat(item.product.sale_price).toFixed(2)
                      }}
                      EGP</span
                    >
                    <span class="regular-price" v-else
                      >{{
                        parseFloat(item.product.original_price).toFixed(2)
                      }}
                      EGP</span
                    >
                  </div>
                  <button @click="removeItem(item.id)" class="remove-btn">
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
                      class="feather feather-trash-2"
                    >
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path
                        d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                      ></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                </template>
                <template v-else>
                  <p>{{ $t("cart.loading_product") }}</p>
                </template>
              </div>
            </div>
          </div>

          <div class="order-summary-container">
            <h3>{{ $t("cart.summary.title") }}</h3>
            <div class="summary-item">
              <span>{{ $t("cart.summary.subtotal") }}</span>
              <span class="price">{{ cartStore.cartTotal }} EGP</span>
            </div>
            <div class="summary-item">
              <span>{{ $t("cart.summary.shipping") }}</span>
              <span>{{ $t("cart.summary.shipping_help") }}</span>
            </div>
            <div class="coupon-code">
              <span>{{ $t("cart.summary.coupon") }}</span>
              <div class="coupon-input">
                <input
                  type="text"
                  :placeholder="$t('cart.summary.coupon_placeholder')"
                />
                <button class="apply-btn">
                  {{ $t("cart.summary.apply") }}
                </button>
              </div>
            </div>
            <div class="summary-item total-price">
              <span>{{ $t("cart.summary.total") }}</span>
              <span class="price">{{ cartStore.cartTotal }} EGP</span>
            </div>
            <button @click="goToCheckout" class="go-to-checkout-btn">
              {{ $t("cart.summary.checkout") }}
            </button>
          </div>
        </div>
      </div>
    </main>
    <ProductSlider :title="sliderTitle" :endpoint="sliderEndpoint" />
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import axios from "axios";
import { getApiUrl } from "@/config/api";
import { useCartStore } from "@/stores/Cart";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "vue-toastification";
import { useRouter } from "vue-router";
import Header from "@/components/header.vue";
import Footer from "@/components/Footer.vue";
import ProductSlider from "./ProductSlider.vue";

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();
const toast = useToast();
const { t } = useI18n();

const isLoggedIn = computed(() => authStore.isAuthenticated);
const hasFavorites = ref(false);

const sliderTitle = computed(() => {
  if (isLoggedIn.value && hasFavorites.value) {
    return t('slider.favorites_title');
  }
  return t('slider.sale_title');
});

const sliderEndpoint = computed(() => {
  if (isLoggedIn.value && hasFavorites.value) {
    return "favorites/";
  }
  return "products/?is_on_sale=true";
});

const fetchLoginStatusAndFavorites = async () => {
  if (isLoggedIn.value) {
    try {
      const response = await axios.get(getApiUrl("favorites/"), {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      });
      hasFavorites.value = response.data.length > 0;
    } catch (error) {
      console.error("Error fetching favorites:", error);
      hasFavorites.value = false;
    }
  } else {
    hasFavorites.value = false;
  }
};

// Functions to call the store's actions
const incrementQuantity = (item) => {
  console.debug('[CartPage] increment clicked', { itemId: item.id, productId: item.product && item.product.id, currentQty: item.quantity });
  if (authStore.isAuthenticated) {
    cartStore
      .updateItemQuantity(item.id, item.quantity + 1)
      .then(() => {
        toast.success(t("cart.toasts.quantity_updated"));
      })
      .catch((error) => {
        console.error("Error updating quantity:", error);
        toast.error(t("cart.toasts.update_failed"));
      });
  } else {
    toast.error(t("cart.toasts.must_login_modify"));
  }
};

const decrementQuantity = (item) => {
  console.debug('[CartPage] decrement clicked', { itemId: item.id, productId: item.product && item.product.id, currentQty: item.quantity });
  if (authStore.isAuthenticated) {
    if (item.quantity - 1 < 1) {
      removeItem(item.id);
    } else {
      cartStore
        .updateItemQuantity(item.id, item.quantity - 1)
        .then(() => {
          toast.success(t("cart.toasts.quantity_updated"));
        })
        .catch((error) => {
          console.error("Error updating quantity:", error);
          toast.error(t("cart.toasts.update_failed"));
        });
    }
  } else {
    toast.error(t("cart.toasts.must_login_modify"));
  }
};

const removeItem = async (itemId) => {
  console.debug('[CartPage] remove clicked', { itemId });
  try {
    if (!authStore.isAuthenticated) {
      toast.error(t("cart.toasts.must_login_remove"));
      return;
    }
    await cartStore.removeItem(itemId);
    toast.success(t("cart.toasts.removed"));
  } catch (error) {
    console.error("Error removing item from cart:", error);
    toast.error(t("cart.toasts.remove_failed"));
  }
};

const goToCheckout = () => {
  if (!cartStore.items || cartStore.items.length === 0) {
    toast.info(t("cart.toasts.empty_before_checkout"));
    return;
  }
  router.push({ name: "CheckoutPage" });
};

onMounted(() => {
  // Fetch cart data from the server when the component is mounted
  cartStore.fetchCart();
  fetchLoginStatusAndFavorites();
});
</script>

<style scoped>
/* Your existing styles for the CartPage */
.cart-page-content {
  padding: 2rem 0;
}

.cart-page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  gap: 2rem;
}

.loading-state,
.empty-cart-state {
  text-align: center;
  padding: 4rem 0;
  width: 100%;
}

.empty-cart-image img {
  width: 200px;
  height: auto;
  margin-bottom: 1rem;
}

.start-shopping-btn {
  display: inline-block;
  margin-top: 1.5rem;
  padding: 0.8rem 2rem;
  background-color: #20b486;
  color: white;
  border: none;
  border-radius: 50px;
  text-decoration: none;
  font-size: 1.1rem;
  transition: background-color 0.2s;
}

.start-shopping-btn:hover {
  background-color: #1a9c72;
}

.full-cart-state {
  display: flex;
  gap: 2rem;
  width: 100%;
}

.main-cart-area {
  flex: 2;
}

.main-cart-area h1 {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
}

.cart-items-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  gap: 1.5rem;
  transition: box-shadow 0.2s;
}

.cart-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.product-thumbnail {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
}

.item-details {
  flex-grow: 1;
}

.product-name {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.product-description {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

.product-colors {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.color-circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid #ccc;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quantity-btn {
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
}

.quantity-btn:hover {
  background-color: #e0e0e0;
}

.item-quantity {
  font-size: 1rem;
  font-weight: bold;
  min-width: 25px;
  text-align: center;
}

.item-price {
  margin-left: auto;
  text-align: right;
  min-width: 100px;
}

.original-price {
  text-decoration: line-through;
  color: #888;
  font-size: 1rem;
}

.sale-price,
.regular-price {
  font-weight: bold;
  font-size: 1.3rem;
  color: #20b486;
}

.remove-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #e74c3c;
  transition: color 0.2s;
  flex-shrink: 0;
  margin-left: 1rem;
}

.remove-btn:hover {
  color: #c0392b;
}

.order-summary-container {
  flex: 1;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: fit-content;
}

.order-summary-container h3 {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  font-size: 1rem;
}

.summary-item.total-price {
  font-size: 1.5rem;
  font-weight: bold;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
}

.coupon-code {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.coupon-code span {
  font-weight: bold;
}

.coupon-input {
  display: flex;
  gap: 0.5rem;
}

.coupon-input input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
}

.apply-btn {
  padding: 0.5rem 1rem;
  background-color: #f7931e;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.apply-btn:hover {
  background-color: #d67a0f;
}

.go-to-checkout-btn {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #20b486;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;
}

.go-to-checkout-btn:hover {
  background-color: #1a9c72;
}
</style>
