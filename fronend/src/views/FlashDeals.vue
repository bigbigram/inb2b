<template>
  <div class="container mx-auto px-4">
    <h1 class="text-2xl font-bold mb-6">Flash Deals</h1>
    
    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
      <div v-for="n in 16" :key="n" class="animate-pulse">
        <div class="bg-gray-200 h-48 rounded-lg mb-2"></div>
        <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div class="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8">
      <p class="text-red-500 mb-4">{{ error }}</p>
      <button @click="loadFlashDeals" 
              class="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
        Retry
      </button>
    </div>

    <!-- Products Grid -->
    <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
      <div v-for="product in products" 
           :key="product.item_id"
           @click="goToProduct(product.item_id)"
           class="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group cursor-pointer">
        <div class="aspect-w-1 aspect-h-1 bg-gray-50">
          <img 
            :src="product.images?.[0] || product.thumbnail || '/placeholder-product.png'" 
            :alt="product.name"
            @error="$event.target.src = '/placeholder-product.png'"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          >
        </div>
        <div class="p-4">
          <h3 class="font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-orange-600 transition-colors">
            {{ product.name }}
          </h3>
          <div class="flex items-baseline justify-between">
            <p class="text-lg font-bold text-orange-600">
              {{ getFormattedPrice(product) }}
            </p>
            <span class="text-sm text-gray-500">Stock: {{ product.stock }}</span>
          </div>
          <div class="mt-2 flex items-center gap-2">
            <span class="text-sm text-gray-500">
              <i class="fas fa-star text-yellow-400"></i>
              {{ product.rating || '4.5' }}
            </span>
            <span class="text-sm text-gray-500">•</span>
            <span class="text-sm text-orange-600 font-medium">Flash Deal</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getFlashDeals } from '../api/products'
import type { ProductWithParsedData } from '../types/product'
import { usePricingStore } from '../stores/pricing'
import { useRouter } from 'vue-router'

const router = useRouter()
const pricingStore = usePricingStore()
const products = ref<ProductWithParsedData[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const loadFlashDeals = async () => {
  try {
    loading.value = true
    error.value = null
    products.value = await getFlashDeals()
  } catch (err) {
    error.value = 'Failed to load flash deals. Please try again.'
    console.error('Error loading flash deals:', err)
  } finally {
    loading.value = false
  }
}

// Format price with tax and logistics
const getFormattedPrice = (product: ProductWithParsedData) => {
  try {
    const totalPrice = pricingStore.calculateStandardPrice(product);
    return pricingStore.formatStandardPrice(totalPrice);
  } catch (error) {
    console.error('Error formatting price:', error);
    return pricingStore.formatStandardPrice(0);
  }
}

const goToProduct = (itemId: number | string) => {
  router.push(`/product/${itemId}`)
}

onMounted(async () => {
  await pricingStore.init()
  await loadFlashDeals()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
