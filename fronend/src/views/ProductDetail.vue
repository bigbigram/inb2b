<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getProductDetails, getProductSkus } from '../api/productDetails';
import type { ProductDetailResponse } from '../types/product';
import type { Product } from '../types';
import Toast from '../components/Toast.vue';
import LoadingBar from '../components/LoadingBar.vue';
import { useToast } from '../composables/useToast';
import { useCartStore } from '../stores/cart';
import { usePricingStore } from '../stores/pricing';
import { generateDeepLink, generateUniversalLink } from '../config/deeplink';

const route = useRoute();
const cartStore = useCartStore();
const pricingStore = usePricingStore();
const { toast, showToast } = useToast();
const isLoading = ref(true);

// State
const product = ref<ProductDetailResponse | null>(null);
const skus = ref<any[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const selectedImageIndex = ref(0);
const selectedColor = ref<string | null>(null);
const selectedSize = ref<string | null>(null);
const quantities = ref<Record<string, Record<string, number>>>({});
const showReviewForm = ref(false);
const priceCache = ref<number | null>(null);

// Helper function to clean URL
const cleanUrl = (url: string): string => {
  return url
    .replace(/\\"/g, '"')      // Replace \" with "
    .replace(/\\\//g, '/')     // Replace \/ with /
    .replace(/^"|"$/g, '')     // Remove surrounding quotes
    .replace(/\\/g, '')        // Remove any remaining backslashes
    .trim();                   // Remove whitespace
};

// Computed Properties
const displayImages = computed(() => {
  try {
    if (!product.value?.main_imgs) {
      console.log('No images available');
      return ['https://via.placeholder.com/300'];
    }

    const mainImgs = product.value.main_imgs;
    console.log('Raw main_imgs:', mainImgs);

    if (Array.isArray(mainImgs)) {
      // Join all parts and fix the JSON string
      let fullJsonString = mainImgs.join('');
      console.log('Initial combined string:', fullJsonString);

      // Fix the JSON string by adding commas between URLs
      fullJsonString = fullJsonString
        .replace(/"\s*"/g, '","')  // Add commas between adjacent quotes
        .replace(/\]\[/g, '],[');  // Fix any adjacent arrays

      console.log('Fixed JSON string:', fullJsonString);

      try {
        // Parse the fixed JSON string
        const urlArray = JSON.parse(fullJsonString);
        console.log('Parsed URL array:', urlArray);

        if (Array.isArray(urlArray)) {
          // Clean each URL in the array
          const cleanedUrls = urlArray.map(url => {
            const cleaned = cleanUrl(url);
            console.log('Original URL:', url);
            console.log('Cleaned URL:', cleaned);
            return cleaned;
          });

          console.log('Final cleaned URLs:', cleanedUrls);

          if (cleanedUrls.length > 0) {
            return cleanedUrls;
          }
        }
      } catch (parseError) {
        // If parsing fails, try to extract URLs directly using regex
        console.error('Error parsing JSON:', parseError);
        const urlRegex = /https?:[^"]+\.(?:jpg|jpeg|png|gif|webp)/g;
        const matches = fullJsonString.match(urlRegex);
        
        if (matches) {
          const extractedUrls = matches.map(url => 
            url.replace(/\\\//g, '/').replace(/\\/g, '')
          );
          console.log('Extracted URLs:', extractedUrls);
          return extractedUrls;
        }
      }
    }

    // If we get here, something went wrong
    console.log('Falling back to placeholder image');
    return ['https://via.placeholder.com/300'];
  } catch (error) {
    console.error('Error in displayImages:', error);
    return ['https://via.placeholder.com/300'];
  }
});

// Computed price
const formattedPrice = computed(() => {
  if (!product.value) return 'Price not available';
  return pricingStore.formatStandardPrice(pricingStore.calculateStandardPrice(product.value));
});

// Format price helper
const formatPrice = (price: string) => {
  return pricingStore.formatStandardPrice(pricingStore.calculateStandardPrice({ price }));
};

const availableColors = computed(() => {
  if (!skus.value || skus.value.length === 0) return [];
  const uniqueColors = new Set(skus.value.map(sku => sku.props_names.split(';')[0]));
  return Array.from(uniqueColors);
});

const availableSizes = computed(() => {
  if (!product.value?.sizes) return [];
  try {
    // First try to parse as JSON
    let sizes;
    try {
      sizes = JSON.parse(product.value.sizes);
    } catch {
      // If JSON parsing fails, try to split by comma
      sizes = product.value.sizes.split(',').map(s => s.trim());
    }

    // Clean each size
    return sizes.map((size: string) => {
      // Remove any non-printable characters
      size = size.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
      // Remove quotes at start/end
      size = size.replace(/^["']|["']$/g, '');
      // Get text before any Chinese characters
      const match = size.match(/^([^建])+/);
      return match ? match[0].trim() : size.trim();
    }).filter(Boolean); // Remove empty strings
  } catch (e) {
    console.error('Error parsing sizes:', e);
    console.log('Raw sizes value:', product.value.sizes);
    return [];
  }
});

const canAddToCart = computed(() => {
  return selectedColor.value && selectedSize.value && quantities.value[selectedColor.value]?.[selectedSize.value] > 0;
});

const addToCartButtonText = computed(() => {
  return canAddToCart.value ? 'Add to Cart' : 'Select Options';
});

const selectedSku = computed(() => {
  console.log('Selected Color:', selectedColor.value);
  console.log('Selected Size:', selectedSize.value);
  
  if (!selectedColor.value || !selectedSize.value || !skus.value) {
    console.log('Missing required values for SKU selection');
    return null;
  }
  
  // Extract the color code before the '~' character
  const colorCode = selectedColor.value.split('~')[0];
  console.log('Looking for color code:', colorCode);
  
  const sku = skus.value.find(sku => {
    if (!sku?.props_names) {
      console.log('SKU missing props_names:', sku);
      return false;
    }
    const [colorPart, sizePart] = sku.props_names.split(';');
    const skuColorCode = colorPart.split('~')[0];
    const matches = skuColorCode === colorCode && sizePart === selectedSize.value;
    console.log('Checking SKU:', {
      sku,
      colorPart,
      sizePart,
      skuColorCode,
      selectedColor: colorCode,
      selectedSize: selectedSize.value,
      matches
    });
    return matches;
  });
  
  console.log('Found SKU:', sku);
  return sku;
});

const selectedStockBalance = computed(() => {
  const sku = selectedSku.value;
  console.log('Selected SKU for stock:', sku);
  if (!sku) return 0;
  
  // Ensure stock is treated as a number
  const stock = parseInt(sku.stock, 10);
  console.log('Parsed stock value:', stock);
  return isNaN(stock) ? 0 : stock;
});

// Watch for exchange rate changes
watch(() => pricingStore.cnyToBtnRate, () => {
  // Clear cache when exchange rate changes
  priceCache.value = null;
});

// Watch for product changes
watch(() => product.value, () => {
  priceCache.value = null;
}, { deep: true });

// Methods
const selectSize = (size: string) => {
  selectedSize.value = size;
  console.log('Size selected:', size);
  // Set default quantity to 1 when size is selected
  if (selectedColor.value) {
    quantities.value[selectedColor.value][size] = 1;
  }
  console.log('Current stock balance:', selectedStockBalance.value);
};

const selectColor = (color: string) => {
  selectedColor.value = color;
  console.log('Color selected:', color);
  // Reset size when color changes
  selectedSize.value = null;
  // Initialize quantities for this color if not already done
  if (!quantities.value[color]) {
    quantities.value[color] = {};
  }
};

const updateQuantity = (color: string, size: string, change: number) => {
  if (!quantities.value[color]) {
    quantities.value[color] = {};
  }
  if (quantities.value[color][size] === undefined) {
    quantities.value[color][size] = 1;
  }
  const currentQty = quantities.value[color][size];
  const newQty = Math.max(0, Math.min(currentQty + change, selectedStockBalance.value));
  quantities.value[color][size] = newQty;
};

const handleAddToCart = async () => {
  if (!product.value?.item_id || !product.value?.title) {
    showToast('Invalid product data', 'error');
    return;
  }

  if (!selectedColor.value || !selectedSize.value) {
    showToast('Please select color and size', 'error');
    return;
  }

  const quantity = quantities.value[selectedColor.value]?.[selectedSize.value] || 0;
  if (quantity <= 0) {
    showToast('Please select quantity', 'error');
    return;
  }

  try {
    const cartProduct: Product & { 
      selectedColor: string; 
      selectedSize: string; 
      quantity: number; 
      image?: string;
      tax_rate?: string | number;
      taxRate?: string | number;
      logistic_rate?: string | number;
      logistic?: string | number;
      unit_weight?: string | number;
    } = {
      item_id: product.value.item_id,
      title: product.value.title,
      prices: product.value.prices || '0',
      price_min: product.value.price_min || '0',
      price_max: product.value.price_max || '0',
      // Add tax and logistics rates from API
      tax_rate: product.value.tax_rate,
      taxRate: product.value.taxRate,
      logistic_rate: product.value.logistic_rate,
      logistic: product.value.logistic,
      unit_weight: product.value.unit_weight,
      main_imgs: product.value.main_imgs || [],
      sizes: product.value.sizes || '',
      selectedColor: selectedColor.value,
      selectedSize: selectedSize.value,
      quantity: quantity,
      image: displayImages.value[0]
    };
    
    cartStore.addToCart(cartProduct);
    
    showToast('Product added to cart successfully', 'success');
    // Reset selections
    selectedColor.value = null;
    selectedSize.value = null;
    quantities.value = {};
  } catch (error) {
    console.error('Error adding to cart:', error);
    showToast('Failed to add product to cart', 'error');
  }
};

const submitReview = async () => {
  try {
    // Here you would typically make an API call to submit the review
    console.log('Submitting review:', {
      rating: selectedRating.value,
      title: reviewTitle.value,
      text: reviewText.value,
      productId: route.params.id
    });

    // Reset form
    selectedRating.value = 0;
    reviewTitle.value = '';
    reviewText.value = '';
    showReviewForm.value = false;

    // Show success message
    showToast('Review submitted successfully', 'success');
  } catch (error) {
    console.error('Error submitting review:', error);
    showToast('Failed to submit review', 'error');
  }
};

const shareOnSocial = (platform: string) => {
  const url = window.location.href;
  const title = product.value?.title || '';
  const description = product.value?.description || '';

  switch (platform) {
    case 'facebook':
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
      break;
    case 'twitter':
      window.open(`https://twitter.com/intent/tweet?url=${url}&text=${title}&via=your_twitter_handle`, '_blank');
      break;
    case 'pinterest':
      window.open(`https://pinterest.com/pin/create/button/?url=${url}&description=${description}&media=${displayImages.value[0]}`, '_blank');
      break;
    default:
      console.error('Unsupported social platform:', platform);
  }
};

const copyProductLink = () => {
  navigator.clipboard.writeText(window.location.href);
  showToast('Product link copied to clipboard', 'success');
};

const shareProduct = () => {
  const productPath = `product/${route.params.id}`;
  const deepLink = generateDeepLink(productPath, {
    title: product.value?.title || '',
    image: displayImages.value[0]
  });
  
  const universalLink = generateUniversalLink(productPath);
  const shareUrl = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? deepLink : universalLink;
  
  if (navigator.share) {
    navigator.share({
      title: product.value?.title || 'Check out this product',
      text: 'Found this amazing product on Indo B2BT',
      url: shareUrl
    }).catch(console.error);
  } else {
    // Fallback to copying to clipboard
    navigator.clipboard.writeText(shareUrl)
      .then(() => showToast('Link copied to clipboard', 'success'))
      .catch(() => showToast('Failed to copy link', 'error'));
  }
};

const continueShopping = () => {
  // Redirect to category page
  window.location.href = '/category';
};

// Load product details
const loadProductDetails = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    // Get product ID from route
    const productId = route.params.id;
    if (!productId) {
      error.value = 'Product ID is required';
      return;
    }

    console.log('Loading product details for ID:', productId);

    // Load product details and SKUs in parallel
    const [productResponse, skusResponse] = await Promise.all([
      getProductDetails(productId),
      getProductSkus(productId)
    ]);

    console.log('Raw API Response Fields:', {
      tax_rate: productResponse.tax_rate,
      taxRate: productResponse.taxRate,
      tax: productResponse.tax,
      logistic_rate: productResponse.logistic_rate,
      logisticRate: productResponse.logisticRate,
      logistic: productResponse.logistic,
      unit_weight: productResponse.unit_weight,
      unitWeight: productResponse.unitWeight
    });

    // Store API response directly without any defaults
    product.value = {
      ...productResponse,
      // Only use rates from API response
      taxRate: productResponse.tax_rate || productResponse.taxRate || productResponse.tax,
      logisticRate: productResponse.logistic_rate || productResponse.logisticRate || productResponse.logistic,
      unitWeight: productResponse.unit_weight || productResponse.unitWeight
    };

    // Log processed product data
    console.log('Product with rates:', {
      taxRate: product.value.taxRate,
      logisticRate: product.value.logisticRate,
      unitWeight: product.value.unitWeight
    });

    // Process SKUs if available
    if (Array.isArray(skusResponse?.data)) {
      skus.value = skusResponse.data;
      
      // Initialize quantities for each color and size
      const newQuantities: Record<string, Record<string, number>> = {};
      availableColors.value.forEach(color => {
        const colorCode = color.split('~')[0];
        newQuantities[color] = {};
        availableSizes.value.forEach((size: string) => {
          const sku = skus.value.find(s => {
            if (!s?.props_names) return false;
            const [colorPart, sizePart] = s.props_names.split(';');
            const skuColorCode = colorPart.split('~')[0];
            return skuColorCode === colorCode && sizePart === size;
          });
          newQuantities[color][size] = sku ? sku.stock : 0;
        });
      });
      quantities.value = newQuantities;

      // Set default selected color if available
      if (availableColors.value.length > 0) {
        selectedColor.value = availableColors.value[0];
      }
    } else {
      console.warn('No SKUs found or invalid SKU data:', skusResponse);
    }
  } catch (e) {
    console.error('Error loading product details:', e);
    error.value = e instanceof Error ? e.message : 'Failed to load product details';
  } finally {
    loading.value = false;
    isLoading.value = false;
  }
};

// Watch for route changes to reload product
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      loadProductDetails();
    }
  }
);

onMounted(() => {
  loadProductDetails();
});
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <!-- Toast notification -->
      <Toast 
        v-if="toast"
        :message="toast.message"
        :type="toast.type"
      />

      <!-- Loading State -->
      <LoadingBar :show="isLoading" />
      <div v-if="loading" class="flex items-center justify-center min-h-[50vh]">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="ml-4 text-gray-600">Loading product details...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex items-center justify-center min-h-[50vh]">
        <p class="text-red-600">{{ error }}</p>
      </div>

      <!-- Product Details -->
      <div v-else-if="product" class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <!-- Product Images -->
          <div class="space-y-4">
            <div class="aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden">
              <img 
                :src="displayImages[selectedImageIndex]" 
                :alt="product.title"
                class="w-full h-full object-contain"
                @error="($event) => { 
                  const target = $event.target as HTMLImageElement | null;
                  if (target) target.src = 'https://via.placeholder.com/300';
                }"
                loading="eager"
                referrerpolicy="no-referrer"
              />
            </div>
            <!-- Thumbnail Grid -->
            <div class="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 gap-2">
              <button
                v-for="(image, index) in displayImages"
                :key="index"
                @click="selectedImageIndex = index"
                :class="{
                  'ring-2 ring-blue-500': selectedImageIndex === index,
                  'opacity-75 hover:opacity-100 transition-opacity': selectedImageIndex !== index
                }"
                class="aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden"
              >
                <img 
                  :src="image" 
                  :alt="'Product image ' + (index + 1)"
                  class="w-full h-full object-contain"
                  @error="($event) => { 
                    const target = $event.target as HTMLImageElement | null;
                    if (target) target.src = 'https://via.placeholder.com/300';
                  }"
                  loading="lazy"
                  referrerpolicy="no-referrer"
                />
              </button>
            </div>
          </div>

          <!-- Product Info -->
          <div class="space-y-6 lg:sticky lg:top-4">
            <div>
              <h1 class="text-lg font-medium text-gray-900 mb-2">{{ product.title }}</h1>
              <p class="mt-2 text-xl sm:text-2xl text-orange-900">{{ formattedPrice }}</p>
              <!-- Display rates from API -->
              <div class="mt-2 text-sm text-gray-600 space-y-1">
                <p v-if="product.taxRate">Tax Rate (As per DRC): {{ product.taxRate }}%</p>
                <p v-if="product.logisticRate">Logistics: Nu. {{ product.logisticRate }}/kg</p>
                <p v-if="product.unitWeight">Weight: {{ product.unitWeight }} kg</p>
              </div>
            </div>

            <div class="prose prose-sm sm:prose text-gray-500">
              <div v-html="product.description"></div>
            </div>

            <!-- Color Selection -->
            <div class="border-t pt-6">
              <h3 class="text-sm font-medium text-gray-900">Color</h3>
              <div class="mt-2 flex flex-wrap gap-2">
                <button
                  v-for="color in availableColors"
                  :key="color"
                  @click="selectColor(color)"
                  :class="{
                    'ring-2 ring-blue-500': selectedColor === color,
                    'hover:border-gray-400': selectedColor !== color
                  }"
                  class="px-3 py-2 text-sm rounded border transition-all"
                >
                  {{ color }}
                </button>
              </div>
            </div>

            <!-- Size Selection -->
            <div v-if="selectedColor" class="border-t pt-6">
              <h3 class="text-sm font-medium text-gray-900">Size</h3>
              <div class="mt-2 flex flex-wrap gap-2">
                <button
                  v-for="size in availableSizes"
                  :key="size"
                  @click="selectSize(size)"
                  :class="{
                    'ring-2 ring-blue-500': selectedSize === size,
                    'hover:border-gray-400': selectedSize !== size
                  }"
                  class="px-4 py-2 text-sm rounded border transition-all"
                >
                  {{ size }}
                </button>
              </div>
            </div>

            <!-- Quantity Selection -->
            <div v-if="selectedColor && selectedSize" class="border-t pt-6">
              <div class="flex justify-between items-center">
                <h3 class="text-sm font-medium text-gray-900">Quantity</h3>
                <span class="text-sm text-green-600">Stock: {{ selectedStockBalance }}</span>
              </div>
              <div class="mt-2 flex items-center space-x-3">
                <button
                  @click="updateQuantity(selectedColor, selectedSize, -1)"
                  class="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  :disabled="!quantities[selectedColor]?.[selectedSize]"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                  </svg>
                </button>
                <span class="text-gray-900 w-8 text-center">
                  {{ quantities[selectedColor]?.[selectedSize] || 0 }}
                </span>
                <button
                  @click="updateQuantity(selectedColor, selectedSize, 1)"
                  class="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Add to Cart Button -->
            <div class="pt-6 space-y-4">
              <button
                @click="handleAddToCart"
                :disabled="!canAddToCart"
                :class="{
                  'bg-green-600 hover:bg-green-700': canAddToCart,
                  'bg-red-400 cursor-not-allowed': !canAddToCart
                }"
                class="w-full py-3 px-8 flex items-center justify-center text-base font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                {{ addToCartButtonText }}
              </button>
              
              <!-- Continue Shopping Button -->
              <button
                @click="continueShopping"
                class="w-full py-3 px-8 flex items-center justify-center text-base font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>

        <!-- Reviews Section -->
        <div class="mt-16 pt-12 border-t">
          <div class="max-w-2xl mx-auto">
            <h2 class="text-2xl font-bold text-gray-900 mb-8">Customer Reviews</h2>
            
            <!-- Review Stats -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
              <div class="text-center p-6 bg-gray-50 rounded-lg">
                <div class="text-3xl font-bold text-gray-900 mb-2">4.5</div>
                <div class="flex justify-center mb-2">
                  <template v-for="i in 5" :key="i">
                    <svg 
                      :class="i <= 4 ? 'text-yellow-400' : 'text-gray-300'"
                      class="h-5 w-5" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </template>
                </div>
                <div class="text-sm text-gray-600">Based on 128 reviews</div>
              </div>
              
              <div class="md:col-span-2 space-y-4">
                <div v-for="i in 5" :key="i" class="flex items-center">
                  <div class="w-24 text-sm text-gray-600">{{ 6-i }} stars</div>
                  <div class="flex-1 h-4 mx-4 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      class="h-full bg-yellow-400 rounded-full"
                      :style="{ width: ((6-i) * 20) + '%' }"
                    ></div>
                  </div>
                  <div class="w-16 text-sm text-gray-600">{{ ((6-i) * 20) }}%</div>
                </div>
              </div>
            </div>

            <!-- Write Review Button -->
            <div class="text-center mb-12">
              <button 
                @click="showReviewForm = true"
                class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Write a Review
              </button>
            </div>

            <!-- Review List -->
            <div class="space-y-8">
              <div class="border-b border-gray-200 pb-8">
                <div class="flex items-center mb-4">
                  <div class="flex items-center">
                    <template v-for="star in 5" :key="star">
                      <svg 
                        :class="star <= 5 ? 'text-yellow-400' : 'text-gray-300'"
                        class="h-5 w-5" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </template>
                  </div>
                  <span class="ml-3 text-sm font-medium text-gray-900">Karma Dorji</span>
                  <span class="ml-3 text-sm text-gray-500">1 week ago</span>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Perfect fit and amazing quality!</h3>
                <p class="text-gray-600">I absolutely love this product! The quality is exceptional, and it fits perfectly. The material feels premium, and the attention to detail is impressive. I've received many compliments, and it's become my go-to favorite. Definitely worth the investment!</p>
              </div>

              <div class="border-b border-gray-200 pb-8">
                <div class="flex items-center mb-4">
                  <div class="flex items-center">
                    <template v-for="star in 5" :key="star">
                      <svg 
                        :class="star <= 4 ? 'text-yellow-400' : 'text-gray-300'"
                        class="h-5 w-5" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </template>
                  </div>
                  <span class="ml-3 text-sm font-medium text-gray-900">Sonam Choden</span>
                  <span class="ml-3 text-sm text-gray-500">2 weeks ago</span>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Great value for money</h3>
                <p class="text-gray-600">The quality exceeded my expectations for the price point. Shipping was fast and the packaging was excellent. The only minor issue was that it ran slightly larger than expected, but not enough to return. Would definitely recommend sizing down if you're between sizes.</p>
              </div>

              <div class="border-b border-gray-200 pb-8">
                <div class="flex items-center mb-4">
                  <div class="flex items-center">
                    <template v-for="star in 5" :key="star">
                      <svg 
                        :class="star <= 5 ? 'text-yellow-400' : 'text-gray-300'"
                        class="h-5 w-5" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </template>
                  </div>
                  <span class="ml-3 text-sm font-medium text-gray-900">Dawa Norbu</span>
                  <span class="ml-3 text-sm text-gray-500">3 weeks ago</span>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Exactly what I was looking for!</h3>
                <p class="text-gray-600">This is my second purchase and I'm just as impressed as the first time. The durability is outstanding - I've washed it multiple times and it still looks brand new. The color is exactly as shown in the photos. The customer service was also excellent when I had questions about sizing.</p>
              </div>
            </div>

            <!-- Social Sharing -->
            <div class="border-t mt-12 pt-8">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Share this product</h3>
              <div class="flex flex-wrap gap-4">
                <button 
                  @click="shareOnSocial('facebook')"
                  class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <svg class="h-5 w-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
                  </svg>
                  Facebook
                </button>
                <button 
                  @click="shareOnSocial('twitter')"
                  class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <svg class="h-5 w-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  Twitter
                </button>
                <button 
                  @click="shareOnSocial('pinterest')"
                  class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <svg class="h-5 w-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
                  </svg>
                  Pinterest
                </button>
                <button 
                  @click="copyProductLink"
                  class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <svg class="h-5 w-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                  </svg>
                  Copy Link
                </button>
                <button 
                  @click="shareProduct"
                  class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                  </svg>
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Review Form Modal -->
        <div 
          v-if="showReviewForm" 
          class="fixed inset-0 z-[100] overflow-y-auto bg-gray-500 bg-opacity-75"
        >
          <div class="fixed inset-0 flex items-center justify-center p-4">
            <div 
              class="bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto"
              @click.stop
            >
              <!-- Close button -->
              <div class="flex justify-end p-2">
                <button
                  type="button"
                  class="text-gray-400 hover:text-gray-500 focus:outline-none"
                  @click="showReviewForm = false"
                >
                  <span class="sr-only">Close</span>
                  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Modal content -->
              <div class="px-6 pb-6">
                <h3 class="text-lg font-semibold leading-6 text-gray-900 mb-4">
                  Write a Review
                </h3>
                <div class="space-y-4">
                  <!-- Rating -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Rating
                    </label>
                    <div class="flex items-center gap-2">
                      <template v-for="star in 5" :key="star">
                        <button
                          @click="selectedRating = star"
                          class="text-2xl focus:outline-none"
                          :class="star <= selectedRating ? 'text-yellow-400' : 'text-gray-300'"
                        >
                          ★
                        </button>
                      </template>
                    </div>
                  </div>

                  <!-- Review Title -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      v-model="reviewTitle"
                      class="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                      placeholder="Summarize your review"
                    />
                  </div>

                  <!-- Review Text -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Review
                    </label>
                    <textarea
                      v-model="reviewText"
                      rows="4"
                      class="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                      placeholder="Share your experience with this product"
                    ></textarea>
                  </div>
                </div>

                <!-- Modal footer -->
                <div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row-reverse">
                  <button
                    type="button"
                    class="inline-flex w-full justify-center rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 sm:w-auto"
                    @click="submitReview"
                  >
                    Submit Review
                  </button>
                  <button
                    type="button"
                    class="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    @click="showReviewForm = false"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Review Form Modal -->
  </div>
</template>

<style scoped>
.aspect-w-1 {
  position: relative;
  padding-bottom: 100%;
}
.aspect-w-1 > * {
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

/* Add smooth transitions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style>
