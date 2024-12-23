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
    console.group('🔍 Item Price Calculation Debug');
    console.log('Item Details:', item);

    let price = 0;
    if (item.price && !isNaN(parseFloat(item.price.toString()))) {
      price = parseFloat(item.price.toString());
      console.log('Price from direct price field:', price);
    }

    if (item.prices && Array.isArray(item.prices)) {
      const applicablePriceTier = item.prices
        .sort((a, b) => parseInt(b.beginAmount) - parseInt(a.beginAmount))
        .find(tier => item.quantity >= parseInt(tier.beginAmount));
      
      if (applicablePriceTier) {
        price = parseFloat(applicablePriceTier.price);
        console.log('Price from price tiers:', price, 'Tier:', applicablePriceTier);
      }
    }

    if (item.price_min) {
      price = parseFloat(item.price_min);
      console.log('Price from price_min:', price);
    }

    console.log('Final Calculated Price:', price);
    console.groupEnd();

    return price;
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
    item_id?: number | string;  
  }) => {
    try {
      // Debug logging
      console.group('🛒 Add to Cart Debug');
      console.log('Product Details:', product);

      // Ensure product_id exists, prioritizing id, then item_id
      const productId = product.id || product.product_id || product.item_id;
      if (!productId) {
        console.error('❌ Product is missing ID');
        throw new Error('Cannot add product to cart: Missing product ID');
      }

      // Check if the item with same color and size exists
      const existingItemIndex = items.value.findIndex(
        item => 
          (item.id === productId || 
           item.product_id === productId || 
           item.item_id === productId) && 
          item.selectedColor === product.selectedColor && 
          item.selectedSize === product.selectedSize
      );

      if (existingItemIndex !== -1) {
        // Update quantity if item exists
        items.value[existingItemIndex].quantity += product.quantity;
        console.log('✅ Updated existing cart item quantity');
      } else {
        // Add new item if it doesn't exist
        const cartItem = {
          ...product,
          // Ensure all ID fields are set consistently
          id: productId,
          product_id: productId,
          item_id: productId,  
          cartId: product.cartId || nanoid(),
        };

        console.log('✅ Adding new cart item:', cartItem);
        items.value.push(cartItem);
      }

      // Save to localStorage
      saveCart();

      console.log('🛒 Current Cart Items:', items.value);
      console.groupEnd();

      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      console.groupEnd();
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