<template>
  <div class="category-view">
    <!-- Back button and header -->
    <div class="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <router-link 
          to="/categories"
          class="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          Back to Categories
        </router-link>
        <h1 class="text-xl font-semibold">{{ categoryName }}</h1>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading-state">
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        <div v-for="n in 8" :key="n" class="animate-pulse">
          <div class="bg-gray-200 aspect-square rounded-lg mb-2"></div>
          <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>

    <div v-else-if="error" class="error-state p-4">
      <p class="text-red-500">{{ error }}</p>
      <button @click="loadProducts" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Retry
      </button>
    </div>

    <div v-else>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        <div v-for="product in products" :key="product.item_id" class="product-card bg-white rounded-lg p-2 hover:shadow-lg transition-shadow duration-300">
          <div class="relative aspect-square rounded-lg overflow-hidden mb-2 group cursor-pointer">
            <img 
              :src="product.main_imgs[0]" 
              :alt="product.title"
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              @error="handleImageError"
            >
            <!-- Video badge -->
            <div v-if="product.video_url" 
                 class="absolute top-2 right-2 flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded-full text-xs cursor-pointer hover:bg-black/90"
                 @click.stop="openVideo(product)">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
              <span>Video</span>
            </div>
            <!-- Desktop action buttons (hidden on mobile) -->
            <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex items-center justify-center">
              <div class="flex flex-col gap-3 px-4 w-full max-w-[200px]">
                <button 
                  v-if="product.video_url"
                  class="w-full bg-white/90 hover:bg-white text-gray-900 px-4 py-2.5 rounded-lg shadow-lg transition-colors duration-200 z-10 flex items-center justify-center gap-2 text-sm font-medium"
                  @click.stop="openVideo(product)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                  </svg>
                  Play Video
                </button>
                <button 
                  class="w-full bg-orange-500/90 hover:bg-orange-500 text-white px-4 py-2.5 rounded-lg shadow-lg transition-colors duration-200 z-10 text-sm font-medium"
                  @click.stop="openProductDetail(product)"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
          <!-- Product info section -->
          <div class="p-4 flex flex-col gap-2">
            <h3 class="text-sm font-medium text-gray-900 line-clamp-2">{{ product.title }}</h3>
            <div class="space-y-1">
              <p class="text-lg font-semibold text-orange-600">
                {{ getProductPrice(product) }}
              </p>
              <!-- Only show rates when available from API -->
              <div v-if="product.tax_rate || product.logistic_rate || product.unit_weight" 
                   class="text-xs text-gray-500">
                <p v-if="product.tax_rate">Tax Rate (As per DRC): {{ product.tax_rate }}%</p>
                <p v-if="product.logistic_rate">Logistics: Nu. {{ product.logistic_rate }}/kg</p>
                <p v-if="product.unit_weight">Weight: {{ product.unit_weight }} kg</p>
              </div>
            </div>
            <!-- Mobile-only view details button -->
            <button 
              class="md:hidden w-full mt-2 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              @click.stop="openProductDetail(product)"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Video Modal -->
    <VideoModal
      :show="showVideo"
      :video-url="selectedVideo.url"
      :title="selectedVideo.title"
      @close="closeVideo"
      @error="handleVideoError"
    />

    <!-- Product Detail Modal -->
    <ProductDetailModal
      v-if="selectedProduct"
      :show="showProductDetail"
      :product="selectedProduct"
      @close="closeProductDetail"
      @play-video="openVideo(selectedProduct)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getProductsByCategory, getCategories } from '../api/products';
import { getProductSkus } from '../api/productDetails';
import { usePricingStore } from '../stores/pricing';
import type { CategoryProduct, ExtendedCategoryProduct } from '../types/product';
import VideoModal from '../components/VideoModal.vue';
import ProductDetailModal from '../components/ProductDetailModal.vue';

const route = useRoute();
const router = useRouter();
const pricingStore = usePricingStore();
const products = ref<CategoryProduct[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const categoryName = ref('');

// Video modal state
const showVideo = ref(false);
const selectedVideo = ref({
  url: '',
  title: ''
});

// Product detail modal state
const showProductDetail = ref(false);
const selectedProduct = ref<ExtendedCategoryProduct | null>(null);

// Load products with rates
const loadProducts = async () => {
  if (!categoryId.value) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    const response = await getProductsByCategory(categoryId.value);
    products.value = response.map(product => parseProduct(product));
    console.log('Loaded products with rates:', products.value);
  } catch (err) {
    error.value = 'Failed to load products. Please try again.';
    console.error('Error loading products:', err);
  } finally {
    loading.value = false;
  }
};

// Video handling
const openVideo = (product: CategoryProduct) => {
  if (!product.video_url) return;
  
  selectedVideo.value = {
    url: product.video_url,
    title: product.title
  };
  showVideo.value = true;
};

const closeVideo = () => {
  showVideo.value = false;
  // Reset video state after animation completes
  setTimeout(() => {
    selectedVideo.value = { url: '', title: '' };
  }, 300);
};

const handleVideoError = () => {
  closeVideo();
  error.value = 'Failed to load video. Please try again.';
};

// Update category name
const updateCategoryName = async () => {
  if (!categoryId.value) return;
  
  try {
    const categories = await getCategories();
    const category = categories.find(c => c.cate_id === categoryId.value);
    categoryName.value = category?.cate_name || 'Category';
  } catch (err) {
    console.error('Error updating category name:', err);
    categoryName.value = 'Category';
  }
};

// Get category ID from route and validate
const categoryId = computed(() => {
  const id = route.query.cate_id;
  if (!id || typeof id !== 'string') {
    error.value = 'Invalid category ID';
    return null;
  }
  return id;
});

// Watch for category ID changes
watch(categoryId, async (newId) => {
  if (newId) {
    await Promise.all([
      loadProducts(),
      updateCategoryName()
    ]);
  } else {
    router.push('/categories');
  }
}, { immediate: true });

// Refresh method for pull-to-refresh
const refresh = async () => {
  try {
    await Promise.all([
      loadProducts(),
      updateCategoryName()
    ]);
  } catch (error) {
    console.error('Error refreshing category view:', error);
  }
};

// Make refresh method available to the component
defineExpose({ refresh });

// Parse product data
const parseProduct = (product: any) => {
  const priceInputs = {
    price: product.price_max || product.price,
    tax_rate: product.tax_rate || product.taxRate,
    logistic_rate: product.logistic_rate || product.logisticRate,
    unit_weight: product.unit_weight || product.unitWeight
  };

  // Calculate price only if we have the necessary data
  const totalPrice = pricingStore.calculatePrice(priceInputs);

  // Ensure we always have a price value
  const price = product.price_max || product.price || product.price_min || '0';

  return {
    ...product,
    price, // This will never be undefined
    tax_rate: product.tax_rate || product.taxRate,
    logistic_rate: product.logistic_rate || product.logisticRate,
    unit_weight: product.unit_weight || product.unitWeight,
    main_imgs: Array.isArray(product.main_imgs) ? product.main_imgs : [],
    video_url: product.video_url || '',
    formattedPrice: totalPrice ? `Nu. ${totalPrice.toFixed(2)}` : 'Price not available'
  };
};

// Product detail handling
const openProductDetail = async (product: CategoryProduct) => {
  try {
    // Fetch SKUs before opening modal
    console.log('Fetching SKUs for product:', product.item_id);
    const skusResponse = await getProductSkus(product.item_id);
    console.log('Fetched SKUs response:', skusResponse);
    
    // Process rates and prepare product data
    selectedProduct.value = {
      ...product,
      price: product.price_max || product.price || product.price_min || '0', // Ensure price is set
      tax_rate: product.tax_rate || '0',
      logistic_rate: product.logistic_rate || '0',
      unit_weight: product.unit_weight || '0',
      price_max: product.price_max || '0',
      skus: Array.isArray(skusResponse) ? skusResponse.map(sku => ({
        ...sku,
        price: String(sku.price || '0'),
        stock: Number(sku.stock || 0)
      })) : []
    } as ExtendedCategoryProduct;

    // Log the prepared product data
    console.log('Opening product detail with data:', selectedProduct.value);
    showProductDetail.value = true;

  } catch (error) {
    console.error('Failed to fetch SKUs:', error);
    // Still open the modal but without SKUs
    selectedProduct.value = {
      ...product,
      price: product.price_max || product.price || product.price_min || '0', // Ensure price is set
      tax_rate: product.tax_rate || '0',
      logistic_rate: product.logistic_rate || '0',
      unit_weight: product.unit_weight || '0',
      price_max: product.price_max || '0',
      skus: []
    } as ExtendedCategoryProduct;
    showProductDetail.value = true;
  }
};

const closeProductDetail = () => {
  showProductDetail.value = false;
  selectedProduct.value = null;
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = '/placeholder-product.jpg';
};

// Computed property for product rates
const getProductPrice = (product: CategoryProduct) => {
  const standardPrice = pricingStore.calculateStandardPrice(product);
  return pricingStore.formatStandardPrice(standardPrice);
};

const getProductRates = (product: CategoryProduct) => {
  if (!product) return { tax_rate: '0', logistic_rate: '0', unit_weight: '0' };
  return {
    tax_rate: product.tax_rate,
    logistic_rate: product.logistic_rate,
    unit_weight: product.unit_weight
  };
};
</script>

<style scoped>
.product-card {
  @apply relative transition-shadow duration-300 bg-white rounded-lg overflow-hidden;
}

.product-card:hover {
  @apply shadow-lg;
}

.product-card img {
  @apply w-full h-full object-cover transition-transform duration-300;
}

/* Desktop-specific styles */
@media (min-width: 768px) {
  .product-card:hover img {
    @apply scale-105;
  }
}

/* Mobile-specific styles */
@media (max-width: 767px) {
  .product-card {
    @apply shadow-sm;
  }
  
  .video-badge {
    @apply active:bg-black;
  }
}

button {
  @apply transition-all duration-200;
}

button:hover {
  @apply transform scale-105;
}

button:active {
  @apply transform scale-95;
}

.modal-enter-active,
.modal-leave-active {
  @apply transition-opacity duration-300;
}

.modal-enter-from,
.modal-leave-to {
  @apply opacity-0;
}
</style>
