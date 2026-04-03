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
                <div v-else-if="getFieldType(field) === 'image' || getFieldType(field) === 'file'" class="w-100">
                   <!-- Show existing image preview if editing and value is a string -->
                   <div v-if="typeof formData[getFieldName(field)] === 'string' && formData[getFieldName(field)]" class="mb-4 d-flex align-center gap-4">
                       <v-avatar size="64" rounded class="border">
                           <v-img :src="getImageUrl(formData[getFieldName(field)])"></v-img>
                       </v-avatar>
                       <v-btn size="small" variant="outlined" color="primary" @click="formData[getFieldName(field)] = null">Change Image / File</v-btn>
                   </div>
                   <!-- File input for new upload -->
                   <v-file-input
                      v-else
                      v-model="formData[getFieldName(field)]"
                      :label="formatFieldName(getFieldName(field))"
                      variant="outlined"
                      :prepend-icon="mdiCamera"
                      :accept="getFieldType(field) === 'image' ? 'image/*' : '*/*'"
                   ></v-file-input>
                </div>

                <!-- Textarea -->
                <v-textarea
                   v-else-if="getFieldType(field) === 'textarea'"
                   v-model="formData[getFieldName(field)]"
                   :label="formatFieldName(getFieldName(field))"
                   variant="outlined"
                   rows="3"
                ></v-textarea>

                <!-- Date / DateTime -->
                <v-text-field
                  v-else-if="getFieldType(field) === 'date' || getFieldType(field) === 'datetime'"
                  v-model="formData[getFieldName(field)]"
                  :label="formatFieldName(getFieldName(field))"
                  variant="outlined"
                  :type="getFieldType(field) === 'date' ? 'date' : 'datetime-local'"
                />

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
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAdminStore } from '../store/adminStore';
import api from '@/config/api'; // Pre-configured: Bearer token + CSRF interceptors
import { API_CONFIG } from '@/config/api'; // Only used for image URL building
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
            // field.endpoint = '/dashboard/vendors/' — api baseURL = '/api'
            // Final URL: /api/dashboard/vendors/  ✓
            const { data } = await api.get(field.endpoint);
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
    if (tableConfig.value?.model !== 'Product') return;

    if (newCategoryId) {
        try {
            const { data } = await api.get(
                `/dashboard/subcategories/?parent_category=${newCategoryId}`
            );
            optionsCache.value['subcategory'] = Array.isArray(data) ? data : (data.results || []);

            // Clear subcategory if it no longer belongs to new category
            const currentSubId = formData.value.subcategory;
            if (currentSubId) {
                const isValid = optionsCache.value['subcategory'].some(opt => opt.id === currentSubId);
                if (!isValid) formData.value.subcategory = null;
            }
        } catch (e) {
            console.error('Failed to filter subcategories', e);
        }
    } else {
        // No category selected → clear subcategory options and selection
        optionsCache.value['subcategory'] = [];
        formData.value.subcategory = null;
    }
});

// Slugifier helper: converts "My Category" to "my-category"
const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w-]+/g, '')  // Remove all non-word chars
        .replace(/--+/g, '-');    // Replace multiple - with single -
};

// Watch name field to auto-generate slug (only in Create mode or if slug is empty)
watch(() => formData.value.name, (newName) => {
    const modelsWithSlug = ['category', 'subcategory', 'product']; // Standardize
    if (modelsWithSlug.includes(tableConfig.value?.model.toLowerCase()) && newName) {
        // Auto-fill only if slug is currently empty to avoid overwriting manual edits
        if (!formData.value.slug) {
            formData.value.slug = slugify(newName);
        }
    }
});

// Table headers — uses tableColumns (readable display) if defined, else falls back to fields
const headers = computed(() => {
  if (!tableConfig.value) return [];

  // tableColumns = explicit list of column keys to show in the data table
  // fields = used only for the edit/create form
  const columnKeys = tableConfig.value.tableColumns || tableConfig.value.fields.map(getFieldName);

  const fieldHeaders = columnKeys.map(key => ({
    title: formatFieldName(key),
    key,
    sortable: true,
  }));

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
    const response = await api.get(tableConfig.value.endpoint);
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

const openEditDialog = async (item) => {
  editMode.value = true;
  currentItem.value = item;

  // Wait for ALL select options to load before opening the dialog.
  // This ensures vendor/category/etc. always display their NAME, never a raw ID.
  if (tableConfig.value?.fields) {
    const selectFields = tableConfig.value.fields.filter(
      f => typeof f === 'object' && f.type === 'select'
    );
    await Promise.all(selectFields.map(f => loadOptions(f)));
  }

  // Normalize the item before spreading — ensures M2M fields are ID arrays,
  // not arrays of objects (which DRF rejects).
  const normalized = {};
  for (const [key, value] of Object.entries(item)) {
    // 1. Handle M2M
    if (Array.isArray(value)) {
      normalized[key] = value.map(v => (typeof v === 'object' && v !== null && 'id' in v) ? v.id : v);
    } 
    // 2. Handle FK
    else if (typeof value === 'object' && value !== null && 'id' in value) {
      normalized[key] = value.id;
    } 
    // 3. Handle Date/DateTime formatting for HTML5 inputs
    else if (value && typeof value === 'string') {
        const fieldConfig = tableConfig.value.fields.find(f => (typeof f === 'string' ? f : f.name) === key);
        const type = fieldConfig && typeof fieldConfig === 'object' ? fieldConfig.type : null;
        
        if (type === 'datetime') {
            normalized[key] = value.substring(0, 16);
        } else if (type === 'date') {
            normalized[key] = value.substring(0, 10);
        } else {
            normalized[key] = value;
        }
    }
    else {
      normalized[key] = value;
    }
  }

  formData.value = normalized;

  // Initialize subcategory filter for the item's current category
  if (normalized.category && tableConfig.value?.model === 'Product') {
    try {
      const { data } = await api.get(
        `/dashboard/subcategories/?parent_category=${normalized.category}`
      );
      optionsCache.value['subcategory'] = Array.isArray(data) ? data : (data.results || []);
    } catch (e) {
      console.warn('Could not pre-filter subcategories', e);
    }
  }

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

// Image compression helper
const compressImage = (file) => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        const MAX_SIZE = 1200;
        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round(height * (MAX_SIZE / width));
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round(width * (MAX_SIZE / height));
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            const newName = file.name.replace(/\.[^/.]+$/, "") + ".jpeg";
            const newFile = new File([blob], newName, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(newFile);
          } else {
            resolve(file);
          }
        }, 'image/jpeg', 0.85);
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

// Save item (create or update)
const saveItem = async () => {
  if (!tableConfig.value) return;

  try {
    let payload = formData.value;

    // Check if we need multipart/form-data (for images/files)
    const hasFileField = tableConfig.value.fields.some(f =>
        (typeof f === 'object' && (f.type === 'image' || f.type === 'file'))
    );

    if (hasFileField) {
        const fd = new FormData();
        for (const key in formData.value) {
            const value = formData.value[key];
            if (value === null || value === undefined) continue;

            if (value instanceof File) {
                const processedFile = value.type.startsWith('image/') ? await compressImage(value) : value;
                fd.append(key, processedFile);
            } 
            else if (Array.isArray(value)) {
                for (const v of value) {
                    if (v instanceof File) {
                        const processedFile = v.type.startsWith('image/') ? await compressImage(v) : v;
                        fd.append(key, processedFile);
                    } else {
                        fd.append(key, v);
                    }
                }
            }
            else if ((typeof value === 'string') && (value.startsWith('http') || value.startsWith('/media'))) {
                continue;
            }
            else {
                 fd.append(key, value);
            }
        }
        payload = fd;
    }

    if (editMode.value && currentItem.value) {
      await api.put(
        `${tableConfig.value.endpoint}${currentItem.value.id}/`,
        payload,
        hasFileField ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
      );
    } else {
      await api.post(
        tableConfig.value.endpoint,
        payload,
        hasFileField ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
      );
    }
    
    snackbar.value = { show: true, text: 'Saved successfully!', color: 'success' };
    closeDialog();
    fetchItems();
  } catch (error) {
    console.error('Error saving item:', error);
    // Show the full serializer error, not just error.detail
    const errorData = error.response?.data;
    let errorText = 'Save failed';
    if (errorData && typeof errorData === 'object') {
      // Build readable list from DRF field errors e.g. {name: ['This field required']}
      errorText = Object.entries(errorData)
        .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
        .join(' | ');
    } else if (typeof errorData === 'string') {
      errorText = errorData;
    } else {
      errorText = error.message || 'Unknown error';
    }
    snackbar.value = { show: true, text: errorText, color: 'error' };
  }
};

const confirmDelete = async () => {
  if (!tableConfig.value || !currentItem.value) return;
  try {
    await api.delete(`${tableConfig.value.endpoint}${currentItem.value.id}/`);
    deleteDialog.value = false;
    currentItem.value = null;
    snackbar.value = { show: true, text: 'Deleted successfully', color: 'success' };
    fetchItems();
  } catch (error) {
    console.error('Error deleting item:', error);
    snackbar.value = { show: true, text: 'Delete failed: ' + (error.response?.data?.detail || error.message), color: 'error' };
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
    await api.post(
      `/dashboard/import/${modelName.value}/`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
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
