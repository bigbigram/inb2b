<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">My Wishlist</h1>
        <p class="text-gray-600">{{ wishlistItems.length }} items</p>
      </div>

      <div v-if="wishlistItems.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div v-for="item in wishlistItems" :key="item.item_id?.toString()" class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <div class="relative">
            <img 
              :src="item.thumbnail || (item.images && item.images[0]) || 'https://via.placeholder.com/300'" 
              :alt="item.name"
              class="w-full h-48 object-cover rounded-md mb-4"
              @error="handleImageError"
            >
            <button 
              @click="safeRemoveFromWishlist(item.item_id?.toString())"
              class="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
          <h2 class="text-lg font-medium text-gray-900 mb-2">{{ item.name }}</h2>
          <p class="text-sm text-gray-500 mb-4 line-clamp-2">{{ item.description }}</p>
          <div class="flex flex-col gap-4">
            <div class="flex justify-between items-center">
              <p class="text-lg font-semibold text-blue-600">BTN {{ item.price }}</p>
              <div class="flex items-center gap-2">
                <button 
                  @click="safeDecrementQuantity(item.item_id?.toString())"
                  class="p-1 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                  :disabled="safeGetItemQuantity(item.item_id?.toString()) <= 1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
                  </svg>
                </button>
                <span class="w-8 text-center">{{ safeGetItemQuantity(item.item_id?.toString()) }}</span>
                <button 
                  @click="safeIncrementQuantity(item.item_id?.toString())"
                  class="p-1 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            <div class="flex flex-col gap-4">
              <!-- Color Selection -->
              <div v-if="getColors(item).length > 0" class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">Color</label>
                <div class="flex flex-wrap gap-2">
                  <button 
                    v-for="color in getColors(item)" 
                    :key="color"
                    @click="selectColor(item.item_id?.toString(), color)"
                    class="px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200"
                    :class="selectedColors[item.item_id?.toString() || ''] === color 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'"
                  >
                    {{ color }}
                  </button>
                </div>
              </div>

              <!-- Size Selection -->
              <div v-if="getSizes(item).length > 0" class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">Size</label>
                <div class="flex flex-wrap gap-2">
                  <button 
                    v-for="size in getSizes(item)" 
                    :key="size"
                    @click="selectSize(item.item_id?.toString(), size)"
                    class="px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200"
                    :class="selectedSizes[item.item_id?.toString() || ''] === size 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'"
                  >
                    {{ size }}
                  </button>
                </div>
              </div>
            </div>
            <button 
              @click="addToCart(item)"
              class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-20">
        <div class="w-24 h-24 mx-auto mb-6 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">Your wishlist is empty</h2>
        <p class="text-gray-500 mb-8">Browse our products and add your favorites to the wishlist!</p>
        <router-link 
          to="/" 
          class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
        >
          Start Shopping
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useWishlist } from '../composables/useWishlist'
import { useCartStore } from '@/stores/cart'
import type { Product } from '../types/product'
import { useRouter } from 'vue-router'

const router = useRouter()
const cartStore = useCartStore()
const { wishlistItems, removeFromWishlist } = useWishlist()

// Keep track of quantities for each item
const quantities = ref<Record<string, number>>({})

// Keep track of selected colors and sizes
const selectedColors = ref<Record<string, string>>({})
const selectedSizes = ref<Record<string, string>>({})

const safeGetItemQuantity = (itemId: string | undefined): number => {
  if (!itemId) return 1
  return quantities.value[itemId] || 1
}

const safeIncrementQuantity = (itemId: string | undefined) => {
  if (!itemId) return
  if (!quantities.value[itemId]) {
    quantities.value[itemId] = 1
  }
  quantities.value[itemId]++
}

const safeDecrementQuantity = (itemId: string | undefined) => {
  if (!itemId) return
  if (quantities.value[itemId] && quantities.value[itemId] > 1) {
    quantities.value[itemId]--
  }
}

// Initialize quantities and selections
onMounted(() => {
  wishlistItems.value.forEach(item => {
    const itemId = item.item_id?.toString() || ''
    
    // Initialize with first variant if available
    if (item.variants && Array.isArray(item.variants) && item.variants.length > 0) {
      selectedColors.value[itemId] = item.variants[0]
    }
    
    // Initialize with first size if available
    if (item.sizes) {
      const sizes = Array.isArray(item.sizes) ? item.sizes : item.sizes.split(',').map(s => s.trim())
      if (sizes.length > 0) {
        selectedSizes.value[itemId] = sizes[0]
      }
    }
    
    quantities.value[itemId] = 1
  })
})

const selectColor = (itemId: string | undefined, color: string) => {
  if (!itemId) return
  selectedColors.value[itemId] = color
}

const selectSize = (itemId: string | undefined, size: string) => {
  if (!itemId) return
  selectedSizes.value[itemId] = size
}

const getColors = (item: Product): string[] => {
  if (!item.variants) return []
  console.log('Variants for colors:', item.variants) // Debug log
  // Filter out size entries (those containing size indicators)
  const colors = Array.isArray(item.variants) 
    ? item.variants.filter(v => !v.includes('斤'))
    : []
  console.log('Filtered colors:', colors) // Debug log
  return colors
}

const getSizes = (item: Product): string[] => {
  if (!item.variants) return []
  console.log('Variants for sizes:', item.variants) // Debug log
  // Extract only size entries
  const sizeEntries = Array.isArray(item.variants)
    ? item.variants.filter(v => v.includes('斤'))
    : []
  console.log('Size entries:', sizeEntries) // Debug log
  
  // Extract just the size part
  const sizes = sizeEntries.map(entry => {
    const match = entry.match(/(XS|S|M|L|XL)/);
    return match ? match[1] : entry;
  })
  console.log('Final sizes:', sizes) // Debug log
  return sizes
}

const validateSelections = (itemId: string): boolean => {
  const hasColor = selectedColors.value[itemId] !== undefined
  const hasSize = selectedSizes.value[itemId] !== undefined
  return hasColor && hasSize
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  if (target) {
    target.src = 'https://via.placeholder.com/300'
  }
}

const safeRemoveFromWishlist = (itemId: string | undefined) => {
  if (!itemId) return
  removeFromWishlist(itemId)
}

const addToCart = async (product: Product) => {
  try {
    const itemId = product.item_id?.toString() || ''
    const numericItemId = parseInt(itemId)

    if (isNaN(numericItemId)) {
      console.error('Invalid item ID')
      return
    }

    // Validate selections
    if (!validateSelections(itemId)) {
      console.error('Color and size must be selected')
      return
    }

    const quantity = safeGetItemQuantity(itemId)
    const selectedColor = selectedColors.value[itemId]
    const selectedSize = selectedSizes.value[itemId]
    
    // Ensure we have a valid price
    let price = 0
    if (typeof product.price === 'string') {
      price = parseFloat(product.price)
    } else if (typeof product.price === 'number') {
      price = product.price
    }

    if (isNaN(price)) {
      console.error('Invalid price')
      return
    }

    // Create cart item with only the fields from Product type
    const cartItem = {
      id: numericItemId,
      item_id: itemId,
      name: product.name || product.title || '',
      title: product.name || product.title || '',
      description: product.description || '',
      price: price,
      price_min: typeof product.price_min === 'string' ? parseFloat(product.price_min) : (product.price_min || price),
      thumbnail: product.thumbnail || '',
      main_image: product.main_image || '',
      images: product.images || [],
      main_imgs: product.main_imgs || '',
      category_id: typeof product.category_id === 'string' ? parseInt(product.category_id) : (product.category_id || 0),
      brand: product.brand || '',
      rating: typeof product.rating === 'string' ? parseFloat(product.rating) : (product.rating || 0),
      stock: typeof product.stock === 'string' ? parseInt(product.stock) : (product.stock || 0),
      variants: product.variants || [],
      sizes: product.sizes || '',
      specifications: product.specifications || {},
      selectedColor,
      selectedSize,
      quantity
    }

    console.log('Adding to cart:', cartItem)
    // Cast the cart item to the store's expected type when adding to cart
    await cartStore.addToCart(cartItem as any)
    
    // Remove from wishlist after successful cart addition
    safeRemoveFromWishlist(itemId)
    
    // Navigate to cart
    await router.push('/cart')
  } catch (error) {
    console.error('Error adding to cart:', error)
  }
}
</script>

<style scoped>
.grid {
  display: grid;
  gap: 1.5rem;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
