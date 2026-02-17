import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
// import vueDevTools from "vite-plugin-vue-devtools";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), /* vueDevTools() */],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 3001,
    proxy: {
      "/api": {
        target: "beanomart.com",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
      "/accounts": {
        target: "beanomart.com",
        changeOrigin: true,
        secure: false,
      },
      "/media": {
        target: "beanomart.com",
        changeOrigin: true,
        secure: false,
      },
      "/static": {
        target: "beanomart.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
