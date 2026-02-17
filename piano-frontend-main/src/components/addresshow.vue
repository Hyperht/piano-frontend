<template>
  <main class="addresses-page">
    <div class="addresses-container">
      <div v-if="loading" class="loading">{{ $t("addresses.loading") }}</div>

      <div v-else>
        <div v-if="addresses.length > 0" class="addresses-list">
          <div v-for="addr in addresses" :key="addr.id" class="address-card">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div>
                <p class="name">{{ addr.first_name }} {{ addr.last_name }}</p>
                <p class="phone">{{ addr.phone_number }}</p>
                <p class="street">{{ addr.street_address }}</p>
                <p class="area">{{ addr.area?.name || addr.area }}</p>
              </div>
              <div>
                <label style="display: flex; align-items: center; gap: 0.5em; cursor: pointer;">
                  <input
                    type="checkbox"
                    :checked="addr.is_default"
                    @change="setDefaultAddress(addr)"
                    :disabled="addr.is_default"
                  />
                  <span>{{ $t("addresses.default_location") }}</span>
                </label>
              </div>
            </div>
            <div class="address-actions">
              <button @click="onEdit(addr)">
                {{ $t("addresses.edit") }}
              </button>
              <button @click="onDelete(addr)" class="danger">
                {{ $t("addresses.delete") }}
              </button>
            </div>
          </div>
        </div>

        <div v-else class="no-addresses">
          <p>{{ $t("addresses.empty") }}</p>
        </div>

        <div class="form-area">
          <AddressList
            v-if="showForm"
            :initialData="addressToEdit"
            @address-saved="handleSaved"
            @cancel="handleCancel"
          />

          <div v-else>
            <button @click="startAdd" class="primary">
              {{ $t("addresses.add_new") }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>


<script setup>
import { ref, onMounted } from "vue";
import AddressList from "./AddressList.vue";
import api from "@/config/api";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth";

const toast = useToast();
const { t } = useI18n();
const authStore = useAuthStore();

const addresses = ref([]);
const loading = ref(true);
const showForm = ref(false);
const addressToEdit = ref(null);

const fetchAddresses = async () => {
  loading.value = true;
  try {
    const resp = await api.get("/user/addresses/");
    addresses.value = resp.data || [];
  } catch (err) {
    console.error("Failed to fetch addresses:", err);
    toast.error(t("addresses.fetch_error"));
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (!authStore.isAuthenticated) {
    toast.error(t("addresses.auth_required"));
  }
  fetchAddresses();
});

const startAdd = () => {
  addressToEdit.value = null;
  showForm.value = true;
};

const onEdit = (addr) => {
  addressToEdit.value = addr;
  showForm.value = true;
};

const onDelete = async (addr) => {
  if (!confirm(t("addresses.confirm_delete"))) return;
  try {
    await api.delete(`/user/addresses/${addr.id}/`);
    toast.success(t("addresses.deleted"));
    await fetchAddresses();
  } catch (err) {
    console.error("Failed to delete address:", err);
    toast.error(t("addresses.delete_failed"));
  }
};

const handleSaved = async (saved) => {
  showForm.value = false;
  addressToEdit.value = null;
  await fetchAddresses();
  toast.success(t("addresses.saved"));
};

const handleCancel = () => {
  showForm.value = false;
  addressToEdit.value = null;
};

// Set default address handler
const setDefaultAddress = async (addr) => {
  if (addr.is_default) return; // Already default
  try {
    await api.post(`/user/addresses/${addr.id}/set_default/`);
    toast.success(t("addresses.set_default_success"));
    await fetchAddresses();
  } catch (err) {
    console.error("Failed to set default address:", err);
    toast.error(t("addresses.set_default_failed"));
  }
};
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

.address-card input[type="checkbox"] {
  width: 18px;
  height: 18px;
}
</style>
