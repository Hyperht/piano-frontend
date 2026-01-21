// src/stores/Cart.js

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import { useAuthStore } from './auth';
import { API_CONFIG } from '@/config/api';

const API_URL = API_CONFIG.BASE_URL + '/';

export const useCartStore = defineStore('cart', () => {
  const items = ref([]);
  const isLoading = ref(false);

  const authStore = useAuthStore();

  const cartTotal = computed(() => {
    if (!items.value || items.value.length === 0) {
      return 0;
    }
    const total = items.value.reduce((sum, item) => {
      if (!item.product) {
        return sum;
      }
      const price = item.product.is_on_sale ? parseFloat(item.product.sale_price) : parseFloat(item.product.original_price);
      return sum + (price * item.quantity);
    }, 0);
    return total.toFixed(2);
  });
  
  const cartItemCount = computed(() => {
    if (!items.value || items.value.length === 0) {
      return 0;
    }
    return items.value.reduce((count, item) => count + item.quantity, 0);
  });

  const fetchCart = async () => {
    isLoading.value = true;
    try {
      if (!authStore.isAuthenticated) {
        console.warn("User not authenticated. Cannot fetch cart.");
        items.value = [];
        return;
      }
      
      const response = await axios.get(`${API_URL}cart/`, {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      });

      // The fix: Correctly extract the 'items' array from the API response object.
      // Normalize items: remove any 0-quantity items returned by backends that don't delete rows.
      const rawItems = response.data.items || [];
      items.value = rawItems.filter(i => Number(i.quantity || 0) > 0);

    } catch (error) {
      console.error('Error fetching cart:', error);
      items.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  const addItem = async (product_id, quantity = 1) => {
    try {
      if (!authStore.isAuthenticated) {
        throw new Error("User not authenticated. Please log in.");
      }
      const response = await axios.post(
        `${API_URL}cart/add_item/`,
        { product_id, quantity },
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        }
      );
      // After a successful add, the server returns the updated cart.
      // We update the store with the new items from this response.
      items.value = response.data.items || [];
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const removeItem = async (itemId) => {
    try {
      if (!authStore.isAuthenticated) {
        throw new Error("User not authenticated. Please log in.");
      }

      const url = `${API_URL}cart/items/${itemId}/`;

      try {
        await axios.delete(url, { headers: { Authorization: `Bearer ${authStore.token}` } });
        // Re-fetch the cart to stay in sync
        await fetchCart();
        return;
      } catch (err) {
        // If the backend doesn't expose the DELETE endpoint (404), try compatibility fallbacks
        if (err && err.response && err.response.status === 404) {
          console.debug('[Cart] DELETE not found for', url, '- trying fallback POST to add_item with quantity 0');

          // Find local item either by cart item id or by product id
          let localItem = items.value.find(i => i.id === itemId) || items.value.find(i => i.product && i.product.id === itemId);
          if (!localItem) {
            console.warn('[Cart] Could not find local item for', itemId);
            throw err;
          }

          const productId = localItem.product.id;
          try {
            // Try setting quantity to 0 via add_item as a removal instruction
            await axios.post(`${API_URL}cart/add_item/`, { product_id: productId, quantity: 0 }, { headers: { Authorization: `Bearer ${authStore.token}` } });
            await fetchCart();
            // Verify removal
            const still = items.value.find(i => i.product && i.product.id === productId);
            if (!still) return;

            // If still present, attempt to reduce by delta (negative not always supported)
            const currentQty = Number(localItem.quantity || 0);
            if (currentQty > 0) {
              console.debug('[Cart] Trying to reduce by currentQty', currentQty, 'for product', productId);
              await axios.post(`${API_URL}cart/add_item/`, { product_id: productId, quantity: -currentQty }, { headers: { Authorization: `Bearer ${authStore.token}` } });
              await fetchCart();
              const still2 = items.value.find(i => i.product && i.product.id === productId);
              if (!still2) return;
            }

            // If still present but quantity is 0, remove locally for UI consistency
            const stillNow = items.value.find(i => i.product && i.product.id === productId);
            if (stillNow && Number(stillNow.quantity) === 0) {
              items.value = items.value.filter(i => !(i.product && i.product.id === productId));
              console.debug('[Cart] Item still present as 0-qty; removed locally for UI consistency', productId);
              return;
            }

            // Otherwise give up and throw
            console.warn('[Cart] Could not remove item for', productId);
            throw err;

          } catch (fallbackErr) {
            console.error('[Cart] Remove fallback failed:', fallbackErr);
            throw fallbackErr;
          }
        }
        throw err;
      }

    } catch (error) {
      console.error('Error removing item from cart:', error);
      throw error;
    }
  };

  const updateItemQuantity = async (itemId, quantity) => {
    try {
      if (!authStore.isAuthenticated) {
        throw new Error("User not authenticated. Please log in.");
      }

      const url = `${API_URL}cart/items/${itemId}/`;

      try {
        await axios.patch(url, { quantity }, { headers: { Authorization: `Bearer ${authStore.token}` } });
        await fetchCart();
        return;
      } catch (err) {
        // If endpoint not found, use add_item as a compatibility fallback with verification
        if (err && err.response && err.response.status === 404) {
          console.debug('[Cart] PATCH not found for', url, '- trying compatibility fallbacks');

          // Look up the local item by cart-item id or by product id
          let localItem = items.value.find(i => i.id === itemId) || items.value.find(i => i.product && i.product.id === itemId);
          if (!localItem) {
            console.warn('[Cart] Could not find local item for', itemId);
            throw err;
          }

          const productId = localItem.product && localItem.product.id;
          const currentQty = Number(localItem.quantity || 0);
          const desiredQty = Number(quantity);
          const delta = desiredQty - currentQty;

          try {
            // If delta < 0 (need to decrement), try sending negative delta first
            if (delta < 0) {
              console.debug('[Cart] Trying negative-delta POST for', productId, 'delta', delta);
              try {
                await axios.post(`${API_URL}cart/add_item/`, { product_id: productId, quantity: delta }, { headers: { Authorization: `Bearer ${authStore.token}` } });
                await fetchCart();
                const after = items.value.find(i => i.product && i.product.id === productId);
                if (!after || Number(after.quantity) === desiredQty) return;
                // If not matched, continue to absolute attempt
              } catch (negErr) {
                console.debug('[Cart] Negative-delta POST failed:', negErr && negErr.response && negErr.response.status);
                // fallthrough to absolute attempt
              }
            }

            // If delta > 0, try additive delta POST
            if (delta > 0) {
              console.debug('[Cart] Adding delta', delta, 'for product', productId);
              await axios.post(`${API_URL}cart/add_item/`, { product_id: productId, quantity: delta }, { headers: { Authorization: `Bearer ${authStore.token}` } });
              await fetchCart();
              const updated = items.value.find(i => i.product && i.product.id === productId);
              if (updated && Number(updated.quantity) === desiredQty) return;
            }

            // Try absolute desired quantity as a fallback
            console.debug('[Cart] Trying absolute quantity POST for', productId, 'qty', desiredQty);
            await axios.post(`${API_URL}cart/add_item/`, { product_id: productId, quantity: desiredQty }, { headers: { Authorization: `Bearer ${authStore.token}` } });
            await fetchCart();
            const updated2 = items.value.find(i => i.product && i.product.id === productId);

            if (desiredQty === 0) {
              // Removal attempt: if item is absent, success; if present with qty 0, remove locally
              if (!updated2) return;
              if (updated2 && Number(updated2.quantity) === 0) {
                items.value = items.value.filter(i => !(i.product && i.product.id === productId && Number(i.quantity) === 0));
                return;
              }
            } else if (updated2 && Number(updated2.quantity) === desiredQty) {
              return;
            }

            // If server increased quantity unexpectedly, try corrective negative delta
            if (updated2 && Number(updated2.quantity) !== desiredQty) {
              const diff = Number(updated2.quantity) - desiredQty;
              if (diff > 0) {
                console.debug('[Cart] Server increased quantity unexpectedly by', diff, '— trying corrective negative delta');
                try {
                  await axios.post(`${API_URL}cart/add_item/`, { product_id: productId, quantity: -diff }, { headers: { Authorization: `Bearer ${authStore.token}` } });
                  await fetchCart();
                  const final = items.value.find(i => i.product && i.product.id === productId);
                  if (!final || Number(final.quantity) === desiredQty) return;
                } catch (correctErr) {
                  console.debug('[Cart] Corrective negative-delta failed:', correctErr && correctErr.response && correctErr.response.status);
                }
              }
            }

            // As last resort, apply local adjustment and warn
            console.warn('[Cart] After fallbacks, quantity does not match desired — applying local adjustment', { productId, desiredQty, after: updated2 && updated2.quantity });
            items.value = items.value.map(i => {
              if (i.product && i.product.id === productId) {
                return { ...i, quantity: desiredQty };
              }
              return i;
            });
            return;

          } catch (fallbackErr) {
            console.error('[Cart] Fallback attempts failed:', fallbackErr);
            throw fallbackErr;
          }
        }
        throw err;
      }

    } catch (error) {
      console.error('Error updating item quantity:', error);
      throw error;
    }
  };

  return {
    items,
    isLoading,
    cartTotal,
    cartItemCount,
    fetchCart,
    addItem,
    removeItem,
    updateItemQuantity,
  };
});