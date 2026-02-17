<template>
  <div>
    <Header />

    <main class="payment-page-content">
      <div class="payment-page-container">
        <div class="main-payment-area">
          <h2 class="section-title">
            {{ $t("payment.title") }}
          </h2>

          <div class="payment-options">
            <div
              class="payment-card selected"
              @click="selectPaymentMethod('COD')"
            >
              <div class="card-header">
                <input
                  type="radio"
                  id="cod"
                  name="payment_method"
                  value="COD"
                  checked
                  disabled
                />
                <label for="cod"> {{ $t("payment.cod_label") }} </label>
              </div>
              <p class="card-description">
                {{ $t("payment.cod_description") }}
              </p>
            </div>
          </div>
          <div class="back-to-shipping">
            <button class="back-btn" @click="router.back()">
              &lt; {{ $t("payment.back_to_shipping") }}
            </button>
          </div>
        </div>

        <div class="order-summary-container">
          <h3>{{ $t("payment.order_summary_title") }}</h3>

          <div class="summary-item">
            <span>{{ $t("payment.subtotal") }}</span>
            <span class="price">{{ cartStore.cartTotal }} EGP</span>
          </div>

          <div class="summary-item">
            <span>{{ $t("payment.shipping") }}</span>
            <span class="price">{{ shippingCost.toFixed(2) }} EGP</span>
          </div>

          <div class="coupon-code">
            <span>{{ $t("payment.coupon_code") }}</span>
            <div class="coupon-input">
              <input
                type="text"
                :placeholder="$t('payment.placeholder_coupon')"
                disabled
              />
              <button class="apply-btn" disabled>
                {{ $t("payment.apply") }}
              </button>
            </div>
          </div>

          <div class="summary-item total-price">
            <span>{{ $t("payment.total") }}</span>
            <span class="price">{{ calculatedTotal }} EGP</span>
          </div>

          <button @click="placeOrder" class="place-order-btn">
            {{ $t("payment.place_order") }}
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
import { useAuthStore } from "@/stores/auth";
import api from "@/config/api";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n"; // NEW: Import useI18n
import Header from "@/components/header.vue";
import Footer from "@/components/Footer.vue";

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();
const toast = useToast();
const { t } = useI18n(); // NEW: Initialize i18n helper

// State for the payment method
const selectedPaymentMethod = ref("COD");

// State for shipping cost (should be passed/stored from the previous step)
const shippingCost = ref(0.0);

// --- COMPUTED PROPERTIES ---
const calculatedTotal = computed(() => {
  // Assuming cartStore.cartTotal is numeric (or can be parsed)
  const subtotal = parseFloat(cartStore.cartTotal) || 0;
  const cost = parseFloat(shippingCost.value) || 0;
  return (subtotal + cost).toFixed(2);
});

// --- LIFECYCLE: Load real data ---
onMounted(async () => {
  // 1. Re-hydrate User Data for the Header (if necessary)
  if (!authStore.user) {
    await authStore.fetchUser();
  }

  // 2. Re-hydrate Cart Data (use fetchCart for consistency with CheckoutPage)
  await cartStore.fetchCart();

  // 3. Set Shipping Cost
  // *** IMPORTANT: You must get the REAL shipping cost from a checkout/address store
  shippingCost.value = 100.0; // Replace with actual logic

  // Try to fetch the selected address from the query parameter
  try {
    const addressId = Number(
      router.currentRoute.value.query.address_id ||
        router.currentRoute.value.query.addressId ||
        router.currentRoute.value.query.address
    );
    if (addressId) {
      const resp = await api.get(`user/addresses/${addressId}/`);
      selectedAddress.value = resp.data;
      shippingCost.value = parseFloat(resp.data.area?.shipping_cost || 0);
    }
  } catch (err) {
    console.warn("Could not prefetch selected address:", err);
  }
});

// --- HANDLERS ---
const selectPaymentMethod = (method) => {
  selectedPaymentMethod.value = method;
};

const placeOrder = () => {
  // This is where you would make the final API call to the '/checkout/' endpoint.
  if (selectedPaymentMethod.value) {
    // Build checkout payload. We need to post the nested `shipping_address` fields
    // and `payment_method` as required by CheckoutSerializer on the backend.
    (async () => {
      try {
        // Ensure we have the selected address; if not, ask the backend
        let address = selectedAddress.value;
        if (!address) {
          const addressId = Number(
            router.currentRoute.value.query.address_id || 0
          );
          if (addressId) {
            const resp = await api.get(`user/addresses/${addressId}/`);
            address = resp.data;
          }
        }

        if (!address) {
          // Use i18n for toast messages
          toast.error(t("payment.toast_no_address"));
          return;
        }

        const payload = {
          shipping_address: {
            first_name: address.first_name,
            last_name: address.last_name,
            phone_number: address.phone_number,
            street_address: address.street_address,
            apartment_details: address.apartment_details || "",
            area_id: Number(address.area && (address.area.id || address.area)),
          },
          payment_method:
            selectedPaymentMethod.value === "COD"
              ? "Cash on Delivery"
              : selectedPaymentMethod.value,
        };

        const checkoutResp = await api.post("checkout/", payload);
        // Use i18n for toast messages
        toast.success(t("payment.toast_success"));

        // After successful checkout, navigate to orders page
        router.push("/orders");
      } catch (err) {
        console.error("Checkout failed:", err.response?.data || err);
        const msg =
          err.response?.data?.detail ||
          t("payment.toast_failed"); // Use i18n as fallback
        toast.error(msg);
      }
    })();
  } else {
    // Use i18n for toast messages
    toast.error(t("payment.toast_no_method"));
  }
};

// local state for selected address fetched from query
const selectedAddress = ref(null);
</script>

<style scoped>
/* GENERAL LAYOUT (Copied from Checkout) */
.payment-page-content {
  padding: 2rem 0;
}

.payment-page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  gap: 2rem;
}

.main-payment-area {
  flex: 2;
}

.section-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
}

/* PAYMENT METHOD SPECIFIC STYLES */
.payment-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.payment-card {
  border: 2px solid #ccc;
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.payment-card:hover {
  border-color: #20b486; /* Hover color */
}

.payment-card.selected {
  border-color: #20b486; /* Selected color */
  background-color: #f6fff9; /* Light background for selected */
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: bold;
  color: #333;
}

.card-header input[type="radio"] {
  /* Style the radio button */
  appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid #ccc;
  border-radius: 50%;
  outline: none;
  transition: border 0.2s;
  position: relative;
  cursor: pointer;
}

.card-header input[type="radio"]:checked {
  border-color: #20b486;
}

.card-header input[type="radio"]:checked::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  background-color: #20b486;
  border-radius: 50%;
}

.card-description {
  margin-top: 0.5rem;
  margin-left: 28px; /* Align with label content */
  color: #666;
  font-size: 0.95rem;
}

.back-to-shipping {
  margin-top: 2rem;
}

.back-btn {
  background: none;
  border: none;
  color: #20b486;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem 0;
  transition: color 0.2s;
}

.back-btn:hover {
  text-decoration: underline;
  color: #1a9c72;
}

/* ORDER SUMMARY STYLES (Copied from Checkout) */
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
  cursor: not-allowed; /* Disabled in payment for simplicity */
  opacity: 0.6;
}

/* Updated final button style/label */
.place-order-btn {
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

.place-order-btn:hover {
  background-color: #1a9c72;
}
</style>