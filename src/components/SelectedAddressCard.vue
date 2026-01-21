<template>
  <div class="address-display-card">
    <div class="address-box">
      <div class="tracking-line">
        <div class="dot start-dot"></div>
        <div class="dot end-dot"></div>
      </div>

      <div class="address-content">
        <span class="delivery-title">
          {{ $t('address.card.deliver_to', { 
            governorate: address.governorate?.name || $t('address.card.default_governorate') 
          }) }}
        </span>
        
        <span 
          class="edit-icon" 
          @click="$emit('edit', address.id)"
          :aria-label="$t('address.card.edit_address')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M21.731 2.269a2.25 2.25 0 0 0-3.182 0l-12.66 12.66a2.25 2.25 0 0 0-.58 1.43l-.38 4.614a.75.75 0 0 0 .918.918l4.614-.38a2.25 2.25 0 0 0 1.43-.58l12.66-12.66a2.25 2.25 0 0 0 0-3.182l-1.47-1.47Z" />
          </svg>
        </span>
        
        <div class="details">
          <p class="main-line">
            {{ address.street_address }} 
            {{ address.apartment_details ? $t('address.card.separator') + ' ' + address.apartment_details : '' }}
            {{ $t('address.card.separator') }} {{ address.area?.name }} 
            {{ $t('address.card.separator') }} {{ address.governorate?.name }}
          </p>
          <p class="phone-line">{{ address.phone_number }}</p>
        </div>
      </div>
    </div>
    
    <div class="add-new-container">
      <button @click="$emit('add-new')" class="add-new-btn">
        <span class="plus-icon">+</span> {{ $t('address.card.add_new_button') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'; // Added i18n

// 1. Define Props to receive the address object from the parent (CheckoutPage.vue)
const props = defineProps({
    address: {
        type: Object,
        required: true,
        // Ensure default structure exists to prevent errors if nested props are null initially
        default: () => ({ 
            id: null,
            street_address: 'Address not set',
            apartment_details: null,
            phone_number: 'N/A',
            area: { name: 'Area' },
            governorate: { name: 'Egypt' },
        }) 
    }
});

// Emits an event to the parent when the user wants to add or edit an address
const emit = defineEmits(['add-new', 'edit']);

// Initialize i18n
const { t } = useI18n();
</script>

<style scoped>
/* All styles remain unchanged as requested */
.address-display-card {
 display: flex;
 flex-direction: column;
 gap: 1.5rem;
}

.address-box {
 border: 1px solid #ccc;
 border-radius: 8px;
 padding: 1.5rem;
    display: flex;
 position: relative;
 gap: 20px;
}

.tracking-line {
 /* Style for the dashed line on the left */
 width: 20px;
 display: flex;
 flex-direction: column;
 align-items: center;
 position: relative;
}

.tracking-line::before {
 content: '';
 position: absolute;
 top: 15px;
 bottom: 15px;
 width: 2px;
 border-left: 2px dashed #20b486; /* Your green color */
}

.dot {
 width: 10px;
 height: 10px;
 background-color: #20b486;
 border-radius: 50%;
 z-index: 1;
}

.address-content {
 flex-grow: 1;
 display: flex;
 flex-direction: column;
}

.delivery-title {
 font-weight: bold;
 font-size: 1.1rem;
 color: #333;
 margin-bottom: 0.5rem;
}

.edit-icon {
 position: absolute;
 top: 10px;
 right: 10px;
 cursor: pointer;
 color: #666;
 transition: color 0.2s;
}

.edit-icon:hover {
 color: #20b486;
}

.details {
 line-height: 1.5;
 font-size: 0.95rem;
 color: #555;
}

.add-new-container {
 display: flex;
 justify-content: flex-end;
}

.add-new-btn {
  background: none;
  border: none;
  color: #20b486;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
}

.add-new-btn:hover {
 background-color: #e6f7f3;
}

.plus-icon {
  font-size: 1.2rem;
  font-weight: bold;
 margin-right: 5px;
}
</style>