<template>
  <div class="orders-page">
    <Header />
    <div class="container">
      <h1>{{ $t("orders.title") }}</h1>

      <div v-if="loading">{{ $t("orders.loading") }}</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else>
        <div v-if="orders.length === 0">{{ $t("orders.empty") }}</div>
        <ul class="orders-list">
          <li v-for="order in orders" :key="order.id" class="order-item">
            <div>
              <strong>Order #{{ order.id }}</strong>
            </div>
            <div>
              {{ $t("orders.placed") }}: {{ formatDate(order.created_at) }}
            </div>
            <div>
              Total: {{ order.final_total ?? order.cart_subtotal ?? "-" }} EGP
            </div>
            <div>{{ $t("orders.status") }}: {{ order.status }}</div>

            <div v-if="order.items && order.items.length" class="order-items">
              <h4>{{ $t("orders.items") }}</h4>
              <ul>
                <li
                  v-for="it in order.items"
                  :key="it.product_id"
                  style="
                    display: flex;
                    gap: 12px;
                    align-items: center;
                    margin: 8px 0;
                  "
                >
                  <img
                    v-if="it.product_image"
                    :src="it.product_image"
                    alt=""
                    style="
                      width: 64px;
                      height: 64px;
                      object-fit: cover;
                      border-radius: 6px;
                    "
                  />
                  <div>
                    <div style="font-weight: 600">{{ it.product_name }}</div>
                    <div>
                      {{ $t("orders.qty") }}: {{ it.quantity }} ×
                      {{ parseFloat(it.price_at_purchase).toFixed(2) }} EGP
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import api from "@/config/api";
import Header from "./header.vue";
import Footer from "./Footer.vue";

const orders = ref([]);
const loading = ref(true);
const error = ref(null);

const fetchOrders = async () => {
  loading.value = true;
  error.value = null;
  try {
    const resp = await api.get("user/orders/");
    // API likely returns a list
    orders.value = Array.isArray(resp.data)
      ? resp.data
      : resp.data.results || [];

    // For each order, fetch detailed order (to get items with product image/id)
    const detailPromises = orders.value.map((o) =>
      api
        .get(`user/orders/${o.id}/`)
        .then((r) => ({ id: o.id, data: r.data }))
        .catch((e) => ({ id: o.id, error: e }))
    );

    const details = await Promise.all(detailPromises);
    for (const d of details) {
      if (d.data) {
        const idx = orders.value.findIndex((x) => x.id === d.id);
        if (idx !== -1) {
          orders.value[idx] = { ...orders.value[idx], ...d.data };
        }
      }
    }
  } catch (err) {
    console.error("Failed to load orders:", err);
    error.value = "Could not load orders. Please try again.";
  } finally {
    loading.value = false;
  }
};

onMounted(fetchOrders);

const { d, locale } = useI18n();
const formatDate = (iso) => {
  if (!iso) return "-";
  try {
    const dt = new Date(iso);
    if (Number.isNaN(dt.getTime())) return iso;
    // Use i18n date formatting so it respects the current locale
    return d(dt, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return iso;
  }
};
</script>

<style scoped>
.container {
  max-width: 900px;
  margin: 2rem auto;
  padding: 1rem;
}
.orders-list {
  list-style: none;
  padding: 0;
}
.order-item {
  padding: 1rem;
  border: 1px solid #eee;
  margin-bottom: 1rem;
  border-radius: 6px;
}
.error {
  color: #c00;
}
</style>
