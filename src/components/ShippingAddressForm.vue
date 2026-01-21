<template>
  <div class="shipping-address-container">
    <h2 class="shipping-address-title">{{ $t("address.form.title") }}</h2>

    <div v-if="locationStore.isLoading" class="loading-state">
      <p>{{ $t('general.loading_locations') }}</p>
    </div>
    <div v-else-if="locationStore.error" class="error-state">
      <p class="error-message">{{ locationStore.error }}</p>
    </div>

    <form @submit.prevent="submitAddress">
      <div class="form-row">
        <input
          type="text"
          v-model="form.firstName"
          :placeholder="$t('address.form.placeholder.first_name')"
          class="form-input"
          required
        />
        <input
          type="text"
          v-model="form.lastName"
          :placeholder="$t('address.form.placeholder.last_name')"
          class="form-input"
          required
        />
      </div>

      <div class="form-row">
        <input
          type="tel"
          v-model="form.phoneNumber"
          :placeholder="$t('address.form.placeholder.phone')"
          class="form-input full-width"
          required
        />
      </div>

      <div class="form-row">
        <select
          v-model="form.governorateId"
          @change="resetArea"
          class="form-input"
          :disabled="
            !locationStore.governorates.length || locationStore.isLoading
          "
          required
        >
          <option :value="null" disabled>{{ $t("address.form.select.governorate") }}</option>
          <option
            v-for="gov in locationStore.governorates"
            :key="gov.id"
            :value="Number(gov.id)"
          >
            {{ gov.name }}
          </option>
        </select>

        <select
          v-model="form.areaId"
          class="form-input"
          :disabled="!availableAreas.length"
          required
        >
          <option :value="null" disabled>{{ $t("address.form.select.area") }}</option>
          <option
            v-for="area in availableAreas"
            :key="area.id"
            :value="Number(area.id)"
          >
            {{ area.name }} ({{ $t('address.form.shipping_cost_label', { cost: area.shipping_cost, currency: 'EGP' }) }})
          </option>
        </select>
      </div>

      <div class="form-row">
        <input
          type="text"
          v-model="form.streetAddress"
          :placeholder="$t('address.form.placeholder.street')"
          class="form-input full-width"
          required
        />
      </div>

      <div class="form-row">
        <input
          type="text"
          v-model="form.apartmentDetails"
          :placeholder="$t('address.form.placeholder.apartment')"
          class="form-input full-width"
        />
      </div>

      <div class="form-checkbox">
        <input type="checkbox" id="use-as-shipping" v-model="form.isDefault" />
        <label for="use-as-shipping">{{ $t("address.form.default_checkbox") }}</label>
      </div>

      <button type="submit" class="save-address-btn">
        {{ $t("address.form.save_button") }}
      </button>
    </form>

    </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useLocationStore } from "@/stores/Location";
import { useToast } from "vue-toastification";
import api from "@/config/api";
import { useI18n } from 'vue-i18n'; // Added i18n

// 1. Define the emitted event
const emit = defineEmits(["address-saved"]);

// Initialize Pinia Store, Toast, and i18n
const locationStore = useLocationStore();
const toast = useToast();
const { t } = useI18n(); // Initialized i18n

// 2. FORM STATE (Same as before)
const form = ref({
  firstName: "",
  lastName: "",
  phoneNumber: "",
  governorateId: null,
  areaId: null,
  streetAddress: "",
  apartmentDetails: "",
  isDefault: false,
});

// 3. LIFECYCLE: Fetch data when component is mounted
onMounted(async () => {
  governoratesLoading.value = true;
  areasLoading.value = true;
  try {
    await locationStore.fetchGovernorates();
    // Fetch flat areas list (similar to AddressList.vue)
    const areasResp = await api.get("areas/");
    if (Array.isArray(areasResp.data)) allAreas.value = areasResp.data;
    else if (areasResp.data && Array.isArray(areasResp.data.results))
      allAreas.value = areasResp.data.results;
    else allAreas.value = areasResp.data || [];
  } catch (e) {
    console.error(
      "Failed to load governorates/areas in ShippingAddressForm:",
      e
    );
  } finally {
    governoratesLoading.value = false;
    areasLoading.value = false;
  }
});

// 4. CASCADING LOGIC: fetch flat areas list and filter by governorate
const allAreas = ref([]);
const governoratesLoading = ref(false);
const areasLoading = ref(false);

const availableAreas = computed(() => {
  const govIdRaw = form.value.governorateId;
  const govId =
    govIdRaw === null || govIdRaw === undefined ? null : Number(govIdRaw);
  if (!govId) return [];

  // Prefer flat allAreas list if available
  if (allAreas.value && allAreas.value.length > 0) {
    return allAreas.value.filter((area) => {
      const areaGov = area.governorate;
      const areaGovId =
        areaGov && typeof areaGov === "object"
          ? Number(areaGov.id)
          : Number(areaGov);
      return areaGovId === govId;
    });
  }

  // Fallback: if allAreas is empty, try the nested governorates array from the store
  const gov = locationStore.governorates.find((g) => Number(g.id) === govId);
  if (gov && Array.isArray(gov.areas)) {
    return gov.areas.map((a) => ({
      ...a,
      governorate: { id: gov.id, name: gov.name },
    }));
  }

  return [];
});

const resetArea = () => {
  form.value.areaId = null;
};

const currentShippingCost = computed(() => {
  return locationStore.getAreaById(form.value.areaId)?.shipping_cost || "0.00";
});

// 5. FORM SUBMISSION (Crucial Update)
const submitAddress = async () => {
  if (!form.value.areaId) {
    // Translate toast error
    toast.error(t("address.form.validation.area_required"));
    return;
  }

  // Prepare data for API
  const addressPayload = {
    first_name: form.value.firstName,
    last_name: form.value.lastName,
    phone_number: form.value.phoneNumber,
    street_address: form.value.streetAddress,
    apartment_details: form.value.apartmentDetails,
    // Backend expects `area_id` (PrimaryKeyRelatedField write-only)
    area_id: Number(form.value.areaId),
    is_default: form.value.isDefault,
  };

  // --- Mock API Call (Replace this with your actual axios.post/put) ---
  // Simulate a successful API response by finding the full nested objects
  const selectedArea = locationStore.getAreaById(form.value.areaId);
  const selectedGov = locationStore.governorates.find(
    (g) => Number(g.id) === Number(form.value.governorateId)
  );

  const savedAddressData = {
    id: Math.floor(Math.random() * 1000), // Mock ID
    ...addressPayload,
    // Replace the ID with the full nested objects for the presentation layer
    area: selectedArea,
    governorate: selectedGov,
  };

  // 6. Emit the full saved data to the parent component
  emit("address-saved", savedAddressData);

  // Translate toast success message
  toast.success(
    t('address.form.success_toast', { cost: currentShippingCost.value, currency: 'EGP' })
  );
  // --- End Mock API Call ---
};
</script>

<style scoped>
.shipping-address-container {
  background: #fdfdfd;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.shipping-address-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 2rem;
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: #f7931e; /* Highlight on focus */
  outline: none;
}

.form-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.form-input.full-width {
  flex: none;
  width: 100%;
}

.form-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.form-checkbox input[type="checkbox"] {
  accent-color: #20b486;
  transform: scale(1.2);
}

.save-address-btn {
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #20b486;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;
}

.save-address-btn:hover {
  background-color: #1a9c72;
}

/* Loading/Error Styles */
.loading-state,
.error-state {
  padding: 1rem;
  text-align: center;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-weight: 500;
}

.loading-state {
  background-color: #e6f7ff;
  color: #1890ff;
}

.error-state {
  background-color: #fff1f0;
  border: 1px solid #ffccc7;
}

.error-message {
  color: #cf1322;
  font-weight: bold;
}
</style>