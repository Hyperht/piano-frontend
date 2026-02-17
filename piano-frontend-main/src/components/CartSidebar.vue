<template>
  <transition name="slide-fade">
    <div class="cart-sidebar-container" v-if="isOpen">
      <div class="cart-header">
        <h2>{{ $t("cart.sidebar.title") }}</h2>
        <div class="go-to-cart-container">
          <router-link
            to="/cart"
            class="go-to-cart-btn"
            @click="closeSidebar"
            >
            {{ $t("cart.sidebar.go_to_cart") }}
          </router-link>
        </div>
        <button @click="closeSidebar" class="close-btn">&times;</button>
      </div>
      <div class="cart-content">
        <div v-if="cartStore && authStore">
          <div v-if="cartStore.isLoading" class="loading-state">
            <p>{{ $t("cart.loading") }}</p>
          </div>
          <div
            v-else-if="!cartStore.items || cartStore.items.length === 0"
            class="empty-cart-state"
          >
            <div class="empty-cart-image">
              <img src="..\assets\4.png" :alt="$t('cart.empty.title')" />
            </div>
            <h3>{{ $t("cart.empty.title") }}</h3>
            <p>{{ $t("cart.empty.subtitle") }}</p>
          </div>
          <div v-else class="full-cart-state">
            <div class="cart-summary">
              <span>{{ $t("cart.sidebar.items_prefix") }} {{ cartStore.items.length }}</span>
              <span class="cart-total">{{ cartStore.cartTotal }} EGP</span>
            </div>
            <div class="cart-items-list">
              <div
                class="cart-item"
                v-for="item in cartStore.items"
                :key="item.id"
              >
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
                  <div class="product-colors">
                    <div
                      v-for="color in item.product.colors"
                      :key="color.hex_code"
                      class="color-circle"
                      :style="{ backgroundColor: color.hex_code }"
                    ></div>
                  </div>
                  <div class="item-price-and-quantity">
                    <span class="original-price" v-if="item.product.is_on_sale"
                      >{{ item.product.original_price }} EGP</span
                    >
                    <span class="sale-price" v-if="item.product.is_on_sale"
                      >{{ item.product.sale_price }} EGP</span
                    >
                    <span class="regular-price" v-else
                      >{{ item.product.original_price }} EGP</span
                    >
                    <span>{{ $t("cart.sidebar.quantity_prefix") }} {{ item.quantity }}</span>
                  </div>
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import axios from "axios";
import { getApiUrl } from "@/config/api";
import { useCartStore } from "@/stores/Cart";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "vue-toastification";

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["close"]);
const toast = useToast();
const { t } = useI18n(); // Initialized for translations

const cartStore = useCartStore();
const authStore = useAuthStore();

const closeSidebar = () => {
  emit("close");
};

const removeItem = async (itemId) => {
  try {
    if (!authStore.isAuthenticated) {
      // 💥 Translated toast message
      toast.error(t("cart.toasts.must_login_remove"));
      return;
    }

    // 🎯 CRITICAL FIX: Add the slash (/) before the item ID to create the correct URL path:
    const deleteUrl = `${getApiUrl("cart-items")}/${itemId}/`;

    // 2. Use axios.delete with the correct URL.
    await axios.delete(deleteUrl, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });

    // 💥 Translated toast message
    toast.success(t("cart.toasts.removed"));
    await cartStore.fetchCart();
  } catch (error) {
    console.error("Error removing item from cart:", error);
    // 💥 Translated toast message
    toast.error(t("cart.toasts.remove_failed"));
  }
};

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      cartStore.fetchCart();
    }
  }
);
</script>

<style scoped>
.cart-sidebar-container {
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  width: 400px;
  background-color: white;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.cart-header h2 {
  font-size: 1.5rem;
  flex-grow: 1;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
}

.cart-content {
  flex-grow: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.empty-cart-state {
  text-align: center;
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
}

.empty-cart-image img {
  width: 150px;
  height: auto;
}

.full-cart-state {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.cart-summary {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-weight: bold;
}

.cart-items-list {
  flex-grow: 1;
  overflow-y: auto;
}

.cart-item {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.product-thumbnail {
  width: 90px;
  height: 90px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

.item-details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.product-name {
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}

.product-description {
  color: #666;
  font-size: 0.9rem;
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.product-colors {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.color-circle {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid #ccc;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.1);
}

.item-price-and-quantity {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.original-price {
  text-decoration: line-through;
  color: #888;
  font-size: 0.9rem;
}

.sale-price,
.regular-price {
  font-weight: bold;
  font-size: 1rem;
}

.remove-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  transition: color 0.2s;
  flex-shrink: 0;
}

.remove-btn:hover {
  color: #e74c3c;
}



.go-to-cart-btn {
  background-color: #20b486;
  color: white;
  border: none;
  border-radius: 50px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.go-to-cart-btn:hover {
  background-color: #1a9c72;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.5s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(400px);
  opacity: 0;
}
</style>