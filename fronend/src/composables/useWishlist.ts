import { ref, onMounted, watch } from 'vue'
import type { Product } from '../types/product'

const wishlistItems = ref<Product[]>([])

export function useWishlist() {
  // Load wishlist from localStorage on mount
  onMounted(() => {
    const savedWishlist = localStorage.getItem('wishlist')
    if (savedWishlist) {
      try {
        wishlistItems.value = JSON.parse(savedWishlist)
        console.log('Loaded wishlist:', wishlistItems.value)
      } catch (error) {
        console.error('Error loading wishlist:', error)
        wishlistItems.value = []
      }
    }
  })

  // Watch for changes in wishlist items and update localStorage
  watch(wishlistItems, (newItems) => {
    localStorage.setItem('wishlist', JSON.stringify(newItems))
    console.log('Updated wishlist:', newItems)
  }, { deep: true })

  // Add item to wishlist
  const addToWishlist = (product: Product) => {
    try {
      const exists = wishlistItems.value.some(item => item.item_id === product.item_id)
      if (!exists) {
        wishlistItems.value.push({ ...product })
        console.log('Added to wishlist:', product)
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error)
    }
  }

  // Remove item from wishlist
  const removeFromWishlist = (productId: string) => {
    try {
      wishlistItems.value = wishlistItems.value.filter(item => item.item_id !== productId)
      console.log('Removed from wishlist:', productId)
    } catch (error) {
      console.error('Error removing from wishlist:', error)
    }
  }

  // Check if item is in wishlist
  const isInWishlist = (productId: string) => {
    return wishlistItems.value.some(item => item.item_id === productId)
  }

  // Clear wishlist
  const clearWishlist = () => {
    wishlistItems.value = []
    localStorage.removeItem('wishlist')
  }

  return {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist
  }
}
