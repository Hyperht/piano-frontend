<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-6">
          <v-btn icon @click="router.back()" class="mr-4">
            <v-icon :icon="mdiArrowLeft"></v-icon>
          </v-btn>
          <h1 class="text-h4 font-weight-bold">Most Wishlisted Products</h1>
          <v-spacer></v-spacer>
        </div>

        <v-card variant="flat" border>
          <v-data-table-server
            v-model:items-per-page="itemsPerPage"
            :headers="headers"
            :items="serverItems"
            :items-length="totalItems"
            :loading="loading"
            @update:options="loadItems"
            hover
          >
            <template v-slot:item.image="{ item }">
              <v-avatar size="48" rounded="lg" class="my-2 border">
                <v-img :src="item.image || '/placeholder-product.png'" cover></v-img>
              </v-avatar>
            </template>

            <template v-slot:item.wishlist_count="{ item }">
              <v-chip size="small" color="error" variant="tonal">
                {{ item.wishlist_count }} Wishlists
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
import { mdiArrowLeft } from '@mdi/js';

const router = useRouter();

const itemsPerPage = ref(10);
const headers = [
  { title: 'Product Image', align: 'start', sortable: false, key: 'image', width: '100px' },
  { title: 'Product Name', align: 'start', sortable: true, key: 'name' },
  { title: 'Wishlist Count', align: 'end', sortable: true, key: 'wishlist_count' },
];

const serverItems = ref([]);
const loading = ref(false);
const totalItems = ref(0);

const loadItems = async ({ page, itemsPerPage }) => {
  loading.value = true;
  try {
    const params = { page, items_per_page: itemsPerPage };
    const resp = await api.get('analytics/top-wishlisted/all/', { params });
    serverItems.value = resp.data.results;
    totalItems.value = resp.data.count;
  } catch (error) {
    console.error('Failed to load top wishlisted products:', error);
  } finally {
    loading.value = false;
  }
};
</script>
