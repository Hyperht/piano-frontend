<template>
  <div class="address-form-container">
    <form @submit.prevent="handleSubmit">
      <h3 class="form-title">
        {{ isEditing ? $t("address_form.title_edit") : $t("address_form.title_add") }}
      </h3>

      <div class="form-row">
        <div class="form-group">
          <label for="first_name"
            >{{ $t("address_form.label_first_name") }} <span class="required">*</span></label
          >
          <input
            type="text"
            id="first_name"
            v-model="formData.first_name"
            required
          />
        </div>
        <div class="form-group">
          <label for="last_name">{{ $t("address_form.label_last_name") }}</label>
          <input type="text" id="last_name" v-model="formData.last_name" />
        </div>
      </div>

      <div class="form-group">
        <label for="phone_number"
          >{{ $t("address_form.label_phone_number") }} <span class="required">*</span></label
        >
        <input
          type="tel"
          id="phone_number"
          v-model="formData.phone_number"
          required
        />
      </div>

      <div class="form-group">
        <label for="governorate"
          >{{ $t("address_form.label_governorate") }} <span class="required">*</span></label
        >
        <select
          id="governorate"
          v-model="selectedGovernorateId"
          @change="handleGovernorateChange"
          required
        >
          <option :value="null" disabled>{{ $t("address_form.placeholder_select_governorate") }}</option>
          <option v-for="gov in governorates" :key="gov.id" :value="gov.id">
            {{ gov.name }}
          </option>
        </select>
        <small v-if="governoratesLoading">{{ $t("address_form.loading_governorates") }}</small>
      </div>

      <div class="form-group">
        <label for="area">{{ $t("address_form.label_area") }} <span class="required">*</span></label>
        <select
          id="area"
          v-model="formData.area"
          :disabled="!selectedGovernorateId || areasLoading"
          required
        >
          <option :value="null" disabled>{{ $t("address_form.placeholder_select_area") }}</option>
          <option v-for="area in filteredAreas" :key="area.id" :value="area.id">
            {{ area.name }}{{ $t("address_form.area_shipping_prefix") }}
            {{ parseFloat(area.shipping_cost).toFixed(2) }} EGP{{ $t("address_form.area_shipping_suffix") }}
          </option>
        </select>
        <small v-if="areasLoading">{{ $t("address_form.loading_areas") }}</small>
      </div>

      <div class="form-group">
        <label for="street_address"
          >{{ $t("address_form.label_street_address") }} <span class="required">*</span></label
        >
        <input
          type="text"
          id="street_address"
          v-model="formData.street_address"
          required
        />
      </div>

      <div class="form-group">
        <label for="apartment_details">{{ $t("address_form.label_apartment_details") }}</label>
        <input
          type="text"
          id="apartment_details"
          v-model="formData.apartment_details"
        />
      </div>

      <div class="form-group checkbox-group">
        <input type="checkbox" id="is_default" v-model="formData.is_default" />
        <label for="is_default">{{ $t("address_form.label_default") }}</label>
      </div>

      <div class="form-actions">
        <button type="submit" class="save-btn" :disabled="isSaving">
          {{ isSaving ? $t("address_form.button_saving") : $t("address_form.button_save") }}
        </button>
        <button
          type="button"
          @click="emit('cancel')"
          class="cancel-btn"
          :disabled="isSaving"
        >
          {{ $t("address_form.button_cancel") }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n"; // Must be imported for t()
import api from "@/config/api"; // Your configured Axios client

const props = defineProps({
  initialData: {
    type: Object, // The address object if editing, or null if creating
    default: null,
  },
});

const emit = defineEmits(["address-saved", "cancel"]);
const toast = useToast();
const { t } = useI18n(); // Initialize i18n

// --- STATE ---
const governorates = ref([]);
const allAreas = ref([]);
const governoratesLoading = ref(true);
const areasLoading = ref(true);
const isSaving = ref(false);

// Stores the ID of the governorate selected by the user
const selectedGovernorateId = ref(null);

// Initial form data based on props for editing or creating
const initialFormData = {
  id: props.initialData?.id || null,
  first_name: props.initialData?.first_name || "",
  last_name: props.initialData?.last_name || "",
  phone_number: props.initialData?.phone_number || "",
  street_address: props.initialData?.street_address || "",
  apartment_details: props.initialData?.apartment_details || "",
  // IMPORTANT: 'area' must be the Area ID for the backend
  area: props.initialData?.area?.id || null,
  is_default: props.initialData?.is_default || false,
};
const formData = ref({ ...initialFormData });

// --- COMPUTED PROPERTIES ---
const isEditing = computed(() => !!formData.value.id);

const filteredAreas = computed(() => {
  if (!selectedGovernorateId.value) {
    return [];
  }
  // Filter areas to show only those belonging to the selected governorate
  return allAreas.value.filter((area) => {
    // area.governorate may be an object or an ID; normalize both sides to Number
    const areaGovId =
      area.governorate && typeof area.governorate === "object"
        ? Number(area.governorate.id)
        : Number(area.governorate);
    return areaGovId === Number(selectedGovernorateId.value);
  });
});

// --- DATA FETCHING ---

/** Fetches all Governorates and their related Areas to populate the dropdowns. */
const fetchLocationData = async () => {
  governoratesLoading.value = true;
  areasLoading.value = true;

  try {
    // Fetch Governorates, including their related areas (if serializer supports nested data)
    const govResponse = await api.get("/governorates/");
    governorates.value = govResponse.data;

    // Fetch ALL areas separately (simpler if you have many governorates)
    // This assumes your backend has an endpoint to list all areas.
    const areasResponse = await api.get("/areas/"); // Assuming a /areas/ endpoint exists
    allAreas.value = areasResponse.data;
  } catch (error) {
    console.error("Failed to fetch location data:", error);
    // 💥 Using translation key here
    toast.error(t("address_form.error_location_load"));
  } finally {
    governoratesLoading.value = false;
    areasLoading.value = false;
  }
};

// --- HANDLERS ---

/** Handles the change in Governorate selection. */
const handleGovernorateChange = () => {
  // If the selected governorate changes, the selected area must be reset
  formData.value.area = null;
};

/** Handles the submission of the form to the backend. */
const handleSubmit = async () => {
  isSaving.value = true;

  // 1. Basic Validation (more complex validation should be handled by the backend)
  if (
    !formData.value.first_name ||
    !formData.value.phone_number ||
    !formData.value.area
  ) {
    // 💥 Using translation key here
    toast.error(t("address_form.error_required_fields"));
    isSaving.value = false;
    return;
  }

  // 2. Prepare Payload
  const payload = {
    first_name: formData.value.first_name,
    last_name: formData.value.last_name || "",
    phone_number: formData.value.phone_number,
    street_address: formData.value.street_address,
    apartment_details: formData.value.apartment_details || "",
    // Backend expects `area_id` as the write-only PrimaryKeyRelatedField
    area_id: Number(formData.value.area),
    is_default: formData.value.is_default,
    // The 'user' field is omitted, as your backend sets it automatically from the auth token.
  };

  // 3. Determine API method and endpoint
  let endpoint = `/user/addresses/`;
  let method = "post";

  if (isEditing.value) {
    endpoint = `/user/addresses/${formData.value.id}/`;
    method = "put"; // Use PUT for full update
  }

  try {
    let response;
    if (method === "post") {
      response = await api.post(endpoint, payload);
    } else {
      // Using PUT or PATCH for update
      response = await api.put(endpoint, payload);
    }

    // 4. Emit success event to the parent component (Checkout.vue)
    // response.data contains the validated, saved address object, including its ID.
    emit("address-saved", response.data);
  } catch (error) {
    console.error("Address save failed:", error.response?.data || error);
    const responseData = error.response?.data;
    if (responseData && typeof responseData === "object") {
      const firstKey = Object.keys(responseData)[0];
      const firstMsg = Array.isArray(responseData[firstKey])
        ? responseData[firstKey][0]
        : responseData[firstKey];
      // Note: For now, we display the raw field key and message
      toast.error(`${firstKey}: ${firstMsg}`);
    } else {
      const errorMsg =
        responseData?.detail || t("address_form.error_save_failed"); // 💥 Using translation key here
      toast.error(errorMsg);
    }
  } finally {
    isSaving.value = false;
  }
};

// --- LIFECYCLE ---

onMounted(async () => {
  await fetchLocationData();

  // If editing, find and set the initial governorate ID for dropdown selection
  if (props.initialData && props.initialData.area) {
    // We need to look up the governorate ID associated with the initial area ID
    // Note: This relies on the Area model having a 'governorate' field (which is true based on your backend structure)
    if (props.initialData.area.governorate) {
      selectedGovernorateId.value = props.initialData.area.governorate.id;
    }
  }
});
</script>

<style scoped>
/* Scoped styles for the form */
.address-form-container {
  background-color: #f9f9f9;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.form-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #333;
}

.form-row {
  display: flex;
  gap: 1.5rem;
}

.form-row .form-group {
  flex: 1;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.4rem;
  color: #555;
}

.required {
  color: red;
  font-weight: normal;
}

input[type="text"],
input[type="tel"],
select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  box-sizing: border-box; /* Padding is inside the width */
  transition: border-color 0.2s;
}

input[type="text"]:focus,
input[type="tel"]:focus,
select:focus {
  border-color: #20b486;
  outline: none;
}

small {
  display: block;
  margin-top: 0.2rem;
  color: #999;
}

/* Checkbox group styling */
.checkbox-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  margin-bottom: 2rem;
}

.checkbox-group label {
  margin-bottom: 0;
  font-weight: 400;
  cursor: pointer;
}

.checkbox-group input[type="checkbox"] {
  width: auto;
  height: auto;
}

/* Action Buttons */
.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.save-btn,
.cancel-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  border: none;
}

.save-btn {
  background-color: #20b486;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background-color: #1a9c72;
}

.cancel-btn {
  background-color: #e0e0e0;
  color: #333;
}

.cancel-btn:hover:not(:disabled) {
  background-color: #ccc;
}

.save-btn:disabled,
.cancel-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>