<template>
  <div class="page-transition-wrapper">
    <div class="w-full mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Search Header -->
      <header class="sticky top-0 z-40 bg-white shadow-sm backdrop-blur-md bg-white/90">
        <div class="flex items-center gap-4 py-4">
          <div class="flex-1 relative">
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Search products..." 
              class="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200"
            >
            <div class="absolute left-4 top-1/2 -translate-y-1/2">
              <i v-if="!isSearching" class="fas fa-search text-gray-400"></i>
              <div v-else class="w-4 h-4">
                <div class="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          </div>
        </div>
        <!-- Categories Scroll -->
        <div class="border-t overflow-x-auto hide-scrollbar">
          <div class="flex space-x-6 py-3 px-4">
            <button 
              v-for="category in filteredCategories" 
              :key="category.id"
              class="flex items-center space-x-2 text-sm text-gray-600 hover:text-orange-500 transition-colors whitespace-nowrap"
              @click="selectedCategory = category.id"
              :class="{ 'text-orange-500': selectedCategory === category.id }"
            >
              <span class="mdi" :class="category.icon"></span>
              <span>{{ category.name }}</span>
            </button>
          </div>
        </div>      
      </header>

      <!-- Flash Deals Section -->
      <section v-if="flashDeals.length > 0" class="mt-6">
               <!-- No Results Message -->
      <div v-if="searchQuery && !filteredProducts.length" class="text-center py-12">
        <i class="fas fa-search text-gray-300 text-5xl mb-4"></i>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No Products Found</h3>
        <p class="text-gray-600">We couldn't find any products matching "{{ searchQuery }}"</p>
        <button 
          @click="searchQuery = ''" 
          class="mt-4 text-orange-600 hover:text-orange-700 font-medium"
        >
          Clear Search
        </button>
      </div>

        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-gray-900">Flash Deals</h2>
          <router-link to="/flash-deals" class="text-orange-600 hover:text-orange-700 text-sm font-medium">
            View All <i class="fas fa-arrow-right ml-1"></i>
          </router-link>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <div v-for="product in flashDeals.slice(0, 10)" 
               :key="product.item_id" 
               @click="goToProduct(product.item_id)"
               class="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
            <div class="aspect-w-1 aspect-h-1 bg-gray-50">
              <img 
                :src="product.images?.[0] || product.thumbnail || '/placeholder-product.png'" 
                :alt="product.name"
                @error="($event.target as HTMLImageElement).src = '/placeholder-product.png'"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              >
            </div>
            <div class="p-4">
              <h3 class="font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-orange-600 transition-colors">
                {{ product.name || product.title || 'Untitled Product' }}
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
      </section>
      <!-- Featured Products -->
      <section class="mt-8">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Featured Products</h2>
        <!-- Products Grid -->
        <div v-if="filteredProducts.length" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
          <div v-for="product in filteredProducts" 
               :key="product.item_id"
               @click="goToProduct(product.item_id)"
               class="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group cursor-pointer">
            <div class="aspect-w-1 aspect-h-1 bg-gray-50">
              <img 
                :src="product.images?.[0] || product.thumbnail || '/placeholder-product.png'" 
                :alt="product.name"
                @error="($event.target as HTMLImageElement).src = '/placeholder-product.png'"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              >
            </div>
            <div class="p-4">
              <h3 class="font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-orange-600 transition-colors">
                {{ product.name || product.title || 'Untitled Product' }}
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
                <span class="text-sm text-gray-500">{{ product.brand }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Load More -->
      <div 
        v-if="hasMore && !loadingMore" 
        class="mt-8 text-center"
      >
        <button 
          @click="loadMore"
          class="px-6 py-2 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition-colors"
        >
          Load More Products
        </button>
      </div>

      <!-- Loading More Indicator -->
      <div v-if="loadingMore" class="p-4 text-center">
        <div class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-orange-600 border-t-transparent"></div>
      </div>
    </div>
    <button 
    v-show="showScrollTop"
    @click="scrollToTop"
    class="fixed bottom-20 right-4 z-50 p-3 rounded-full bg-orange-500 text-white shadow-lg hover:bg-orange-600 transition-all duration-300 md:bottom-8"
  >
    <i class="fas fa-arrow-up"></i>
  </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, defineEmits, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { usePricingStore } from '../stores/pricing'
import { getProducts } from '../api/products'
import type { Product } from '../types'
import type { ProductWithParsedData } from '../types/product'
import NotificationService from '../services/NotificationService'

const emit = defineEmits<{
  (e: 'toggleSidebar'): void;
}>();

const router = useRouter()
const cartStore = useCartStore()
const pricingStore = usePricingStore()
const cartItemCount = computed(() => cartStore.items.length)
const searchQuery = ref('')
const isSearching = ref(false)
let searchTimeout: NodeJS.Timeout

// Debounced search function
const debouncedSearch = (query: string) => {
  isSearching.value = true
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    isSearching.value = false
  }, 300)
}

// Watch for search query changes
watch(searchQuery, (newQuery) => {
  debouncedSearch(newQuery)
})

const products = ref<ProductWithParsedData[]>([])
const page = ref(1)
const loadingMore = ref(false)
const hasMore = ref(true)
const ITEMS_PER_PAGE = 20

const filteredProducts = computed(() => {
  if (!searchQuery.value) return products.value
  
  const query = searchQuery.value.toLowerCase().trim()
  return products.value.filter(product => {
    const searchFields = [
      product.name,
      product.title,
      product.description,
      product.category,
      product.brand,
      product.tags?.join(' ')
    ].filter(Boolean)
    
    return searchFields.some(field => 
      field?.toLowerCase().includes(query)
    )
  })
})
const flashDeals = ref<ProductWithParsedData[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const isSidebarOpen = ref(false)
const categorySearch = ref('')
const selectedCategory = ref(null)

// Network status management
const isOnline = ref(navigator.onLine)
const showReconnectedToast = ref(false)

// Format price with tax and logistics
const getFormattedPrice = (product: ProductWithParsedData) => {
  try {
    console.group('💲 Price Formatting for Product');
    console.log('Product Details:', {
      title: product.title,
      price: product.price,
      price_min: product.price_min,
      price_max: product.price_max,
      tax_rate: product.tax_rate,
      logistic_rate: product.logistic_rate,
      unit_weight: product.unit_weight
    });

    const totalPrice = pricingStore.calculateStandardPrice(product);
    const formattedPrice = pricingStore.formatStandardPrice(totalPrice);
    
    console.log('Price Calculation:', {
      totalPrice,
      formattedPrice
    });
    console.groupEnd();

    return formattedPrice;
  } catch (e) {
    console.error('Error calculating price:', e);
    return 'Price not available';
  }
};

// Parse product data to add calculated prices
const parseProduct = (product: Product): ProductWithParsedData => {
  // Keep original rates from API without modifications
  const parsedProduct = {
    ...product
  };

  // Debug log to check rates
  console.log('Product rates:', {
    id: parsedProduct.item_id,
    price: parsedProduct.price,
    price_min: parsedProduct.price_min,
    price_max: parsedProduct.price_max,
    tax_rate: parsedProduct.tax_rate,
    taxRate: parsedProduct.taxRate,
    logistic_rate: parsedProduct.logistic_rate,
    logistic: parsedProduct.logistic,
    unit_weight: parsedProduct.unit_weight
  });

  return parsedProduct;
};

// Load flash deals - limit to 15
const loadFlashDeals = async () => {
  try {
    const response = await getProducts(1, 15);
    flashDeals.value = response.data.map(product => ({
      ...product,
      isFlashDeal: true
    }));
  } catch (error) {
    console.error('Error loading flash deals:', error);
    flashDeals.value = [];
  }
};

// Load all featured products
const loadProducts = async () => {
  if (loading.value) return;
  
  try {
    loading.value = true;
    error.value = null;
    
    // First batch of products
    const response = await getProducts(1, ITEMS_PER_PAGE);
    console.log('Featured products response:', response);
    
    if (response?.data?.length) {
      const parsedProducts = response.data.map(parseProduct);
      notificationService.checkNewItems(parsedProducts);
      products.value = parsedProducts;
      hasMore.value = response.hasMore;
    } else {
      error.value = 'No products available';
    }
  } catch (e) {
    console.error('Error loading products:', e);
    error.value = 'Failed to load products';
  } finally {
    loading.value = false;
  }
};

const loadMore = async () => {
  if (loadingMore.value || !hasMore.value) return
  
  loadingMore.value = true
  try {
    page.value++
    const newProducts = await getProducts({ page: page.value, limit: ITEMS_PER_PAGE })
    if (newProducts.length < ITEMS_PER_PAGE) {
      hasMore.value = false
    }
    products.value = [...products.value, ...newProducts.map(parseProduct)]
  } catch (error) {
    notification.showToast('Failed to load more products', 'error')
  } finally {
    loadingMore.value = false
  }
}

// Initialize notification service
const notificationService = NotificationService.getInstance()

// Request notification permission on mount
onMounted(async () => {
  await notificationService.requestPermission()
  loadProducts()
  loadFlashDeals()
})

// Cleanup event listeners
onUnmounted(() => {
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
  clearTimeout(searchTimeout);
});

// Navigate to product detail
const goToProduct = (productId: string) => {
  router.push(`/product/${productId}`)
}

// Refresh method for pull-to-refresh functionality
const refresh = async () => {
  try {
    await Promise.all([
      loadProducts(),
      loadFlashDeals(),
    ]);
  } catch (error) {
    console.error('Error refreshing home page:', error);
  }
};

// Make refresh method available to the component
defineExpose({ refresh });

// Setup network monitoring
onMounted(() => {
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
})

// Network status handlers
const handleOnline = () => {
  isOnline.value = true
  showReconnectedToast.value = true
  
  // Hide toast and reload data after delay
  setTimeout(() => {
    showReconnectedToast.value = false
    // Reload all data
    page.value = 1
    loadProducts()
    loadFlashDeals()
  }, 2000)
}

const handleOffline = () => {
  isOnline.value = false
}

// Categories with icons
const categories = [
  { id: 1, name: 'All Products', icon: 'mdi-view-grid' },
  { id: 2, name: 'Industrial', icon: 'mdi-factory' },
  { id: 3, name: 'Electronics', icon: 'mdi-desktop-tower-monitor' },
  { id: 4, name: 'Machinery', icon: 'mdi-engine' },
  { id: 5, name: 'Tools', icon: 'mdi-tools' },
  { id: 6, name: 'Safety', icon: 'mdi-shield-check' },
  { id: 7, name: 'Electrical', icon: 'mdi-flash' },
  { id: 8, name: 'Automotive', icon: 'mdi-car-cog' },
  { id: 9, name: 'Construction', icon: 'mdi-crane' },
  { id: 10, name: 'Hardware', icon: 'mdi-hammer-wrench' },
  { id: 11, name: 'Packaging', icon: 'mdi-package-variant-closed' },
  { id: 12, name: 'Office', icon: 'mdi-office-building' },
  { id: 13, name: 'Raw Materials', icon: 'mdi-cube-outline' },
  { id: 14, name: 'Chemicals', icon: 'mdi-test-tube' },
  { id: 15, name: 'HVAC', icon: 'mdi-air-conditioner' },
  { id: 16, name: 'Plumbing', icon: 'mdi-water-pump' },
  { id: 17, name: 'Cleaning', icon: 'mdi-spray' },
  { id: 18, name: 'Medical', icon: 'mdi-medical-bag' },
  { id: 19, name: 'Logistics', icon: 'mdi-truck-delivery' },
  { id: 20, name: 'Storage', icon: 'mdi-warehouse' },
  { id: 21, name: 'IT Hardware', icon: 'mdi-server' },
  { id: 22, name: 'Software', icon: 'mdi-microsoft' },
  { id: 23, name: 'Networking', icon: 'mdi-network' },
  { id: 24, name: 'Security', icon: 'mdi-security' },
  { id: 25, name: 'Lab Equipment', icon: 'mdi-microscope' },
  { id: 26, name: 'Measurement', icon: 'mdi-ruler' },
  { id: 27, name: 'Metalworking', icon: 'mdi-anvil' },
  { id: 28, name: 'Agriculture', icon: 'mdi-tractor' },
  { id: 29, name: 'Mining', icon: 'mdi-pickaxe' },
  { id: 30, name: 'Power Tools', icon: 'mdi-screwdriver' }
]

// Filter categories based on search
const filteredCategories = computed(() => {
  if (!categorySearch.value) return categories.slice(0, 30)
  const search = categorySearch.value.toLowerCase()
  return categories.filter(cat => 
    cat.name.toLowerCase().includes(search)
  ).slice(0, 12)
});

const showScrollTop = ref(false)

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

const toggleVisibility = () => {
  if (window.pageYOffset > 300) {
    showScrollTop.value = true
  } else {
    showScrollTop.value = false
  }
}

onMounted(() => {
  window.addEventListener('scroll', toggleVisibility)
})

onUnmounted(() => {
  window.removeEventListener('scroll', toggleVisibility)
})

// Check for new products and notify users
const checkNewProducts = (products: any[]) => {
  const newProducts = products.filter(product => {
    const productDate = new Date(product.createdAt)
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
    return productDate > threeDaysAgo
  })

  if (newProducts.length > 0) {
    notificationService.notifyNewProducts(newProducts)
  }
}

// Check for price drops
const checkPriceDrops = (products: any[]) => {
  const productsWithPriceDrops = products.filter(product => product.onSale || product.discounted)
  if (productsWithPriceDrops.length > 0) {
    notificationService.notifyPriceDrops(productsWithPriceDrops)
  }
}

// Check for low stock items
const checkLowStock = (products: any[]) => {
  const lowStockProducts = products.filter(product => product.stock < 10)
  if (lowStockProducts.length > 0) {
    notificationService.notifyLowStock(lowStockProducts)
  }
}

watch(products, (newProducts) => {
  checkNewProducts(newProducts)
  checkPriceDrops(newProducts)
  checkLowStock(newProducts)
})
</script>

<style scoped>
.page-transition-wrapper {
  min-height: calc(100vh - 64px);
  background-color: rgb(249, 250, 251);
}

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-1rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
</style>