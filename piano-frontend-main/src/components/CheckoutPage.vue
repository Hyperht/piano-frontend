<template>
  <div>
    <Header />

    <main class="checkout-page-content">
      <div class="checkout-page-container">
        <div class="main-checkout-area">
          <h2 class="section-title">{{ $t("checkout.section_title_address") }}</h2>

          <div v-if="isLoading" class="loading-state">
            <p>{{ $t("checkout.loading_addresses") }}</p>
          </div>

          <template v-else>
            <div v-if="!isFormVisible && savedAddresses.length > 0">
              <Addresshow
                :addresses="savedAddresses"
                :activeAddressId="activeAddressId"
                @select-address="setActiveAddressId"
                @add-new="startAddingNewAddress"
                @edit-address="editAddress"
              />
            </div>

            <AddressList
              v-if="isFormVisible || savedAddresses.length === 0"
              :initialData="addressToEdit"
              @address-saved="handleAddressSaved"
              @cancel="handleCancel"
            />
          </template>
        </div>

        <div class="order-summary-container">
          <h3>{{ $t("checkout.summary_title") }}</h3>

          <div class="summary-item">
            <span>{{ $t("checkout.summary_subtotal") }}</span>
            <span class="price">{{ cartStore.cartTotal }} EGP</span>
          </div>

          <div class="summary-item">
            <span>{{ $t("checkout.summary_shipping") }}</span>
            <span v-if="activeAddress">{{ shippingCost.toFixed(2) }} EGP</span>
            <span v-else>{{ $t("checkout.summary_shipping_select") }}</span>
          </div>

          <div class="coupon-code">
            <span>{{ $t("checkout.summary_coupon") }}</span>
            <div class="coupon-input">
              <input type="text" :placeholder="$t('checkout.coupon_placeholder')" />
              <button class="apply-btn">{{ $t("checkout.coupon_apply") }}</button>
            </div>
          </div>

          <div class="summary-item total-price">
            <span>{{ $t("checkout.summary_total") }}</span>
            <span class="price">{{ calculatedTotal }} EGP</span>
          </div>

          <button
            @click="placeOrder"
            class="go-to-checkout-btn"
            :disabled="!activeAddress"
          >
            {{ $t("checkout.button_payment") }}
          </button>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useCartStore } from "@/stores/Cart";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n";
import api from "@/config/api";

import Header from "@/components/header.vue";
import Footer from "@/components/Footer.vue";
import ShippingAddressForm from "@/components/ShippingAddressForm.vue";
import AddressList from "@/components/AddressList.vue";
import Addresshow from "./addresshow.vue";

const router = useRouter();
const cartStore = useCartStore();
const toast = useToast();
const { t } = useI18n();

// --- STATE ---
const savedAddresses = ref([]);
const activeAddressId = ref(null);
const isFormVisible = ref(false); // Changed to false by default
const addressToEdit = ref(null);
const shippingCost = ref(0.0);
const isLoading = ref(true);

// --- COMPUTED ---
const activeAddress = computed(() => {
  return savedAddresses.value.find((a) => a.id === activeAddressId.value) || null;
});

const calculatedTotal = computed(() => {
  const subtotal = parseFloat(cartStore.cartTotal) || 0;
  const cost = parseFloat(shippingCost.value) || 0;
  return (subtotal + cost).toFixed(2);
});

// --- API FETCH ---
const fetchUserAddresses = async () => {
  isLoading.value = true;
  try {
    const response = await api.get("/user/addresses/");
    const addresses = response.data;
    savedAddresses.value = addresses;

    if (addresses.length > 0) {
      // If addresses exist, hide form and select the first one
      isFormVisible.value = false;
      setActiveAddressId(addresses[0].id);
    } else {
      // If no addresses exist, force the form to show
      isFormVisible.value = true;
    }
  } catch (error) {
    console.error("Failed to fetch user addresses:", error);
    toast.error(t("checkout.toasts.fetch_failed"));
    isFormVisible.value = true; // Fallback to form if API fails
  } finally {
    isLoading.value = false;
  }
};


onMounted(async () => {
  await cartStore.fetchCart();
  await fetchUserAddresses();
});

// --- METHODS ---
const setActiveAddressId = (id) => {
  activeAddressId.value = id;
  const address = savedAddresses.value.find((a) => a.id === id);
  if (address && address.area) {
    shippingCost.value = parseFloat(address.area.shipping_cost);
  }
};

const startAddingNewAddress = () => {
  addressToEdit.value = null;
  isFormVisible.value = true;
};

const editAddress = (address) => {
  addressToEdit.value = address;
  isFormVisible.value = true;
};

const handleCancel = () => {
  isFormVisible.value = false;
  addressToEdit.value = null;
};

const handleAddressSaved = async (savedAddress) => {
  const isEditing = !!addressToEdit.value;
  
  await fetchUserAddresses();

  if (savedAddress && savedAddress.id) {
    setActiveAddressId(savedAddress.id);
  }

  isFormVisible.value = false;
  addressToEdit.value = null;

  toast.success(
    isEditing
      ? t("checkout.toasts.address_updated")
      : t("checkout.toasts.address_saved")
  );
};

const placeOrder = () => {
  if (activeAddress.value) {
    router.push({
      path: "/payment",
      query: { address_id: activeAddress.value.id },
    });
  } else {
    toast.error(t("checkout.toasts.select_address"));
  }
};
</script>

<style scoped>
.section-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
}

.checkout-page-content {
  padding: 2rem 0;
}

.checkout-page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  gap: 2rem;
}

.main-checkout-area {
  flex: 2;
}

.loading-state {
  padding: 2rem;
  text-align: center;
  color: #666;
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

h3 {
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

.go-to-checkout-btn:disabled {
  background-color: #999;
  cursor: not-allowed;
}
</style>