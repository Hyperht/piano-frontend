<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-6">
          <v-btn icon @click="router.back()" class="mr-4">
            <v-icon :icon="mdiArrowLeft"></v-icon>
          </v-btn>
          <h1 class="text-h4 font-weight-bold">Top Performing Products</h1>
          <v-spacer></v-spacer>
          <v-btn-group>
            <v-btn
              :prepend-icon="mdiExport"
              color="primary"
              variant="flat"
              @click="exportData"
              :loading="exportLoading"
            >
              Export Excel
            </v-btn>
          </v-btn-group>
        </div>

        <v-card variant="flat" border>
          <v-data-table-server
            v-model:items-per-page="itemsPerPage"
            :headers="headers"
            :items="serverItems"
            :items-length="totalItems"
            :loading="loading"
            :search="search"
            item-value="name"
            @update:options="loadItems"
            hover
          >
            <template v-slot:item.image="{ item }">
              <v-avatar size="48" rounded="lg" class="my-2 border">
                <v-img :src="getImageUrl(item.image) || '/placeholder-product.png'" cover></v-img>
              </v-avatar>
            </template>

            <template v-slot:item.revenue="{ item }">
              <span class="font-weight-bold">{{ formatPrice(item.revenue) }} EGP</span>
            </template>

            <template v-slot:item.sales_count="{ item }">
              <v-chip size="small" color="primary" variant="tonal">
                {{ item.sales_count }} Units
              </v-chip>
            </template>
          </v-data-table-server>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/config/api';
import { API_CONFIG } from '@/config/api';
import { mdiArrowLeft, mdiExport } from '@mdi/js';

const router = useRouter();

const itemsPerPage = ref(10);
const headers = [
  { title: 'Product Image', align: 'start', sortable: false, key: 'image', width: '100px' },
  { title: 'Product Name', align: 'start', sortable: true, key: 'name' },
  { title: 'Units Sold', align: 'end', sortable: true, key: 'sales_count' },
  { title: 'Total Revenue', align: 'end', sortable: true, key: 'revenue' },
];

const serverItems = ref([]);
const loading = ref(false);
const totalItems = ref(0);
const search = ref('');
const exportLoading = ref(false);

const loadItems = async ({ page, itemsPerPage, sortBy }) => {
  loading.value = true;
  try {
    const params = {
      page,
      items_per_page: itemsPerPage,
    };
    
    const resp = await api.get('analytics/top-products/all/', { params });
    serverItems.value = resp.data.results;
    totalItems.value = resp.data.count;
  } catch (error) {
    console.error('Failed to load top products:', error);
  } finally {
    loading.value = false;
  }
};

const formatPrice = (val) => {
  return new Intl.NumberFormat('en-EG').format(val);
};

const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  const baseUrl = API_CONFIG.BASE_URL.replace(/\/api$/, '') || '';
  return `${baseUrl}${imagePath}`;
};

const exportData = async () => {
    // Basic export implementation (could be expanded to call backend export)
    window.location.href = api.defaults.baseURL + '/analytics/top-products/all/?export=excel';
};
</script>
