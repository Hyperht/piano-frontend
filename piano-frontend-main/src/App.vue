<script setup>
// You no longer need to import individual page components like LoginPage.
// Vue Router handles this for you.
</script>

<template>
  <router-view :key="$route.fullPath" />
</template>

<style>
/* You can put global styles here if you want them to apply to all pages */
</style>