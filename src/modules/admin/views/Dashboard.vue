<template>
  <v-container fluid class="pa-4 pa-md-6 h-100 bg-dashboard-container">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-8">
      <div>
        <h1 class="text-h4 font-weight-bold text-high-emphasis mb-1">Dashboard</h1>
        <div class="text-subtitle-1 text-medium-emphasis">Overview of your store's performance</div>
      </div>
      <div class="d-flex gap-2 align-center">
         <v-select
            v-model="period"
            :items="periodOptions"
            item-title="text"
            item-value="value"
            density="compact"
            variant="solo"
            hide-details
            bg-color="white"
            class="rounded-lg shadow-sm"
            style="width: 150px"
            @update:model-value="refreshData"
         ></v-select>
         
         <v-menu>
            <template v-slot:activator="{ props }">
                <v-btn color="primary" class="text-capitalize rounded-lg shadow-sm" height="40" v-bind="props">
                    <i class="fa-solid fa-download mr-2"></i> Export
                </v-btn>
            </template>
            <v-list>
                <v-list-item @click="exportData('excel')">
                    <template v-slot:prepend>
                        <i class="fa-solid fa-file-excel mr-3 text-success"></i>
                    </template>
                    <v-list-item-title>Excel (.xlsx)</v-list-item-title>
                </v-list-item>
                <v-list-item @click="exportData('pdf')">
                    <template v-slot:prepend>
                        <i class="fa-solid fa-file-pdf mr-3 text-error"></i>
                    </template>
                    <v-list-item-title>PDF</v-list-item-title>
                </v-list-item>
            </v-list>
         </v-menu>
      </div>
    </div>

    <!-- KPI Cards Section -->
    <v-row>
      <v-col cols="12" sm="6" md="3">
        <AdminStatCard
            title="Total Revenue"
            :value="`$${(dashboardStore.analyticsData.total_revenue || 0).toLocaleString()}`"
            icon="fa-sack-dollar"
            color="#4680FF"
            bg_color="#E9F0FF"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <AdminStatCard
            title="Total Orders"
            :value="dashboardStore.analyticsData.total_orders || 0"
            icon="fa-cart-shopping"
            color="#E58A00"
            bg_color="#FFF8E1"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <AdminStatCard
            title="Active Users"
            :value="dashboardStore.analyticsData.active_users || 0"
            icon="fa-users"
            color="#2CA87F"
            bg_color="#E6F4EA"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <AdminStatCard
            title="Total Products"
            :value="dashboardStore.analyticsData.total_products || 0"
            icon="fa-box-open"
            color="#DC2626"
            bg_color="#FEE2E2"
        />
      </v-col>
    </v-row>

    <!-- Row 1: Revenue & Funnel -->
    <v-row class="mt-4 g-4">
      <v-col cols="12" xl="8">
        <!-- Revenue Line Chart -->
        <v-card class="rounded-xl border-0 shadow-sm bg-dashboard-card dashboard-card revenue-card">
          <div class="pa-6 d-flex align-center justify-space-between card-header">
            <h3 class="text-h6 font-weight-bold">Revenue Analytics</h3>
            <v-btn icon variant="text" size="small" color="medium-emphasis">
               <i class="fa-solid fa-ellipsis"></i>
            </v-btn>
          </div>
          <v-card-text>
             <div v-if="loadingRevenue" class="d-flex justify-center align-center chart-wrapper">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </div>
            <div v-else class="chart-wrapper">
               <apexchart
                v-if="revenueSeries[0].data.length > 0"
                type="area"
                height="350"
                :options="revenueChartOptions"
                :series="revenueSeries"
                ref="revenueChart"
              ></apexchart>
              <div v-else class="d-flex justify-center align-center" style="height: 350px">
                <span class="text-medium-emphasis">No revenue data available</span>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" xl="4">
        <!-- Sales Funnel Chart -->
        <v-card class="rounded-xl border-0 shadow-sm h-100 bg-dashboard-card dashboard-card">
          <div class="pa-6 pb-0">
            <h3 class="text-h6 font-weight-bold">Sales Funnel</h3>
          </div>
          <v-card-text>
            <apexchart
              v-if="dashboardStore.analyticsData.funnel_metrics"
              type="bar"
              height="250"
              :options="funnelChartOptions"
              :series="funnelSeries"
            ></apexchart>
            <div v-else class="d-flex justify-center align-center" style="height: 250px">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Row 2: Stock, Top Products, Category -->
    <v-row class="mt-1 g-4">
        <v-col cols="12" xl="4">
            <!-- Stock Needed List -->
            <v-card class="rounded-xl border-0 shadow-sm h-100 bg-dashboard-card dashboard-card">
                <div class="pa-6 d-flex justify-space-between align-center">
                    <h3 class="text-h6 font-weight-bold">Stock Needed</h3>
                    <span class="text-caption text-primary cursor-pointer font-weight-bold" @click="navigateToStockNeeded">See All</span>
                </div>
                 <v-list class="bg-transparent pa-0">
                    <v-list-item v-for="(product, i) in (dashboardStore.analyticsData.low_stock || [])" :key="i" class="px-6 py-3">
                    <template v-slot:prepend>
                         <v-avatar rounded="lg" size="48" class="mr-3 bg-grey-lighten-4">
                            <v-img :src="getImageUrl(product.image)" cover>
                                 <template v-slot:placeholder>
                                <v-icon :icon="mdiImage" color="grey"></v-icon>
                                </template>
                            </v-img>
                        </v-avatar>
                    </template>
                        <v-list-item-title class="font-weight-bold">{{ product.name }}</v-list-item-title>
                        <v-list-item-subtitle class="text-caption mt-1">
                             <v-chip size="x-small" color="error" label class="font-weight-bold">
                                Only {{ product.quantity }} left
                             </v-chip>
                        </v-list-item-subtitle>
                    </v-list-item>
                    <div v-if="!dashboardStore.analyticsData.low_stock?.length" class="text-center py-4 text-medium-emphasis">No low stock items</div>
                </v-list>
            </v-card>
        </v-col>

         <v-col cols="12" xl="4">
            <!-- Top Products -->
            <v-card class="rounded-xl border-0 shadow-sm h-100 bg-dashboard-card dashboard-card">
                <div class="pa-6 d-flex justify-space-between align-center">
                     <h3 class="text-h6 font-weight-bold">Top Products</h3>
                     <div class="d-flex align-center gap-2">
                         <v-select
                            v-model="selectedCategory"
                            :items="categories"
                            density="compact"
                            variant="outlined"
                            hide-details
                            class="rounded-lg"
                            style="width: 120px"
                         ></v-select>
                         <span class="text-caption text-primary cursor-pointer font-weight-bold ml-2" @click="navigateToTopProducts">See All</span>
                     </div>
                </div>
                 <v-list class="bg-transparent pa-0">
                    <v-list-item
                        v-for="(product, i) in topProducts"
                        :key="i"
                        class="px-6 py-3"
                    >
                    <template v-slot:prepend>
                         <v-avatar rounded="lg" size="48" class="mr-3 bg-grey-lighten-4">
                            <v-img :src="getImageUrl(product.image)" cover>
                                 <template v-slot:placeholder>
                                    <v-icon :icon="mdiImage" color="grey"></v-icon>
                                </template>
                            </v-img>
                        </v-avatar>
                    </template>
                    <v-list-item-title class="font-weight-bold text-body-1">{{ product.name }}</v-list-item-title>
                    <v-list-item-subtitle class="text-caption mt-1">
                        <v-chip size="x-small" color="success" label class="mr-2">{{ product.sales_count }} sold</v-chip>
                        <span class="font-weight-bold text-high-emphasis">${{ product.revenue }}</span>
                    </v-list-item-subtitle>
                    </v-list-item>
                    <div v-if="topProducts.length === 0" class="text-center py-4 text-medium-emphasis">
                        No products found
                    </div>
                 </v-list>
            </v-card>
        </v-col>

        <v-col cols="12" xl="4">
            <!-- Category Breakdown Chart -->
            <v-card class="rounded-xl border-0 shadow-sm h-100 bg-dashboard-card dashboard-card">
              <div class="pa-6 pb-0">
                <h3 class="text-h6 font-weight-bold">Sales by Category</h3>
              </div>
              <v-card-text>
                 <apexchart
                  v-if="categorySeries.length > 0"
                  type="donut"
                  height="265"
                  :options="categoryChartOptions"
                  :series="categorySeries"
                ></apexchart>
                <div v-else class="d-flex justify-center align-center" style="height: 250px">
                  <span class="text-medium-emphasis">No category data</span>
                </div>
              </v-card-text>
            </v-card>
        </v-col>
    </v-row>

    <!-- Row 3: Order Status, Region, Recent Orders -->
    <v-row class="mt-1 g-4">
        <v-col cols="12" xl="4">
            <!-- Order Status Chart -->
            <v-card class="rounded-xl border-0 shadow-sm h-100 bg-dashboard-card dashboard-card">
              <div class="pa-6 pb-0">
                <h3 class="text-h6 font-weight-bold">Order Status</h3>
              </div>
              <v-card-text>
                <apexchart
                  v-if="statusSeries[0].data.length > 0"
                  type="bar"
                  height="250"
                  :options="statusChartOptions"
                  :series="statusSeries"
                ></apexchart>
                <div v-else class="d-flex justify-center align-center" style="height: 250px">
                  <span class="text-medium-emphasis">No order status data</span>
                </div>
              </v-card-text>
            </v-card>
        </v-col>

        <v-col cols="12" xl="4">
            <!-- Regional Sales Chart -->
            <v-card class="rounded-xl border-0 shadow-sm h-100 bg-dashboard-card dashboard-card">
              <div class="pa-6 pb-0">
                <h3 class="text-h6 font-weight-bold">Sales by Region</h3>
              </div>
              <v-card-text>
                <apexchart
                  v-if="regionSeries[0].data.length > 0"
                  type="bar"
                  height="250"
                  :options="regionChartOptions"
                  :series="regionSeries"
                ></apexchart>
                <div v-else class="d-flex justify-center align-center" style="height: 250px">
                  <span class="text-medium-emphasis">No regional data</span>
                </div>
              </v-card-text>
            </v-card>
        </v-col>

        <v-col cols="12" xl="4">
            <!-- Recent Orders List -->
            <v-card class="rounded-xl border-0 shadow-sm h-100 bg-dashboard-card dashboard-card">
              <div class="pa-6 d-flex align-center justify-space-between">
                <h3 class="text-h6 font-weight-bold">Recent Orders</h3>
                 <span class="text-caption text-primary cursor-pointer font-weight-bold" @click="navigateToOrders">See All</span>
              </div>
              
              <v-list class="bg-transparent pa-0">
                <v-list-item
                    v-for="order in recentOrders"
                    :key="order.id"
                    class="px-6 py-4 border-b-sm"
                >
                    <template v-slot:prepend>
                        <v-avatar color="primary" variant="tonal" size="40" class="mr-3 rounded-circle">
                             <span class="text-body-2 font-weight-bold">{{ order.user?.full_name ? order.user.full_name.charAt(0).toUpperCase() : 'U' }}</span>
                        </v-avatar>
                    </template>
                    
                    <v-list-item-title class="font-weight-bold text-body-2 mb-1">
                        Order #{{ order.id }}
                    </v-list-item-title>
                    
                    <v-list-item-subtitle>
                         <v-menu>
                            <template v-slot:activator="{ props }">
                                <v-chip
                                    v-bind="props"
                                    :color="getStatusColor(order.status)"
                                    size="x-small"
                                    label
                                    class="font-weight-bold cursor-pointer"
                                >
                                    {{ order.status }}
                                    <v-icon size="x-small" class="ml-1" :icon="mdiChevronDown"></v-icon>
                                </v-chip>
                            </template>
                            <v-list density="compact">
                                <v-list-item
                                    v-for="status in statusOptions"
                                    :key="status"
                                    @click="updateOrderStatus(order, status)"
                                    :class="{ 'bg-grey-lighten-4': order.status === status }"
                                >
                                    <v-list-item-title class="text-caption text-uppercase">
                                        {{ status }}
                                    </v-list-item-title>
                                </v-list-item>
                            </v-list>
                         </v-menu>
                         <span class="ml-2">{{ order.user?.full_name || 'Unknown' }}</span>
                         <span class="float-right font-weight-bold text-high-emphasis">${{ order.total_amount }}</span>
                    </v-list-item-subtitle>
                </v-list-item>
                 <div v-if="!recentOrders.length" class="text-center py-8 text-medium-emphasis">
                    No recent orders
                </div>
              </v-list>
            </v-card>
        </v-col>
    </v-row>

    <!-- Row 4: Product Insights (Wishlisted & Watched) -->
    <v-row class="mt-1 g-4">
        <v-col cols="12" md="6">
            <v-card class="rounded-xl border-0 shadow-sm h-100 bg-dashboard-card dashboard-card">
                <div class="pa-6 d-flex justify-space-between align-center">
                    <h3 class="text-h6 font-weight-bold">Most Wishlisted</h3>
                    <span class="text-caption text-primary cursor-pointer font-weight-bold" @click="navigateToMostWishlisted">See All</span>
                </div>
                <v-list class="bg-transparent pa-0">
                    <v-list-item v-for="(product, i) in dashboardStore.analyticsData.most_wishlisted" :key="i" class="px-6 py-3">
                        <template v-slot:prepend>
                             <v-avatar rounded="lg" size="48" class="mr-3 bg-grey-lighten-4">
                                <v-img :src="getImageUrl(product.image)" cover>
                                     <template v-slot:placeholder>
                                        <v-icon :icon="mdiImage" color="grey"></v-icon>
                                    </template>
                                </v-img>
                            </v-avatar>
                        </template>
                        <v-list-item-title class="font-weight-bold">{{ product.name }}</v-list-item-title>
                        <v-list-item-subtitle class="text-caption mt-1">
                             <v-icon :icon="mdiHeart" size="x-small" color="error" class="mr-1"></v-icon>
                             {{ product.wishlist_count }} Users
                        </v-list-item-subtitle>
                    </v-list-item>
                    <div v-if="!dashboardStore.analyticsData.most_wishlisted?.length" class="text-center py-4 text-medium-emphasis">No data</div>
                </v-list>
            </v-card>
        </v-col>

        <v-col cols="12" md="6">
            <v-card class="rounded-xl border-0 shadow-sm h-100 bg-dashboard-card dashboard-card">
                <div class="pa-6 d-flex justify-space-between align-center">
                    <h3 class="text-h6 font-weight-bold">Most Watched (Trending)</h3>
                    <span class="text-caption text-primary cursor-pointer font-weight-bold" @click="navigateToTopWatched">See All</span>
                </div>
                <v-list class="bg-transparent pa-0">
                    <v-list-item v-for="(product, i) in dashboardStore.analyticsData.most_watched" :key="i" class="px-6 py-3">
                        <template v-slot:prepend>
                             <v-avatar rounded="lg" size="48" class="mr-3 bg-grey-lighten-4">
                                <v-img :src="getImageUrl(product.image)" cover>
                                     <template v-slot:placeholder>
                                        <v-icon :icon="mdiImage" color="grey"></v-icon>
                                    </template>
                                </v-img>
                            </v-avatar>
                        </template>
                        <v-list-item-title class="font-weight-bold">{{ product.name }}</v-list-item-title>
                        <v-list-item-subtitle class="text-caption mt-1">
                             <v-icon :icon="mdiEye" size="x-small" color="primary" class="mr-1"></v-icon>
                             {{ product.views_count }} Views
                        </v-list-item-subtitle>
                    </v-list-item>
                     <div v-if="!dashboardStore.analyticsData.most_watched?.length" class="text-center py-4 text-medium-emphasis">No data</div>
                </v-list>
            </v-card>
        </v-col>
    </v-row>

    <!-- Row 5: CRM & Marketing -->
    <v-row class="mt-1 g-4">
        <!-- CRM: Top Customers -->
        <v-col cols="12" md="6">
            <v-card class="rounded-xl border-0 shadow-sm h-100 bg-dashboard-card dashboard-card">
                <div class="pa-6 d-flex justify-space-between align-center">
                    <div>
                        <h3 class="text-h6 font-weight-bold">Top Customers</h3>
                        <div class="text-caption text-medium-emphasis">Based on total spent</div>
                    </div>
                    <v-btn variant="text" color="primary" class="font-weight-bold text-none px-0" @click="goToCustomers">
                        See All
                    </v-btn>
                </div>
                <v-list class="bg-transparent pa-0">
                    <v-list-item v-for="(customer, i) in topCustomers" :key="customer.id || i" class="px-6 py-4 border-b-sm">
                        <template v-slot:prepend>
                            <v-avatar color="info" variant="tonal" size="40" class="mr-3 rounded-circle">
                                <span class="text-body-2 font-weight-bold">
                                    {{ (customer.first_name || customer.username || 'C').charAt(0).toUpperCase() }}
                                </span>
                            </v-avatar>
                        </template>
                        <v-list-item-title class="font-weight-bold">
                            {{ customer.first_name.charAt(0).toUpperCase() + customer.first_name.slice(1) }} {{ customer.last_name.charAt(0).toUpperCase() + customer.last_name.slice(1) }}
                        </v-list-item-title>
                        <v-list-item-subtitle class="text-caption mt-1">
                            <span class="mr-3">Customer ID: {{ customer.id }}</span>
                        </v-list-item-subtitle>
                        <template v-slot:append>
                            <div class="text-right">
                                <div class="font-weight-bold text-success">${{ customer.total_spent }}</div>
                                <div class="text-caption text-medium-emphasis">{{ customer.total_orders }} orders</div>
                            </div>
                        </template>
                    </v-list-item>
                    <div v-if="!topCustomers.length" class="text-center py-6 text-medium-emphasis">No customer data</div>
                </v-list>
            </v-card>
        </v-col>

        <!-- Marketing: Coupon Performance -->
        <v-col cols="12" md="6">
            <v-card class="rounded-xl border-0 shadow-sm h-100 bg-dashboard-card dashboard-card">
                <div class="pa-6 d-flex justify-space-between align-center">
                    <div>
                        <h3 class="text-h6 font-weight-bold">Top Coupons</h3>
                        <div class="text-caption text-medium-emphasis">Most used promotional codes</div>
                    </div>
                    <v-btn variant="text" color="primary" class="font-weight-bold text-none px-0" @click="navigateToCoupons">
                        See All
                    </v-btn>
                </div>
                <v-list class="bg-transparent pa-0">
                    <v-list-item v-for="(coupon, i) in topCoupons" :key="i" class="px-6 py-4 border-b-sm">
                        <template v-slot:prepend>
                            <v-avatar rounded="lg" color="primary" variant="flat" size="48" class="mr-3 font-weight-bold">
                                %
                            </v-avatar>
                        </template>
                        <v-list-item-title class="font-weight-bold text-uppercase">{{ coupon.code }}</v-list-item-title>
                        <v-list-item-subtitle class="text-caption mt-1">
                            <v-chip size="x-small" color="primary" label class="mr-2">{{ coupon.discount_type }}</v-chip>
                            <span v-if="coupon.discount_type === 'PERCENTAGE'">{{ coupon.discount_value }}% off</span>
                            <span v-else>${{ coupon.discount_value }} off</span>
                        </v-list-item-subtitle>
                        <template v-slot:append>
                            <div class="text-right">
                                <div class="font-weight-bold">{{ coupon.usage_count }} uses ({{ coupon.users_count }} users)</div>
                                <div class="text-caption text-success font-weight-bold">+${{ coupon.revenue_generated }} generated</div>
                            </div>
                        </template>
                    </v-list-item>
                    <div v-if="!topCoupons.length" class="text-center py-6 text-medium-emphasis">No coupon data</div>
                </v-list>
            </v-card>
        </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
/* Strict CSS for Dashboard Cards */
:root {
  --card-bg: #1e2438;
}

body.light {
  --card-bg: #ffffff;
}

.bg-dashboard-card {
    background: var(--card-bg) !important;
}

.dashboard-card {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.revenue-card {
  min-height: 420px;
}

.chart-wrapper {
  position: relative;
  height: 350px;
  width: 100%;
  overflow: hidden;
}

/* Ensure ApexCharts/Canvas respects container */
.chart-wrapper :deep(.apexcharts-canvas) {
  position: relative !important;
  height: 100% !important;
  width: 100% !important;
}

/* Grid Alignment Helper */
.v-row > .v-col {
  display: flex;
}

.v-row > .v-col > .v-card {
  flex: 1;
}

/* Fix Chart Tooltip Overflow if needed */
.chart-wrapper {
  overflow: visible;
}

.shadow-sm {
  box-shadow: 0 4px 24px 0 rgba(34, 41, 47, 0.05) !important;
}

.cursor-pointer {
    cursor: pointer;
}

.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
</style>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAdminStore } from '../store/adminStore';
import dashboardApi from '../services/dashboardApi';
import AdminStatCard from '../components/AdminStatCard.vue';
import axios from 'axios';
import { API_CONFIG } from '@/config/api';
import { mdiImage, mdiHeart, mdiEye, mdiChevronDown } from '@mdi/js'; // Import MDI icons

const router = useRouter();
const dashboardStore = useAdminStore();

const period = ref(30);
const periodOptions = [
  { text: 'Last 7 Days', value: 7 },
  { text: 'Last 30 Days', value: 30 },
  { text: 'Last 3 Months', value: 90 },
  { text: 'Last Year', value: 365 }
];

const loadingRevenue = ref(false);
const revenueSeries = ref([{ name: 'Revenue', data: [] }]);

// Funnel Chart
const funnelSeries = computed(() => {
    const data = dashboardStore.analyticsData.funnel_metrics || {};
    return [{
        name: 'Users',
        data: [
            data.views || 0,
            data.adds_to_cart || 0,
            data.checkouts || 0,
            data.orders || 0
        ]
    }];
});

// Category Donut Chart
const categorySeries = computed(() => {
    const data = dashboardStore.analyticsData.by_category || [];
    return data.map(item => item.revenue || 0);
});

const categoryChartOptions = computed(() => ({
    chart: { type: 'donut', fontFamily: 'inherit' },
    labels: (dashboardStore.analyticsData.by_category || []).map(item => item.product__category__name || 'Unknown'),
    colors: ['#4680FF', '#2CA87F', '#E58A00', '#DC2626', '#8B5CF6'],
    plotOptions: {
        pie: {
            donut: {
                size: '70%',
                labels: {
                    show: true,
                    name: { show: true },
                    value: { show: true, formatter: (val) => `$${val}` }
                }
            }
        }
    },
    dataLabels: { enabled: false },
    legend: { position: 'bottom' }
}));

// Order Status Chart
const statusSeries = computed(() => {
    const statusData = dashboardStore.analyticsData.orders_metrics?.by_status || [];
    return [{ name: 'Orders', data: statusData.map(s => s.count) }];
});

const statusChartOptions = computed(() => {
    const statusData = dashboardStore.analyticsData.orders_metrics?.by_status || [];
    return {
        chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'inherit' },
        plotOptions: { bar: { borderRadius: 4, horizontal: true, distributed: true } },
        colors: ['#4680FF', '#E58A00', '#2CA87F', '#DC2626'],
        dataLabels: { enabled: false },
        xaxis: { categories: statusData.map(s => s.order__status), labels: { style: { colors: '#64748b' } } },
        yaxis: { labels: { style: { colors: '#64748b' } } },
        legend: { show: false },
        grid: { borderColor: '#e2e8f0', strokeDashArray: 4, xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } } }
    };
});

// Regional Sales Chart
const regionSeries = computed(() => {
    const regionData = dashboardStore.analyticsData.by_region || [];
    return [{ name: 'Revenue', data: regionData.map(r => r.revenue) }];
});

const regionChartOptions = computed(() => {
    const regionData = dashboardStore.analyticsData.by_region || [];
    return {
        chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'inherit' },
        plotOptions: { bar: { borderRadius: 4, columnWidth: '45%', distributed: true } },
        colors: ['#8B5CF6', '#4680FF', '#2CA87F', '#F59E0B'],
        dataLabels: { enabled: false },
        xaxis: { categories: regionData.map(r => r.order__region_snapshot), labels: { style: { colors: '#64748b' } } },
        yaxis: { labels: { style: { colors: '#64748b' }, formatter: (val) => `$${val}` } },
        legend: { show: false },
        grid: { borderColor: '#e2e8f0', strokeDashArray: 4 }
    };
});

const funnelChartOptions = computed(() => ({
    chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'inherit' },
    plotOptions: {
        bar: {
            borderRadius: 4,
            horizontal: true,
            barHeight: '80%',
            isFunnel: true,
        },
    },
    dataLabels: {
        enabled: true,
        formatter: function (val, opt) {
            return opt.w.globals.labels[opt.dataPointIndex] + ':  ' + val
        },
        dropShadow: { enabled: true, top: 1, left: 1, blur: 1, opacity: 0.45 }
    },
    colors: ['#2CA87F'],
    xaxis: {
        categories: ['Views', 'Add to Cart', 'Checkout', 'Orders'],
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { show: false }
    },
    grid: { show: false },
    legend: { show: false }
}));

// Revenue Chart Options
const revenueChartOptions = computed(() => ({
  chart: {
    type: 'area',
    toolbar: { show: false },
    fontFamily: 'inherit',
    zoom: { enabled: false }
  },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 3 },
  xaxis: {
    type: 'datetime',
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: '#64748b' } }
  },
  yaxis: {
     labels: { 
        style: { colors: '#64748b' },
        formatter: (value) => `$${value}`
     }
  },
  grid: {
    borderColor: '#e2e8f0',
    strokeDashArray: 4,
    xaxis: { lines: { show: false } } 
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.2,
      stops: [0, 100]
    }
  },
  colors: ['#4680FF'],
   tooltip: {
    theme: 'light',
    y: { formatter: (val) => `$${val}` }
  },
  responsive: [{
    breakpoint: undefined,
    options: {},
  }],
  maintainAspectRatio: false
}));

const startDate = ref('');
const endDate = ref('');

// Sync dates with period
watch(period, (newVal) => {
    if (newVal) {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - parseInt(newVal));
        
        // Use full ISO strings to ensure accurate up-to-the-second API queries
        startDate.value = start.toISOString();
        endDate.value = end.toISOString();
    } else {
        startDate.value = '';
        endDate.value = '';
    }
}, { immediate: true });

const buildDateParams = () => {
    const params = {};
    if (startDate.value) params.start_date = startDate.value;
    if (endDate.value) params.end_date = endDate.value;
    return params;
};

// API Actions
const refreshData = () => {
    fetchDashboardData();
    fetchRevenueData();
    fetchTopProducts();
    fetchTopCustomers();
    fetchRecentOrders();
    fetchTopCoupons();
};

const fetchDashboardData = async () => {
  try {
    const { data } = await dashboardApi.getAnalytics(startDate.value, endDate.value);
    dashboardStore.analyticsData = data;
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
  }
};

const topProducts = ref([]);
const categories = ref(['All']);
const selectedCategory = ref('All');

const fetchTopProducts = async () => {
    try {
        const params = buildDateParams();
        if (selectedCategory.value && selectedCategory.value !== 'All') {
            params.category = selectedCategory.value;
        }
        const response = await dashboardApi.getTopProducts(params);
        topProducts.value = Array.isArray(response.data) ? response.data : (response.data.results || []);
    } catch (error) {
        console.error('Error fetching top products:', error);
    }
};

// Fetch categories for filter dropdown dynamically from DB
const fetchCategories = async () => {
    try {
        const response = await dashboardApi.getCategories();
        const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
        categories.value = ['All', ...data.map(c => c.name)];
    } catch (e) {
        // If fetch fails, keep ['All'] — no hardcoded fallbacks
        console.warn('Could not fetch categories', e);
        categories.value = ['All'];
    }
};

watch(selectedCategory, () => {
    fetchTopProducts();
});

const navigateToOrders = () => {
    router.push({ name: 'AdminOrders' });
};

const goToCustomers = () => {
    router.push({ name: 'AdminCustomers' });
};

const navigateToProducts = () => {
    router.push({ name: 'AdminCRUD', params: { model: 'product' } });
};

const navigateToTopProducts = () => {
    router.push({ name: 'AdminTopProducts' });
};

const navigateToTopWatched = () => {
    router.push({ name: 'AdminMostWatched' });
};

const navigateToMostWishlisted = () => {
    router.push({ name: 'AdminMostWishlisted' });
};

const navigateToStockNeeded = () => {
    router.push({ name: 'AdminStockNeeded' });
};

const navigateToCoupons = () => {
    router.push({ name: 'AdminCRUD', params: { model: 'coupon' } });
};

const fetchRevenueData = async () => {
    loadingRevenue.value = true;
    try {
        const response = await dashboardApi.getRevenueChart(period.value, startDate.value, endDate.value);
        const data = response.data;
        let seriesData = [];
        
        if (Array.isArray(data)) {
            seriesData = data.map(item => ({ x: item.date, y: item.revenue }));
        } else if (data.results && Array.isArray(data.results)) {
            seriesData = data.results.map(item => ({ x: item.date, y: item.revenue }));
        } else {
            seriesData = Object.entries(data).map(([date, value]) => ({ x: date, y: value }));
        }
            
        revenueSeries.value = [{ name: 'Revenue', data: seriesData }];
    } catch (error) {
        console.error('Error fetching revenue chart:', error);
    } finally {
        loadingRevenue.value = false;
    }
};

const exportData = async (type) => {
    try {
        const response = await dashboardApi.getExport(type, period.value);
        
        // Create blob link to download
        const blob = new Blob([response.data], { 
            type: type === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        const date = new Date().toISOString().split('T')[0];
        link.download = `analytics_report_${date}.${type === 'pdf' ? 'pdf' : 'xlsx'}`;
        link.click();
        window.URL.revokeObjectURL(link.href);
    } catch (e) {
        console.error('Export failed:', e);
    }
};

const getStatusColor = (status) => {
  const normStatus = (status || '').toUpperCase();
  const colors = {
    'NEW': 'info',
    'PENDING': 'info',
    'CONFIRMED': 'purple',
    'PROCESSING': 'purple',
    'SHIPPED': 'warning',
    'DELIVERED': 'success',
    'RETURNED': 'error',
    'CANCELLED': 'error'
  };
  return colors[normStatus] || 'default';
};

// Fixed: Added getImageUrl function
const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  // Dynamic base URL for media (strip /api if present)
  const baseUrl = API_CONFIG.BASE_URL.replace(/\/api$/, '') || '';
  return `${baseUrl}${imagePath}`;
};

const topCustomers = ref([]);
const fetchTopCustomers = async () => {
    try {
        let rangeStr = '30d';
        if (period.value === 7) rangeStr = '7d';
        else if (period.value === 30) rangeStr = '30d';
        else if (period.value === 90) rangeStr = '3m';
        else if (period.value === 365) rangeStr = '1y';

        const response = await axios.get(`${API_CONFIG.BASE_URL}/analytics/top-customers/?range=${rangeStr}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        });
        topCustomers.value = response.data;
    } catch (e) {
        console.warn('Could not fetch top customers', e);
    }
};

const recentOrders = ref([]);
const fetchRecentOrders = async () => {
    try {
        let rangeStr = '30d';
        if (period.value === 7) rangeStr = '7d';
        else if (period.value === 30) rangeStr = '30d';
        else if (period.value === 90) rangeStr = '3m';
        else if (period.value === 365) rangeStr = '1y';

        const response = await axios.get(`${API_CONFIG.BASE_URL}/orders/recent/?range=${rangeStr}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        });
        recentOrders.value = response.data;
    } catch (e) {
        console.warn('Could not fetch recent orders', e);
    }
};

const statusOptions = ['NEW', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'RETURNED', 'CANCELLED'];

const updateOrderStatus = async (order, newStatus) => {
    if (order.status === newStatus) return;
    try {
        await axios.patch(`${API_CONFIG.BASE_URL}/orders/${order.id}/status/`, { status: newStatus }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        });
        order.status = newStatus;
    } catch (error) {
        console.error('Error updating order status:', error);
    }
};

const topCoupons = ref([]);
const fetchTopCoupons = async () => {
    try {
        const response = await axios.get(`${API_CONFIG.BASE_URL}/marketing/coupons/analytics/`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        });
        topCoupons.value = response.data;
    } catch (e) {
        console.warn('Could not fetch top coupons', e);
    }
};

let refreshInterval = null;

onMounted(() => {
  fetchCategories(); // Fetch categories first for filter
  refreshData(); // Fetches dashboard analytics and all other data

  // Auto refresh every 30 seconds
  refreshInterval = setInterval(() => {
    refreshData();
  }, 30000);
});

import { onUnmounted } from 'vue';
onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval);
});
</script>

<style scoped>
.shadow-sm {
  box-shadow: 0 4px 24px 0 rgba(34, 41, 47, 0.05) !important;
}
.cursor-pointer {
    cursor: pointer;
}
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
</style>
