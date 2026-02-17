<template>
  <v-navigation-drawer
    v-model="customizer.sidebarDrawer"
    :rail="false"
    permanent
    :class="customizer.actTheme === 'darkTheme' ? 'bg-surface' : 'bg-white'"
    elevation="0"
    width="260"
    class="border-e"
  >
    <!-- Sidebar Header (Logo Link) -->
    <template v-slot:prepend>
      <router-link to="/admin" class="text-decoration-none">
          <div class="pa-6 d-flex align-center cursor-pointer">
            <img 
              src="/favicon.png" 
              alt="Piano Logo" 
              style="width: 32px; height: 32px;"
            />
            <span class="ml-3 text-h6 font-weight-bold text-high-emphasis">Piano</span>
          </div>
      </router-link>
    </template>

    <!-- Database CRUD Menu Items (Text Only) -->
    <v-list density="compact" nav class="px-4">
      <div class="text-caption text-medium-emphasis font-weight-bold mb-2 ml-2">MANAGEMENT</div>
      <v-list-item
        v-for="table in customizer.databaseTables"
        :key="table.model"
        :to="`/admin/crud/${table.model.toLowerCase()}`"
        class="mb-1 rounded-lg text-body-2 font-weight-medium"
        :title="table.name"
        :value="table.model"
        active-class="active-item"
      >
      </v-list-item>
    </v-list>

    <!-- Settings / Bottom Actions -->
    <template v-slot:append>
      <div class="pa-2 d-flex flex-column align-center gap-2">
         <v-btn icon variant="text" size="small" @click="customizer.toggleTheme" color="medium-emphasis">
            <i :class="['fa-solid', customizer.actTheme === 'lightTheme' ? 'fa-moon' : 'fa-sun']"></i>
         </v-btn>
         <v-btn icon variant="text" size="small" @click="customizer.toggleRTL" color="medium-emphasis">
            <i class="fa-solid fa-right-left"></i>
         </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup>
import { useAdminStore } from '../store/adminStore';

const customizer = useAdminStore();

// Map MDI icons to FontAwesome for the sidebar
const getIcon = (mdiIcon) => {
    const map = {
        'mdiAccount': 'fa-users',
        'mdiCart': 'fa-cart-shopping',
        'mdiPackageVariant': 'fa-box-open',
        'mdiTagMultiple': 'fa-tags',
        'mdiShape': 'fa-shapes',
        'mdiSofa': 'fa-couch',
        'mdiPalette': 'fa-palette', // Style/Color
        'mdiFormatPaint': 'fa-brush',
        'mdiMapMarker': 'fa-map-pin', // Governorate
        'mdiMap': 'fa-map', // Area
        'mdiHomeMapMarker': 'fa-house-user', // Address
        'mdiTicketPercent': 'fa-ticket',
        'mdiSale': 'fa-percent',
        'mdiViewCarousel': 'fa-images', // Hero
        'mdiViewGrid': 'fa-border-all', // Promo Grid
        'mdiEmailOutline': 'fa-envelope',
        'mdiImage': 'fa-image',
        'mdiHeart': 'fa-heart',
        'mdiCommentText': 'fa-comment',
    };
    return map[mdiIcon] || 'fa-circle';
};
</script>

<style scoped>
.bg-white {
  background-color: #ffffff !important;
}

.bg-surface {
  background-color: #222936 !important;
}

.icon-item {
    transition: all 0.2s ease;
}

.v-list-item--active .fa-lg {
    color: #4680FF !important;
}

.v-list-item--active::before {
    content: '';
    position: absolute;
    left: -4px;
    top: 50%;
    transform: translateY(-50%);
    height: 24px;
    width: 4px;
    background: #4680FF;
    border-radius: 0 4px 4px 0;
}
</style>
