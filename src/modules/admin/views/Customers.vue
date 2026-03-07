<template>
  <v-container fluid class="pa-4 pa-md-6 h-100 bg-dashboard-container">
    <div class="d-flex align-center justify-space-between mb-8">
      <div>
        <h1 class="text-h4 font-weight-bold text-high-emphasis mb-1">Customers</h1>
        <div class="text-subtitle-1 text-medium-emphasis">Complete CRM database of all customers</div>
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
            @update:model-value="fetchCustomers"
         ></v-select>
         <v-btn color="primary" class="text-capitalize rounded-lg shadow-sm" height="40" @click="exportData('excel')">
              <i class="fa-solid fa-download mr-2"></i> Export Excel
         </v-btn>
      </div>
    </div>

    <v-card class="rounded-xl border-0 shadow-sm bg-dashboard-card">
      <v-card-title class="d-flex align-center pa-4">
        <v-text-field
          v-model="search"
          :prepend-inner-icon="mdiMagnify"
          label="Search Customers"
          single-line
          hide-details
          variant="outlined"
          density="compact"
          class="custom-search"
        ></v-text-field>
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="customers"
        :search="search"
        :loading="loading"
        class="elevation-0 bg-transparent"
        :items-per-page="10"
      >
        <template v-slot:item.name="{ item }">
          <div class="font-weight-bold">{{ item.user__first_name }} {{ item.user__last_name }}</div>
        </template>
        <template v-slot:item.total_spent="{ item }">
          <div class="font-weight-bold text-success">${{ item.total_spent || 0 }}</div>
        </template>
        <template v-slot:item.last_order="{ item }">
          <div>{{ formatDate(item.last_order) }}</div>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { API_CONFIG } from '@/config/api';
import { mdiMagnify } from '@mdi/js';

const search = ref('');
const loading = ref(false);
const customers = ref([]);

const period = ref(30);
const periodOptions = [
  { text: 'Last 7 Days', value: 7 },
  { text: 'Last 30 Days', value: 30 },
  { text: 'Last 3 Months', value: 90 },
  { text: 'Last Year', value: 365 }
];

const headers = [
  { title: 'Name', key: 'name', align: 'start' },
  { title: 'Email', key: 'user__email' },
  { title: 'Phone 1', key: 'user__phone1' },
  { title: 'Phone 2', key: 'user__phone2' },
  { title: 'City', key: 'user__city' },
  { title: 'Address', key: 'user__address' },
  { title: 'Total Spent', key: 'total_spent', align: 'end' },
  { title: 'Orders', key: 'total_orders', align: 'end' },
  { title: 'Last Order', key: 'last_order' }
];

const fetchCustomers = async () => {
  loading.value = true;
  try {
    let rangeStr = '30d';
    if (period.value === 7) rangeStr = '7d';
    else if (period.value === 30) rangeStr = '30d';
    else if (period.value === 90) rangeStr = '3m';
    else if (period.value === 365) rangeStr = '1y';

    const response = await axios.get(`${API_CONFIG.BASE_URL}/crm/customers/?range=${rangeStr}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    });
    customers.value = response.data;
  } catch (error) {
    console.error('Error fetching customers:', error);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const exportData = async (type) => {
    if (type !== 'excel') return;
    try {
        let rangeStr = '30d';
        if (period.value === 7) rangeStr = '7d';
        else if (period.value === 30) rangeStr = '30d';
        else if (period.value === 90) rangeStr = '3m';
        else if (period.value === 365) rangeStr = '1y';

        const response = await axios.get(`${API_CONFIG.BASE_URL}/crm/customers/export/?range=${rangeStr}`, {
            responseType: 'blob',
            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        });
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        
        const contentDisposition = response.headers['content-disposition'];
        let fileName = `customers_export.xlsx`;
        if (contentDisposition) {
            const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
            if (fileNameMatch && fileNameMatch.length === 2) {
                fileName = fileNameMatch[1];
            }
        }
        
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting data:', error);
    }
};

onMounted(() => {
  fetchCustomers();
});
</script>

<style scoped>
:root {
  --card-bg: #1e2438;
}

body.light {
  --card-bg: #ffffff;
}

.bg-dashboard-card {
    background: var(--card-bg) !important;
}

.shadow-sm {
  box-shadow: 0 4px 24px 0 rgba(34, 41, 47, 0.05) !important;
}
.custom-search {
  max-width: 300px;
}
</style>
