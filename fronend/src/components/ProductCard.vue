<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWishlist } from '../composables/useWishlist'
import { usePricingStore } from '../stores/pricing'
import type { Product } from '../types/product'

const router = useRouter()
const pricingStore = usePricingStore()
const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()

const props = defineProps<{
  product: Product
}>()

// Cache for calculated prices
const priceCache = ref<number | null>(null)

// Computed properties
const mainImage = computed(() => {
  if (props.product.thumbnail) return props.product.thumbnail;
  if (props.product.images?.[0]) return props.product.images[0];
  return 'https://via.placeholder.com/300x300?text=No+Image';
});

const calculatePrice = computed(() => {
  return pricingStore.calculateTotalPrice(props.product);
});

const formattedPrice = computed(() => {
  return pricingStore.formatPrice(calculatePrice.value);
});

const displayRates = computed(() => {
  return pricingStore.getDisplayRates(props.product);
});

const isNewProduct = computed(() => {
  if (!props.product.created_at) return false;
  const createdDate = new Date(props.product.created_at);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return createdDate > thirtyDaysAgo;
});

const stockDisplay = computed(() => {
  // Handle both number and string types for stock
  const stockValue = typeof props.product.stock === 'string' 
    ? parseInt(props.product.stock, 10) 
    : props.product.stock ?? 0;

  if (isNaN(stockValue)) return 'Out of stock';
  
  if (stockValue > 100) return 'In Stock';
  if (stockValue > 0) return `${stockValue} in stock`;
  return 'Out of stock';
});

const stockColor = computed(() => {
  const stockValue = typeof props.product.stock === 'string' 
    ? parseInt(props.product.stock, 10) 
    : props.product.stock ?? 0;

  if (isNaN(stockValue) || stockValue === 0) return 'text-red-600';
  if (stockValue < 10) return 'text-yellow-600';
  return 'text-green-600';
});

// Watch for exchange rate changes
watch(() => pricingStore.cnyToBtnRate, () => {
  // Clear cache when exchange rate changes
  priceCache.value = null;
});

// Clear cache when product changes
watch(() => props.product, () => {
  priceCache.value = null;
}, { deep: true });

// Methods
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = 'https://via.placeholder.com/300x300?text=No+Image';
};

const goToProductDetail = () => {
  router.push(`/product/${props.product.item_id}`);
};

const handleWishlist = (event: Event) => {
  event.stopPropagation()
  const itemId = props.product.item_id;
  if (!itemId) return;
  
  if (isInWishlist(itemId)) {
    removeFromWishlist(itemId)
  } else {
    addToWishlist(props.product)
  }
}
</script>

<template>
  <div 
    class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
    @click="goToProductDetail"
  >
    <div class="relative">
      <img 
        :src="mainImage" 
        :alt="product.name"
        class="w-full aspect-square object-cover rounded-t-lg"
        @error="handleImageError"
      >
      <div v-if="isNewProduct" class="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
        New
      </div>
    </div>
    
    <div class="p-4">
      <h3 class="text-sm font-medium text-gray-900 line-clamp-2 mb-1">{{ product.title }}</h3>
      <div class="space-y-1">
        <p class="text-lg font-semibold text-orange-600">{{ formattedPrice }}</p>
        <!-- Display rates from API -->
        <div v-if="displayRates.length > 0" class="text-xs text-gray-500 space-y-0.5">
          <p v-for="rate in displayRates" :key="rate">{{ rate }}</p>
        </div>
      </div>
      <div class="mt-2">
        <span class="text-sm" :class="stockColor">
          {{ stockDisplay }}
        </span>
      </div>
      <div class="flex justify-between items-center mt-4">
        <button 
          @click="goToProductDetail"
          class="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-yellow-700 transition-colors duration-200"
        >
          View
        </button>
        <button 
          @click="handleWishlist"
          class="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          :class="{ 'text-red-500': isInWishlist(props.product.item_id), 'text-gray-400': !isInWishlist(props.product.item_id) }"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" :fill="isInWishlist(props.product.item_id) ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  
  /* Modern approach using CSS logical properties */
  @supports (display: -webkit-box) or (display: -moz-box) {
    display: -webkit-box;
    display: -moz-box;
  }
  
  /* Fallback for browsers that don't support line-clamp */
  @supports not ((display: -webkit-box) or (display: -moz-box)) {
    max-height: 3em;
    position: relative;
  }
}

.aspect-w-1 {
  position: relative;
  padding-bottom: 75%;
}

.aspect-w-1 > img {
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  object-fit: cover;
}
</style>
