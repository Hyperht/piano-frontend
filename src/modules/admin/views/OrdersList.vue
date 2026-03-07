<template>
  <v-container fluid class="pa-4 pa-md-6 h-100 bg-dashboard-container">
    <div class="d-flex align-center justify-space-between mb-8">
      <div>
        <h1 class="text-h4 font-weight-bold">Orders Management</h1>
        <p class="text-body-1 text-medium-emphasis mt-2">View and manage all customer orders</p>
      </div>
      <div class="d-flex gap-3">
        <!-- Export Buttons Placeholder -->
        <v-btn variant="outlined" color="primary" @click="exportData('excel')">
          Excel
        </v-btn>
        <v-btn variant="outlined" color="error" @click="exportData('pdf')">
          PDF
        </v-btn>
      </div>
    </div>

    <!-- Filters -->
    <v-card class="rounded-xl border-0 shadow-sm mb-6 pa-4">
      <v-row>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="search"
            :prepend-inner-icon="mdiMagnify"
            label="Search by Order ID"
            variant="outlined"
            density="compact"
            hide-details
            @keyup.enter="fetchOrders(1)"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="4">
          <v-select
            v-model="statusFilter"
            :items="statusOptions"
            item-title="title"
            item-value="value"
            label="Filter by Status"
            variant="outlined"
            density="compact"
            hide-details
            @update:model-value="fetchOrders(1)"
          ></v-select>
        </v-col>
        <v-col cols="12" md="4">
          <v-select
            v-model="period"
            :items="periodOptions"
            item-title="text"
            item-value="value"
            label="Date Range"
            variant="outlined"
            density="compact"
            hide-details
            @update:model-value="fetchOrders(1)"
          ></v-select>
        </v-col>
      </v-row>
    </v-card>

    <!-- Table -->
    <v-card class="rounded-xl border-0 shadow-sm">
      <v-data-table-server
        v-model:items-per-page="itemsPerPage"
        :headers="headers"
        :items="serverItems"
        :items-length="totalItems"
        :loading="loading"
        @update:options="loadItems"
        class="bg-transparent"
      >
        <template v-slot:item.id="{ item }">
          <span class="font-weight-bold">#{{ item.id || item.raw?.id }}</span>
        </template>
        
        <template v-slot:item.status="{ item }">
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-chip
                v-bind="props"
                :color="getStatusColor(item.status || item.raw?.status)"
                size="small"
                class="font-weight-bold text-uppercase cursor-pointer"
              >
                {{ item.status || item.raw?.status }}
                <v-icon size="x-small" class="ml-1" :icon="mdiChevronDown"></v-icon>
              </v-chip>
            </template>
            <v-list density="compact">
              <v-list-item
                v-for="status in ['NEW', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'RETURNED', 'CANCELLED']"
                :key="status"
                @click="updateOrderStatus(item, status)"
                :class="{ 'bg-grey-lighten-4': (item.status || item.raw?.status) === status }"
              >
                <v-list-item-title class="text-caption text-uppercase">
                  {{ status }}
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>

        <template v-slot:item.full_name="{ item }">
          <span class="font-weight-medium">
            {{ (item.full_name || item.raw?.full_name)?.trim() || item.user__email || item.raw?.user__email || 'Unknown User' }}
          </span>
        </template>

        <template v-slot:item.total_amount="{ item }">
          <span class="font-weight-bold text-success">${{ item.total_amount || item.raw?.total_amount }}</span>
        </template>

        <template v-slot:item.created_at="{ item }">
          {{ formatDate(item.created_at || item.raw?.created_at) }}
        </template>
      </v-data-table-server>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { API_CONFIG } from '@/config/api';
import { mdiMagnify, mdiChevronDown } from '@mdi/js';

const search = ref('');
const statusFilter = ref('');
const statusOptions = [
  { title: 'All Statuses', value: '' },
  { title: 'New', value: 'NEW' },
  { title: 'Pending', value: 'PENDING' },
  { title: 'Confirmed', value: 'CONFIRMED' },
  { title: 'Processing', value: 'PROCESSING' },
  { title: 'Shipped', value: 'SHIPPED' },
  { title: 'Delivered', value: 'DELIVERED' },
  { title: 'Returned', value: 'RETURNED' },
  { title: 'Cancelled', value: 'CANCELLED' }
];

const period = ref(30);
const periodOptions = [
  { text: 'Last 7 Days', value: 7 },
  { text: 'Last 30 Days', value: 30 },
  { text: 'Last 3 Months', value: 90 },
  { text: 'Last Year', value: 365 }
];

const itemsPerPage = ref(10);
const serverItems = ref([]);
const totalItems = ref(0);
const loading = ref(true);

const headers = [
  { title: 'Order No', align: 'start', sortable: false, key: 'id' },
  { title: 'Status', align: 'center', sortable: false, key: 'status' },
  { title: 'Price', align: 'end', sortable: false, key: 'total_amount' },
  { title: 'Name', align: 'start', sortable: false, key: 'full_name' },
  { title: 'Phone 1', align: 'start', sortable: false, key: 'phone1' },
  { title: 'Phone 2', align: 'start', sortable: false, key: 'phone2' },
  { title: 'City', align: 'start', sortable: false, key: 'city' },
  { title: 'Address', align: 'start', sortable: false, key: 'street_address' },
  { title: 'Area', align: 'start', sortable: false, key: 'area' },
  { title: 'Government', align: 'start', sortable: false, key: 'government' },
  { title: 'Created At', align: 'end', sortable: false, key: 'created_at' },
];

const loadItems = async ({ page, itemsPerPage, sortBy }) => {
    fetchOrders(page);
};

const fetchOrders = async (page = 1) => {
    loading.value = true;
    try {
        let rangeStr = '30d';
        if (period.value === 7) rangeStr = '7d';
        else if (period.value === 30) rangeStr = '30d';
        else if (period.value === 90) rangeStr = '3m';
        else if (period.value === 365) rangeStr = '1y';

        const response = await axios.get(`${API_CONFIG.BASE_URL}/orders/all/`, {
            params: {
                page: page,
                page_size: itemsPerPage.value,
                range: rangeStr,
                search: search.value,
                status: statusFilter.value
            },
            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        });
        
        serverItems.value = response.data.results;
        totalItems.value = response.data.count;
    } catch (e) {
        console.error('Failed to fetch orders', e);
    } finally {
        loading.value = false;
    }
};

const updateOrderStatus = async (item, newStatus) => {
    const rawItem = item.raw || item;
    if (rawItem.status === newStatus) return;
    try {
        await axios.patch(`${API_CONFIG.BASE_URL}/orders/${rawItem.id}/status/`, { status: newStatus }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        });
        
        if (item.raw) {
            item.raw.status = newStatus;
        } else {
            item.status = newStatus;
        }
    } catch (error) {
        console.error('Error updating order status:', error);
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

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const exportData = async (type) => {
    loading.value = true;
    try {
        let rangeStr = '30d';
        if (period.value === 7) rangeStr = '7d';
        else if (period.value === 30) rangeStr = '30d';
        else if (period.value === 90) rangeStr = '3m';
        else if (period.value === 365) rangeStr = '1y';

        const response = await axios.get(`${API_CONFIG.BASE_URL}/orders/export/`, {
            params: {
                range: rangeStr,
                search: search.value,
                status: statusFilter.value,
                export_type: type
            },
            responseType: 'blob',
            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        });
        
        const blob = new Blob([response.data], { 
            type: type === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        const date = new Date().toISOString().split('T')[0];
        link.download = `orders_export_${date}.${type === 'pdf' ? 'pdf' : 'xlsx'}`;
        link.click();
        window.URL.revokeObjectURL(link.href);
    } catch (e) {
        console.error(`Export ${type} failed:`, e);
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
.bg-dashboard-container {
    background-color: #f8fafc;
}
.shadow-sm {
  box-shadow: 0 4px 24px 0 rgba(34, 41, 47, 0.05) !important;
}
.gap-3 { gap: 12px; }
</style>
