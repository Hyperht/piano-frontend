// stores/Location.js

import { defineStore } from "pinia";
import api, { API_CONFIG } from "@/config/api";
import axios from "axios";

// Using centralized API configuration
const API_BASE_URL = API_CONFIG.BASE_URL;

export const useLocationStore = defineStore("location", {
  state: () => ({
    // Stores the nested list: [{ id, name, areas: [{ id, name, shipping_cost }] }]
    governorates: [],
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchGovernorates() {
      if (this.governorates.length > 0) {
        // Prevent re-fetching if data already exists
        return;
      }
      this.isLoading = true;
      this.error = null;
      try {
        // IMPORTANT: Use shared `api` instance so baseURL and headers are consistent
        const response = await api.get("governorates/");
        console.debug("Governorates response (browser):", response.data);
        // Handle paginated DRF response (results) or direct array
        if (Array.isArray(response.data)) {
          this.governorates = response.data;
        } else if (response.data && Array.isArray(response.data.results)) {
          this.governorates = response.data.results;
        } else {
          this.governorates = response.data || [];
        }
      } catch (err) {
        console.error("Failed to fetch governorates (browser):", err);
        if (err.response) {
          console.error("Response status:", err.response.status);
          console.error("Response data:", err.response.data);
        } else if (err.request) {
          console.error("No response received, request:", err.request);
        } else {
          console.error("Request setup error:", err.message);
        }
        this.error = "Could not load shipping locations.";
      } finally {
        this.isLoading = false;
      }
    },

    // Helper function to find the Area object (and its shipping cost) by ID
    getAreaById(areaId) {
      if (areaId === null || areaId === undefined) return null;

      const targetId = Number(areaId);

      // Loop through all governorates and their areas to find the match
      for (const gov of this.governorates) {
        if (!gov.areas || !Array.isArray(gov.areas)) continue;
        const area = gov.areas.find((a) => Number(a.id) === targetId);
        if (area) {
          return area;
        }
      }
      return null;
    },
  },
});
