<template>
  <div>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <div>
          <h2>{{ tableName }}</h2>
          <p class="text-subtitle-2 text-grey">Manage {{ tableName }}</p>
        </div>
        <v-btn color="primary" :prepend-icon="mdiPlus" @click="openCreateDialog">
          Add New
        </v-btn>
         <v-btn color="success" :prepend-icon="mdiFileExcel" class="ml-2" @click="triggerImport">
          Import Excel
        </v-btn>
        <input type="file" ref="fileInput" class="d-none" accept=".xlsx, .xls" @change="handleFileUpload">
      </v-card-title>

      <v-card-text>
        <!-- Search and Filters -->
        <v-text-field
          v-model="search"
          :prepend-inner-icon="mdiMagnify"
          label="Search..."
          single-line
          hide-details
          class="mb-4"
        />

        <!-- Data Table -->
        <v-data-table
          :headers="headers"
          :items="items"
          :loading="loading"
          :search="search"
          class="elevation-1"
        >
          <!-- Action Buttons -->
          <template v-slot:item.actions="{ item }">
            <v-btn
              icon
              size="small"
              @click="openEditDialog(item)"
              color="primary"
              variant="text"
            >
              <v-icon size="small" :icon="mdiPencil"></v-icon>
            </v-btn>
            <v-btn
              icon
              size="small"
              @click="openDeleteDialog(item)"
              color="error"
              variant="text"
            >
              <v-icon size="small" :icon="mdiDelete"></v-icon>
            </v-btn>
          </template>

          <!-- Image Display -->
          <template v-slot:item.image="{ item }">
            <v-avatar v-if="item.image" size="40" class="my-2">
              <v-img :src="getImageUrl(item.image)" />
            </v-avatar>
            <span v-else class="text-grey">No image</span>
          </template>

          <!-- Boolean Display -->
          <template v-slot:item.is_active="{ item }">
            <v-chip :color="item.is_active ? 'success' : 'error'" small>
              {{ item.is_active ? 'Active' : 'Inactive' }}
            </v-chip>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ editMode ? 'Edit' : 'Create' }} {{ modelName }}</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col v-for="field in tableConfig.fields" :key="getFieldKey(field)" cols="12">
                
                <!-- Boolean (Switch) -->
                <v-switch
                  v-if="getFieldType(field) === 'boolean'"
                  v-model="formData[getFieldName(field)]"
                  :label="formatFieldName(getFieldName(field))"
                  color="primary"
                ></v-switch>

                <!-- Select (ForeignKey/Choice) -->
                <v-select
                   v-else-if="getFieldType(field) === 'select'"
                   v-model="formData[getFieldName(field)]"
                   :label="formatFieldName(getFieldName(field))"
                   :items="getOptions(field)"
                   item-title="name"
                   item-value="id"
                   variant="outlined"
                   :multiple="field.multiple"
                ></v-select>

                <!-- File/Image -->
                <v-file-input
                   v-else-if="getFieldType(field) === 'image' || getFieldType(field) === 'file'"
                   v-model="formData[getFieldName(field)]"
                   :label="formatFieldName(getFieldName(field))"
                   variant="outlined"
                   :prepend-icon="mdiCamera"
                ></v-file-input>

                <!-- Textarea -->
                <v-textarea
                   v-else-if="getFieldType(field) === 'textarea'"
                   v-model="formData[getFieldName(field)]"
                   :label="formatFieldName(getFieldName(field))"
                   variant="outlined"
                   rows="3"
                ></v-textarea>

                <!-- Default Text Field -->
                <v-text-field
                  v-else
                  v-model="formData[getFieldName(field)]"
                  :label="formatFieldName(getFieldName(field))"
                  :placeholder="field.placeholder"
                  variant="outlined"
                  :type="getFieldType(field) === 'number' ? 'number' : 'text'"
                />
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="closeDialog">Cancel</v-btn>
          <v-btn color="primary" @click="saveItem">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h5">Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete this {{ modelName }}?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="confirmDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
        {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'; // Added watch
import { useRoute } from 'vue-router';
import { useAdminStore } from '../store/adminStore';
import axios from 'axios';
import { API_CONFIG } from '@/config/api';
import { mdiPlus, mdiFileExcel, mdiMagnify, mdiPencil, mdiDelete, mdiCamera } from '@mdi/js';

const route = useRoute();
const adminStore = useAdminStore();

// Get table configuration from route parameter
const modelParam = computed(() => route.params.model);
const tableConfig = computed(() => {
  return adminStore.databaseTables.find(
    table => table.model.toLowerCase() === modelParam.value
  );
});

const tableName = computed(() => tableConfig.value?.name || 'Table');
const modelName = computed(() => tableConfig.value?.model || 'Item');

// Data state
const items = ref([]);
const loading = ref(false);
const search = ref('');
const fileInput = ref(null);
const snackbar = ref({ show: false, text: '', color: 'success' });

// Dialog state
const dialog = ref(false);
const deleteDialog = ref(false);
const editMode = ref(false);
const formData = ref({});
const currentItem = ref(null);

// Helper to handle both string and object field configs
const getFieldKey = (field) => typeof field === 'string' ? field : field.name;
const getFieldName = (field) => typeof field === 'string' ? field : field.name;
const getFieldType = (field) => typeof field === 'string' ? 'text' : (field.type || 'text');

// Options for select fields (mocked or loaded)
const optionsCache = ref({});

const getOptions = (field) => {
    if (!field.endpoint) return field.options || [];
    return optionsCache.value[field.name] || [];
};

const loadOptions = async (field) => {
    if (field.type === 'select' && field.endpoint) {
         try {
             const { data } = await axios.get(`${API_CONFIG.BASE_URL}${field.endpoint}`, { withCredentials: true });
             // Check if data is array or pagination result
             optionsCache.value[field.name] = Array.isArray(data) ? data : (data.results || []);
         } catch (e) {
             console.error(`Failed to load options for ${field.name}`, e);
         }
    }
};

// Watch tableConfig to load options
watch(() => tableConfig.value, async (newConfig) => {
    if (newConfig && newConfig.fields) {
        newConfig.fields.forEach(f => {
            if (typeof f === 'object' && f.type === 'select') {
                loadOptions(f);
            }
        });
    }
}, { immediate: true });

// Watch for category changes to filter subcategories
watch(() => formData.value.category, async (newCategoryId) => {
    // Only proceed if we are editing the Product model and have a category
    if (tableConfig.value?.model === 'Product' && newCategoryId) {
        try {
            // Find the subcategory field config
            const subField = tableConfig.value.fields.find(f => f.name === 'subcategory');
            if (subField) {
                // Fetch subcategories filtered by parent_category
                const { data } = await axios.get(`${API_CONFIG.BASE_URL}/dashboard/subcategories/?parent_category=${newCategoryId}`, { withCredentials: true });
                optionsCache.value['subcategory'] = Array.isArray(data) ? data : (data.results || []);
                
                // Clear selected subcategory if it doesn't belong to new category
                // We check if current subcategory ID is in the new options
                const currentSubId = formData.value.subcategory;
                if (currentSubId) {
                    const isValid = optionsCache.value['subcategory'].some(opt => opt.id === currentSubId);
                    if (!isValid) {
                        formData.value.subcategory = null;
                    }
                }
            }
        } catch (e) {
            console.error('Failed to filter subcategories', e);
        }
    }
});

// Table headers
const headers = computed(() => {
  if (!tableConfig.value) return [];
  
  const fieldHeaders = tableConfig.value.fields.map(field => {
    const name = getFieldName(field);
    return {
        title: formatFieldName(name),
        key: name,
        sortable: true
    };
  });

  return [
    ...fieldHeaders,
    { title: 'Actions', key: 'actions', sortable: false }
  ];
});

// Format field names for display
const formatFieldName = (field) => {
  const name = typeof field === 'string' ? field : field.name;
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
};

// Get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_CONFIG.BASE_URL}${imagePath}`;
};

// Fetch items from API
const fetchItems = async () => {
  if (!tableConfig.value) return;
  
  loading.value = true;
  try {
    const response = await axios.get(
      `${API_CONFIG.BASE_URL}${tableConfig.value.endpoint}`,
      { withCredentials: true }
    );
    items.value = response.data.results || response.data || [];
  } catch (error) {
    console.error('Error fetching items:', error);
    items.value = [];
  } finally {
    loading.value = false;
  }
};

// Dialog handlers
const openCreateDialog = () => {
  editMode.value = false;
  formData.value = {};
  dialog.value = true;
};

const openEditDialog = (item) => {
  editMode.value = true;
  currentItem.value = item;
  formData.value = { ...item };
  dialog.value = true;
};

const openDeleteDialog = (item) => {
  currentItem.value = item;
  deleteDialog.value = true;
};

const closeDialog = () => {
  dialog.value = false;
  formData.value = {};
  currentItem.value = null;
};

// Save item (create or update)
// Save item (create or update)
const saveItem = async () => {
  if (!tableConfig.value) return;

  try {
    let payload = formData.value;
    let headers = { withCredentials: true };

    // Check if we need multipart/form-data (for images/files)
    const hasFileField = tableConfig.value.fields.some(f => 
        (typeof f === 'object' && (f.type === 'image' || f.type === 'file'))
    );

    if (hasFileField) {
        const payloadFormData = new FormData();
        for (const key in formData.value) {
            const value = formData.value[key];
            if (value !== null && value !== undefined) {
                // If it's a file object (raw upload), append it
                if (value instanceof File) {
                    payloadFormData.append(key, value);
                } 
                // If it's a list (e.g. m2m ids), append each
                else if (Array.isArray(value)) {
                    value.forEach(v => payloadFormData.append(key, v));
                }
                // Determine if it's an existing image URL string - DO NOT append if unmodified
                // DRF will ignore if we don't send it, keeping existing.
                // If we send string URL to ImageField, it might error.
                else if ((typeof value === 'string') && value.startsWith('http')) {
                    // Skip existing image URLs
                    continue;
                }
                else if ((typeof value === 'string') && value.startsWith('/media')) {
                    // Skip existing image paths
                    continue;
                }
                else {
                     payloadFormData.append(key, value);
                }
            }
        }
        payload = payloadFormData;
        headers.headers = { 'Content-Type': 'multipart/form-data' };
    }

    if (editMode.value && currentItem.value) {
      // Update
      await axios.put(
        `${API_CONFIG.BASE_URL}${tableConfig.value.endpoint}${currentItem.value.id}/`,
        payload,
        headers
      );
    } else {
      // Create
      await axios.post(
        `${API_CONFIG.BASE_URL}${tableConfig.value.endpoint}`,
        payload,
        headers
      );
    }
    
    closeDialog();
    fetchItems();
  } catch (error) {
    console.error('Error saving item:', error);
    snackbar.value = { 
        show: true, 
        text: 'Save failed: ' + (error.response?.data?.detail || error.message || 'Unknown error'), 
        color: 'error' 
    };
  }
};

// Delete item
const confirmDelete = async () => {
  if (!tableConfig.value || !currentItem.value) return;

  try {
    await axios.delete(
      `${API_CONFIG.BASE_URL}${tableConfig.value.endpoint}${currentItem.value.id}/`,
      { withCredentials: true }
    );
    
    deleteDialog.value = false;
    currentItem.value = null;
    fetchItems();
  } catch (error) {
    console.error('Error deleting item:', error);
  }
};

// Import handlers
const triggerImport = () => {
  fileInput.value.click();
};

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);
  
  loading.value = true;
  try {
    // Construct URL: /dashboard/import/<model_name>/
    // We use the raw model name from the route or config
    await axios.post(
      `${API_CONFIG.BASE_URL}/dashboard/import/${modelName.value}/`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      }
    );
    
    snackbar.value = { show: true, text: 'Import successful', color: 'success' };
    fetchItems();
  } catch (error) {
    console.error('Import failed:', error);
    snackbar.value = { show: true, text: 'Import failed: ' + (error.response?.data?.error || error.message), color: 'error' };
  } finally {
    loading.value = false;
    event.target.value = ''; // Reset input
  }
};

// Initialize
onMounted(() => {
  fetchItems();
});
</script>
