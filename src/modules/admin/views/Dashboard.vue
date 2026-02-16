<template>
  <v-container fluid class="pa-4 pa-md-6 h-100 bg-dashboard-container">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-8">
      <div>
        <h1 class="text-h4 font-weight-bold text-high-emphasis mb-1">Dashboard</h1>
        <div class="text-subtitle-1 text-medium-emphasis">Overview of your store's performance</div>
      </div>
      <div class="d-flex gap-2">
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
            :trend="12.5"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <AdminStatCard
            title="Total Orders"
            :value="dashboardStore.analyticsData.orders_metrics?.last_year || 0"
            icon="fa-cart-shopping"
            color="#E58A00"
            bg_color="#FFF8E1"
            :trend="-2.4"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <AdminStatCard
            title="Active Users"
            :value="dashboardStore.analyticsData.total_users || 0"
            icon="fa-users"
            color="#2CA87F"
            bg_color="#E6F4EA"
            :trend="5.8"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <AdminStatCard
            title="Total Products"
            :value="dashboardStore.analyticsData.total_products || 0"
            icon="fa-box-open"
            color="#DC2626"
            bg_color="#FEE2E2"
            :trend="8.1"
        />
      </v-col>
    </v-row>

    <!-- Main Content Grid -->
    <v-row class="mt-4">
      
      <!-- Left Column: Charts -->
      <v-col cols="12" md="8">
        <!-- Revenue Line Chart -->
        <v-card class="rounded-xl border-0 shadow-sm mb-6 bg-dashboard-card">
          <div class="pa-6 d-flex align-center justify-space-between">
            <h3 class="text-h6 font-weight-bold">Revenue Analytics</h3>
            <v-btn icon variant="text" size="small" color="medium-emphasis">
               <i class="fa-solid fa-ellipsis"></i>
            </v-btn>
          </div>
          <v-card-text>
             <div v-if="loadingRevenue" class="d-flex justify-center align-center" style="height: 350px">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </div>
             <apexchart
              v-else
              type="area"
              height="350"
              :options="revenueChartOptions"
              :series="revenueSeries"
            ></apexchart>
          </v-card-text>
        </v-card>

        <!-- Stock Needed & Top Products -->
        <v-row>
            <v-col cols="12" md="6">
                <v-card class="rounded-xl border-0 shadow-sm h-100 bg-dashboard-card">
                    <div class="pa-6">
                        <h3 class="text-h6 font-weight-bold">Stock Needed</h3>
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
             <v-col cols="12" md="6">
                <v-card class="rounded-xl border-0 shadow-sm h-100 bg-dashboard-card">
                    <div class="pa-6 d-flex justify-space-between align-center">
                         <h3 class="text-h6 font-weight-bold">Top Products</h3>
                         <v-select
                            v-model="selectedCategory"
                            :items="categories"
                            density="compact"
                            variant="outlined"
                            hide-details
                            class="rounded-lg"
                            style="width: 140px"
                         ></v-select>
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
        </v-row>
      </v-col>

      <!-- Right Column: Recent Orders & Timeline -->
      <v-col cols="12" md="4">
        <!-- Recent Orders List -->
        <v-card class="rounded-xl border-0 shadow-sm h-100 bg-dashboard-card">
          <div class="pa-6 d-flex align-center justify-space-between">
            <h3 class="text-h6 font-weight-bold">Recent Orders</h3>
            <span class="text-caption text-primary cursor-pointer font-weight-bold" @click="navigateToOrders">View All</span>
          </div>
          
          <v-list class="bg-transparent pa-0">
            <v-list-item
                v-for="order in dashboardStore.analyticsData.recent_orders"
                :key="order.id"
                class="px-6 py-4 border-b-sm"
            >
                <template v-slot:prepend>
                    <v-avatar color="primary" variant="tonal" size="40" class="mr-3 rounded-circle">
                         <span class="text-body-2 font-weight-bold">{{ order.user_email ? order.user_email.charAt(0).toUpperCase() : 'U' }}</span>
                    </v-avatar>
                </template>
                
                <v-list-item-title class="font-weight-bold text-body-2 mb-1">
                    Order #{{ order.id }}
                </v-list-item-title>
                
                <v-list-item-subtitle>
                     <v-chip :color="getStatusColor(order.status)" size="x-small" label class="font-weight-bold">
                        {{ order.status }}
                     </v-chip>
                     <span class="float-right font-weight-bold text-high-emphasis">${{ order.final_total }}</span>
                </v-list-item-subtitle>
            </v-list-item>
             <div v-if="!dashboardStore.analyticsData.recent_orders?.length" class="text-center py-8 text-medium-emphasis">
                No recent orders
            </div>
          </v-list>

        </v-card>
      </v-col>
    </v-row>

    <!-- Row 3: Product Insights (Wishlisted & Watched) -->
    <v-row>
        <v-col cols="12" md="6">
            <v-card class="rounded-xl border-0 shadow-sm h-100 bg-dashboard-card">
                <div class="pa-6">
                    <h3 class="text-h6 font-weight-bold">Most Wishlisted</h3>
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
            <v-card class="rounded-xl border-0 shadow-sm h-100 bg-dashboard-card">
                <div class="pa-6">
                    <h3 class="text-h6 font-weight-bold">Most Watched (Trending)</h3>
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
                             {{ product.count }} Views
                        </v-list-item-subtitle>
                    </v-list-item>
                     <div v-if="!dashboardStore.analyticsData.most_watched?.length" class="text-center py-4 text-medium-emphasis">No data</div>
                </v-list>
            </v-card>
        </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAdminStore } from '../store/adminStore';
import dashboardApi from '../services/dashboardApi';
import AdminStatCard from '../components/AdminStatCard.vue';
import axios from 'axios';
import { API_CONFIG } from '@/config/api';
import { mdiImage, mdiHeart, mdiEye } from '@mdi/js'; // Import MDI icons

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
      opacityFrom: 0.4,
      opacityTo: 0.05,
      stops: [0, 100]
    }
  },
  colors: ['#4680FF'],
   tooltip: {
    theme: 'light',
    y: { formatter: (val) => `$${val}` }
  }
}));

// API Actions
const refreshData = () => {
    fetchDashboardData();
    fetchRevenueData();
};

const fetchDashboardData = async () => {
  try {
    const { data } = await dashboardApi.getAnalytics();
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
        const { data } = await dashboardApi.getTopProducts(selectedCategory.value === 'All' ? '' : selectedCategory.value);
        topProducts.value = data;
    } catch (error) {
        console.error('Error fetching top products:', error);
    }
};

// Fetch categories for filter
const fetchCategories = async () => {
    try {
        const { data } = await axios.get(`${API_CONFIG.BASE_URL}/categories/`);
        categories.value = ['All', ...data.map(c => c.name)];
    } catch (e) {
        console.warn('Could not fetch categories, using default', e);
        categories.value = ['All', 'Furniture', 'Lighting', 'Decor'];
    }
};

watch(selectedCategory, () => {
    fetchTopProducts();
});

const navigateToOrders = () => {
    router.push({ name: 'AdminCRUD', params: { model: 'order' } });
};

const fetchRevenueData = async () => {
    loadingRevenue.value = true;
    try {
        const { data } = await dashboardApi.getRevenueChart(period.value);
        // Backend returns array: [{date: '...', revenue: ...}, ...]
        const seriesData = Array.isArray(data) 
            ? data.map(item => ({ x: item.date, y: item.revenue }))
            : Object.entries(data).map(([date, value]) => ({ x: date, y: value }));
            
        revenueSeries.value = [{ name: 'Revenue', data: seriesData }];
    } catch (error) {
        console.error('Error fetching revenue chart:', error);
    } finally {
        loadingRevenue.value = false;
    }
};

const exportData = async (type) => {
    // Accessing base URL from dashboardApi instance
    const baseURL = dashboardApi.defaults.baseURL || '/api/dashboard';
    const url = `${baseURL}/export/?type=${type}`;
    
    try {
        const response = await axios.get(url, {
            responseType: 'blob',
            withCredentials: true
        });
        
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
  const colors = {
    'PENDING': 'warning',
    'PROCESSING': 'info',
    'SHIPPED': 'primary',
    'DELIVERED': 'success',
    'CANCELLED': 'error'
  };
  return colors[status] || 'default';
};

// Fixed: Added getImageUrl function
const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_CONFIG.BASE_URL}${imagePath}`;
};

onMounted(() => {
  fetchCategories(); // Fetch categories first for filter
  refreshData(); // Fetches dashboard analytics (including Donut chart) and Revenue
  fetchTopProducts(); // Fetches top products independently
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
