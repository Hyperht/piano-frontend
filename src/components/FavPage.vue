<template>
  <div class="favorite-page-container">
    
    <Header />

    <main class="main-content px-4 py-8">
      <div>
        
        <div class="wishlist-header">
          <h1 class="page-title-inline">{{ $t("wishlist.title") }}</h1> 
          <span class="item-count">{{ itemCount }} {{ $t("wishlist.item_count") }}</span> 
        </div>
        
        <ProductGrid 
          endpoint="favorites" 
          :show-title="false" 
          :empty-message="$t('wishlist.empty_message')"
          @items-loaded="updateItemCount" />
      </div>
    </main>
    
    <Footer />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Header from './header.vue';
import Footer from './Footer.vue';
import ProductGrid from './ProductGrid.vue'; 

// --- DYNAMIC ITEM COUNT LOGIC ---
const itemCount = ref(0);

/**
 * Updates the item count displayed in the header.
 * This function is called by the ProductGrid component after data is fetched.
 * @param {number} count The number of products currently in the wishlist.
 */
const updateItemCount = (count) => {
  itemCount.value = count;
};
// --------------------------------
</script>

<style scoped>
/* Basic styling for the page layout. */
.favorite-page-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Updated main-content to take the full width and apply spacing */
.main-content {
  flex-grow: 1;
  /* max-width is effectively 100% now, but retained padding for mobile */
}

/* Styles for the header to match the image */
.wishlist-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end; 
  margin-bottom: 2rem;
}

.page-title-inline {
  font-size: 2rem; 
  font-weight: 700;
  color: #333;
  margin: 0;
  padding: 0;
}

.item-count {
  font-size: 1rem;
  color: #666;
}

/* Ensure responsiveness on smaller screens */
@media (max-width: 640px) {
  .page-title-inline {
    font-size: 1.5rem;
  }
}
</style>