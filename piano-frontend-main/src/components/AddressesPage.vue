<template>
  <div>
    <Header />

    <main class="addresses-page">
      <div class="addresses-container">
        <h2>{{ $t("addresses.title") }}</h2>
        <AddressShow />
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import Header from "./header.vue";
import Footer from "./Footer.vue";
import AddressShow from "./addresshow.vue";
</script>

<style scoped>
.addresses-page {
  padding: 2rem;
}
.address-card {
  border: 1px solid #eee;
  padding: 1rem;
  margin-bottom: 0.75rem;
  border-radius: 6px;
}
.address-actions {
  margin-top: 0.5rem;
  display: flex;
  gap: 8px;
}
.primary {
  background: #20b486;
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
}
.danger {
  background: #e74c3c;
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
}
.form-area {
  margin-top: 1.25rem;
}
</style>
