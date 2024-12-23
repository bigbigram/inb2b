import { ref, watch } from 'vue';
import type { SavedItem } from '../types/product';

const STORAGE_KEY = 'saved_items';

export function useSavedItems() {
  const savedItems = ref<SavedItem[]>([]);

  // Load saved items from localStorage
  const loadSavedItems = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      savedItems.value = JSON.parse(stored);
    }
  };

  // Save items to localStorage
  const persistSavedItems = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedItems.value));
  };

  // Add item to saved items
  const saveItem = (item: Omit<SavedItem, 'date_saved'>) => {
    const exists = savedItems.value.some(
      saved => saved.product_id === item.product_id && 
               saved.sku_id === item.sku_id
    );

    if (!exists) {
      savedItems.value.push({
        ...item,
        date_saved: new Date().toISOString()
      });
    }
  };

  // Remove item from saved items
  const removeItem = (productId: number, skuId?: string) => {
    savedItems.value = savedItems.value.filter(
      item => !(item.product_id === productId && item.sku_id === skuId)
    );
  };

  // Check if item is saved
  const isItemSaved = (productId: number, skuId?: string) => {
    return savedItems.value.some(
      item => item.product_id === productId && item.sku_id === skuId
    );
  };

  // Watch for changes and persist
  watch(savedItems, persistSavedItems, { deep: true });

  // Load saved items on init
  loadSavedItems();

  return {
    savedItems,
    saveItem,
    removeItem,
    isItemSaved
  };
}
