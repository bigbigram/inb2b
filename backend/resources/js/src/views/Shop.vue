<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Best Sellers Slider -->
    <div class="mb-16 -mx-4 sm:-mx-6 lg:-mx-8">
      <!-- Banner Container -->
      <div 
        class="relative h-[300px] sm:h-[400px] lg:h-[500px] overflow-hidden"
        @mouseenter="isAutoPlaying = false"
        @mouseleave="isAutoPlaying = true"
      >
        <!-- Loading State -->
        <div v-if="!bestSellers.length" class="flex justify-center items-center h-full bg-gray-100">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>

        <!-- Slides -->
        <template v-else>
          <div 
            v-for="(product, index) in visibleSlides" 
            :key="product.item_id"
            class="absolute inset-0 w-full h-full transition-all duration-700"
            :class="{
              'opacity-100 translate-x-0': index === Math.floor(visibleSlides.length / 2),
              'opacity-0 translate-x-full': index > Math.floor(visibleSlides.length / 2),
              'opacity-0 -translate-x-full': index < Math.floor(visibleSlides.length / 2)
            }"
          >
            <!-- Banner Content -->
            <div class="relative h-full">
              <!-- Background Image -->
              <div class="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-900/40">
                <img 
                  :src="product.thumbnail || (product.images && product.images[0]) || 'https://via.placeholder.com/1500x800'" 
                  :alt="product.name"
                  class="w-full h-full object-cover object-center opacity-90"
                  @error="(e: Event) => { 
                    const target = e.target as HTMLImageElement;
                    if (target) target.src = 'https://via.placeholder.com/1500x800';
                  }"
                />
              </div>

              <!-- Content Overlay -->
              <div class="absolute inset-0 bg-gradient-to-r from-gray-900/80 to-transparent">
                <div class="container mx-auto px-4 h-full">
                  <div class="flex flex-col justify-center h-full max-w-xl text-white space-y-6">
                    <!-- New Arrival Tag -->
                    <div class="inline-flex items-center space-x-2">
                      <span class="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">New Arrival</span>
                      <span class="text-gray-300 text-sm">Featured Collection</span>
                    </div>

                    <!-- Product Info -->
                    <h2 class="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                      {{ product.name }}
                    </h2>
                    <p class="text-lg sm:text-xl text-gray-300 line-clamp-2">
                      {{ product.description || 'Discover our latest collection of premium products.' }}
                    </p>

                    <!-- Price and CTA -->
                    <div class="space-y-4">
                      <div class="flex items-baseline space-x-3">
                        <span class="text-3xl font-bold price-animate">Nu. {{ product.price.toFixed(2) }}</span>
                        <span class="text-lg text-gray-400 line-through">Nu. {{ (product.price * 1.2).toFixed(2) }}</span>
                      </div>
                      <button 
                        @click="goToProduct(product.item_id)"
                        class="px-8 py-4 bg-white text-gray-900 text-lg font-medium rounded-full hover:bg-gray-100 transform hover:-translate-y-1 transition-all duration-300 hover:shadow-lg cta-button"
                      >
                        Shop Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Navigation Arrows -->
        <button 
          @click="prevSlide"
          class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/20 transition-all duration-300 nav-button"
        >
          <span class="sr-only">Previous</span>
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button 
          @click="nextSlide"
          class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/20 transition-all duration-300 nav-button"
        >
          <span class="sr-only">Next</span>
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <!-- Slide Indicators -->
        <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          <button
            v-for="(_, index) in bestSellers"
            :key="index"
            @click="currentSlideIndex = index"
            class="w-2.5 h-2.5 rounded-full transition-all duration-300 hover:scale-125 slide-indicator"
            :class="[
              index === currentSlideIndex 
                ? 'bg-white w-8' 
                : 'bg-white/50 hover:bg-white/70'
            ]"
          >
            <span class="sr-only">Slide {{ index + 1 }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Search and Sort Controls -->
    <div class="flex flex-col sm:flex-row gap-4 mb-8">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search products..."
        class="flex-grow p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
      <select
        v-model="sortOption"
        class="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="default">Default sorting</option>
        <option value="price-low">Price: Low to High</option>
        <option value="price-high">Price: High to Low</option>
        <option value="rating">By Rating</option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !products.length" class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">Loading products...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center text-red-600">
      {{ error }}
    </div>

    <!-- Product Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <ProductCard
        v-for="product in products"
        :key="product.item_id"
        :product="product"
      />
    </div>

    <!-- Infinite Scroll Trigger -->
    <div
      v-if="hasMore"
      id="infinite-scroll-trigger"
      class="h-10 mt-8"
    ></div>

    <!-- Loading More Indicator -->
    <div v-if="loading && products.length" class="text-center mt-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-2 text-gray-600">Loading more products...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import ProductCard from '../components/ProductCard.vue'
import { getProducts } from '../api/products'
import type { ProductWithParsedData } from '../types/product'

const router = useRouter()
const products = ref<ProductWithParsedData[]>([])
const bestSellers = ref<ProductWithParsedData[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const searchQuery = ref('')
const sortOption = ref('default')
const page = ref(1)
const hasMore = ref(true)
const observer = ref<IntersectionObserver | null>(null)
const currentSlideIndex = ref(0)
const isAutoPlaying = ref(true)
const autoPlayInterval = ref<number | null>(null)

// Load best selling products
const loadBestSellers = async () => {
  try {
    const response = await getProducts(1, 10);
    bestSellers.value = response.data
      .filter(product => product.thumbnail || (product.images && product.images.length)) // Only include products with images
      .sort(() => Math.random() - 0.5) // Randomly shuffle products
      .slice(0, 6); // Take first 6 products
  } catch (err) {
    console.error('Error loading best sellers:', err);
  }
};

// Slider controls
const nextSlide = () => {
  currentSlideIndex.value = (currentSlideIndex.value + 1) % bestSellers.value.length;
};

const prevSlide = () => {
  currentSlideIndex.value = currentSlideIndex.value === 0 
    ? bestSellers.value.length - 1 
    : currentSlideIndex.value - 1;
};

const startAutoPlay = () => {
  if (autoPlayInterval.value) return;
  autoPlayInterval.value = window.setInterval(() => {
    if (isAutoPlaying.value) {
      nextSlide();
    }
  }, 3000);
};

const stopAutoPlay = () => {
  if (autoPlayInterval.value) {
    clearInterval(autoPlayInterval.value);
    autoPlayInterval.value = null;
  }
};

// Navigate to product detail
const goToProduct = (productId: string) => {
  router.push(`/product/${productId}`);
};

// Visible slides computation
const visibleSlides = computed(() => {
  if (!bestSellers.value.length) return [];
  
  const slides = [...bestSellers.value];
  const rotated = [
    ...slides.slice(currentSlideIndex.value),
    ...slides.slice(0, currentSlideIndex.value)
  ];
  return rotated.slice(0, 5);
});

// Load products
const loadProducts = async () => {
  if (loading.value || !hasMore.value) return
  loading.value = true
  error.value = null

  try {
    const response = await getProducts(page.value, 12)
    
    // For first page, replace products
    if (page.value === 1) {
      products.value = response.data;
    } else {
      // For subsequent pages, append products
      products.value = [...products.value, ...response.data];
    }
    
    hasMore.value = response.hasMore;
    if (hasMore.value) {
      page.value++;
    }
  } catch (err) {
    error.value = 'Failed to load products'
    console.error('Error loading products:', err)
  } finally {
    loading.value = false
  }
}

// Reset and reload when search or sort changes
const refreshProducts = () => {
  page.value = 1;
  hasMore.value = true;
  products.value = [];
  loadProducts();
}

// Watch for search and sort changes
watch([searchQuery, sortOption], () => {
  refreshProducts();
});

const setupIntersectionObserver = () => {
  observer.value = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !loading.value && hasMore.value) {
        loadProducts()
      }
    },
    { threshold: 0.5 }
  )

  const target = document.querySelector('#infinite-scroll-trigger')
  if (target) {
    observer.value.observe(target)
  }
}

onMounted(() => {
  loadProducts();
  loadBestSellers();
  setupIntersectionObserver();
  startAutoPlay();
});

onUnmounted(() => {
  if (observer.value) {
    observer.value.disconnect();
  }
  stopAutoPlay();
});
</script>

<style scoped>
/* Banner slider animations */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.75s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

/* Content animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeInUp {
  animation: fadeInUp 0.6s ease-out forwards;
}

/* Navigation button hover effect */
.nav-button {
  transition: all 0.3s ease;
}

.nav-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

/* Slide indicator animation */
.slide-indicator {
  transition: all 0.3s ease;
}

.slide-indicator.active {
  width: 2rem;
  background-color: white;
}

/* Price tag animation */
@keyframes pulsate {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.price-animate {
  animation: pulsate 2s ease-in-out infinite;
}

/* Button hover animation */
.cta-button {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}
</style>