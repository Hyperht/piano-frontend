<template>
  <v-card class="h-100 rounded-xl border-0 shadow-sm" :class="adminStore.actTheme === 'darkTheme' ? 'bg-grey-darken-3' : 'bg-white'">
    <v-card-text class="d-flex flex-column justify-space-between h-100 pa-4">
      <div class="d-flex justify-space-between align-start">
        <div>
          <div class="text-caption text-medium-emphasis mb-1 font-weight-bold">{{ title.toUpperCase() }}</div>
          <div class="text-h4 font-weight-bold text-high-emphasis my-1">{{ value }}</div>
        </div>
        <div class="rounded-circle pa-2 d-flex align-center justify-center" :style="`background-color: ${bg_color}; width: 44px; height: 44px;`">
          <i :class="['fa-solid', icon, 'fa-lg']" :style="`color: ${color};`"></i>
        </div>
      </div>
      
      <div class="d-flex align-center mt-3">
        <v-chip :color="trend > 0 ? 'success' : 'error'" size="x-small" class="font-weight-bold mr-2" label>
          <i :class="['fa-solid', trend > 0 ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down', 'mr-1']"></i>
          {{ Math.abs(trend) }}%
        </v-chip>
        <span class="text-caption text-medium-emphasis">vs last month</span>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { useAdminStore } from '../store/adminStore';
const adminStore = useAdminStore();

defineProps({
  title: String,
  value: [String, Number],
  icon: String,
  color: {
    type: String,
    default: '#4680FF'
  },
  bg_color: {
    type: String,
    default: '#E9F0FF'
  },
  trend: {
    type: Number,
    default: 0
  }
});
</script>

<style scoped>
.shadow-sm {
  box-shadow: 0 4px 24px 0 rgba(34, 41, 47, 0.05) !important;
}
</style>
