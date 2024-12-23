import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Product } from '../types'
import { nanoid } from 'nanoid'
import { useNotificationStore } from './notification'

export const useCartStore = defineStore('cart', () => {
  const items = ref<(Product & { 
    selectedColor: string; 
    selectedSize: string; 
    quantity: number; 
    cartId: string; 
    image?: string; 
    price?: string | number; 
    tax_rate?: string | number; 
    logistic_rate?: string | number; 
    unit_weight?: string | number;
  })[]>([])

  // Load cart from localStorage on initialization
  const loadCart = () => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        items.value = parsedCart.items || []
      } catch (e) {
        console.error('Error loading cart:', e)
        items.value = []
      }
    }
  }

  // Save cart to localStorage
  const saveCart = () => {
    localStorage.setItem('cart', JSON.stringify({ items: items.value }))
  }

  const getItemPrice = (item: Product & { quantity: number }): number => {
    if (item.price && !isNaN(parseFloat(item.price.toString()))) {
      return parseFloat(item.price.toString());
    }

    if (item.prices && Array.isArray(item.prices)) {
      const applicablePriceTier = item.prices
        .sort((a, b) => parseInt(b.beginAmount) - parseInt(a.beginAmount))
        .find(tier => item.quantity >= parseInt(tier.beginAmount));
      
      if (applicablePriceTier) {
        return parseFloat(applicablePriceTier.price);
      }
    }
    
    if (item.price_min) {
      return parseFloat(item.price_min);
    }

    return 0;
  }

  const total = computed(() => {
    return items.value.reduce((sum, item) => {
      const price = getItemPrice(item);
      return sum + (price * item.quantity);
    }, 0);
  })

  const itemCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  const addToCart = async (product: Product & { 
    selectedColor: string; 
    selectedSize: string; 
    quantity: number; 
    cartId?: string;
    image?: string;
    price?: string | number;
    tax_rate?: string | number;
    logistic_rate?: string | number;
    unit_weight?: string | number;
  }) => {
    try {
      // Check if the item with same color and size exists
      const existingItemIndex = items.value.findIndex(
        item => 
          item.item_id === product.item_id && 
          item.selectedColor === product.selectedColor && 
          item.selectedSize === product.selectedSize
      );

      if (existingItemIndex !== -1) {
        // Update quantity if item exists
        items.value[existingItemIndex].quantity += product.quantity;
      } else {
        // Add new item if it doesn't exist
        items.value.push({
          ...product,
          cartId: product.cartId || nanoid(),
        });
      }

      // Save to localStorage
      saveCart();

      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  const removeFromCart = (cartId: string) => {
    items.value = items.value.filter(item => item.cartId !== cartId)
    saveCart()
    const notification = useNotificationStore()
    notification.displayToast('Item removed from cart', 'success')
  }

  const clearCart = () => {
    items.value = []
    saveCart()
  }

  const updateQuantity = (cartId: string, newQuantity: number) => {
    const item = items.value.find(item => item.cartId === cartId)
    if (item) {
      item.quantity = newQuantity
      saveCart()
      const notification = useNotificationStore()
      notification.displayToast('Cart updated', 'success')
    }
  }

  // Load cart on store initialization
  loadCart()

  return { 
    items,
    total,
    itemCount,
    addToCart,
    removeFromCart,
    clearCart,
    updateQuantity,
    getItemPrice
  }
})