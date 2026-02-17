<template>
  <div>
    <Header />

    <HeroSlider />

    <CategorySlider />

    <PromoBanner />

    <ProductSlider
      :title="$t('home.flash_sales')"
      endpoint="products/?is_on_sale=true"
    />

    <ProductSlider
      :title="$t('home.new_arrivals')"
      endpoint="products/?is_active=true&order_by=-created_at"
    />
    <PromoGrid :promoFilters="promoFilters" />

    <RoomSlider />

    <ProductSlider :title="$t('home.recommended')" endpoint="products" />

    <StyleSlider />
    <ProductGrid :title="$t('home.all')" endpoint="products" />

    <main></main>

    <Footer />
  </div>
</template>

<script setup>
import Header from "./header.vue";
import PromoBanner from "./PromoBanner.vue";
import HeroSlider from "./HeroSlider.vue";
import CategorySlider from "./CategorySlider.vue";
import ProductSlider from "./ProductSlider.vue";
import RoomSlider from "./RoomSlider.vue";
import PromoGrid from "./PromoGrid.vue";
import StyleSlider from "./StyleSlider.vue";
import Footer from "./Footer.vue";
import ProductGrid from "./ProductGrid.vue";

// Define the filters for each promo grid slot (customize as needed)
const promoFilters = [
  { sale_percent: 20 },         // First promo: products with 20% sale or more
  { is_on_sale: 'true' },      // Second promo: show sale items
  { order_by: '-created_at' }, // Third promo: show all products by newest
  { is_on_sale: 'true' },      // Fourth promo: show sale items
];
</script>

<style scoped>
/* No styles needed here, as the components handle their own styling. */
</style>
