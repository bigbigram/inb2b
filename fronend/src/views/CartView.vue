<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Empty Cart State -->
    <div v-if="!cart.items.length" class="text-center py-16">
      <div class="flex flex-col items-center">
        <i class="fas fa-shopping-cart text-8xl text-gray-300 mb-6"></i>
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">Your Cart is Empty</h2>
        <p class="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet.</p>
        <router-link 
          to="/" 
          class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-orange-600 hover:bg-orange-700 transition-colors"
        >
          <i class="fas fa-shopping-bag mr-2"></i>
          Start Shopping
        </router-link>
      </div>
    </div>

    <!-- Cart Items -->
    <div v-else>
      <h1 class="text-2xl font-bold mb-8">Shopping Cart</h1>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Cart Items -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
            <ul class="divide-y divide-gray-200">
              <li v-for="item in cart.items" :key="item.cartId" class="p-6">
                <!-- Product Info -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-4">
                    <img 
                      :src="item.thumbnail || item.main_image || item.image || (Array.isArray(item.images) ? item.images[0] : item.images) || (Array.isArray(item.main_imgs) ? item.main_imgs[0] : item.main_imgs)" 
                      alt="Product image" 
                      class="w-20 h-20 object-cover rounded-lg"
                      @error="$event.target.src = 'https://via.placeholder.com/80?text=No+Image'"
                    >
                    <div>
                      <h3 class="text-lg font-medium text-gray-900">{{ item.title }}</h3>
                      <p class="text-sm text-gray-500">{{ item.description }}</p>
                    </div>
                  </div>
                </div>

                <!-- Price and Quantity -->
                <div class="mt-4">
                  <div class="flex items-center justify-between">
                    <div class="text-lg font-medium text-gray-900">
                      {{ getFormattedPrice(getItemPrice(item)) }}
                    </div>
                    
                    <div class="flex items-center">
                      <button 
                        @click="cart.updateQuantity(item.cartId, item.quantity - 1)"
                        :disabled="item.quantity <= 1"
                        class="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                        </svg>
                      </button>
                      <span class="mx-4 text-gray-900">{{ item.quantity }}</span>
                      <button 
                        @click="cart.updateQuantity(item.cartId, item.quantity + 1)"
                        class="p-2 text-gray-600 hover:text-gray-900"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <!-- Price Details -->
                  <div class="mt-2 text-sm text-gray-500">
                    <div>
                      <p v-if="item.tax_rate || item.taxRate">
                        Tax (As per DRC): {{ getFormattedPrice(getItemTaxAmount(item)) }} 
                        <span v-if="getDisplayRates(item).tax">({{ getDisplayRates(item).tax }})</span>
                      </p>
                      <p v-if="item.logistic_rate || item.logistic">
                        Logistics: {{ getFormattedPrice(getItemLogisticsAmount(item)) }}
                        <span v-if="getDisplayRates(item).logistics && getDisplayRates(item).weight">
                          ({{ getDisplayRates(item).logistics }} × {{ getDisplayRates(item).weight }})
                        </span>
                      </p>
                      <p v-if="!item.tax_rate && !item.taxRate && !item.logistic_rate && !item.logistic" class="text-orange-500">
                        Tax and logistics rates not available
                      </p>
                    </div>
                    <p class="mt-1 font-medium text-gray-700">
                      Total: {{ getFormattedPrice(getItemPrice(item)) }}
                    </p>
                  </div>

                  <!-- Remove Button -->
                  <div class="mt-4 flex justify-end">
                    <button 
                      @click="cart.removeFromCart(item.cartId)"
                      class="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-6">Order Summary</h2>
            
            <div v-if="isLoading" class="text-center py-4">
              <p class="text-gray-500">Loading pricing information...</p>
            </div>

            <div v-else-if="error" class="text-center py-4">
              <p class="text-red-500">{{ error }}</p>
              <button 
                @click="retryExchangeRate"
                class="mt-2 text-blue-500 hover:text-blue-600"
              >
                Retry
              </button>
            </div>

            <div v-else class="space-y-4">
              <!-- Subtotal -->
              <div class="flex justify-between text-base text-gray-600">
                <div>
                  <p>Subtotal</p>
                  <p class="text-sm text-gray-500">CNY to BTN (Rate: {{ pricingStore.cnyToBtnRate.toFixed(2) || 'Not available' }})</p>
                </div>
                <p>{{ getFormattedPrice(cartSubtotal) }}</p>
              </div>
              
              <!-- Tax -->
              <div v-if="totalTax > 0" class="flex justify-between text-base text-gray-600">
                <div>
                  <p>Total Tax</p>
                  <p class="text-sm text-gray-500">Based on individual rates</p>
                </div>
                <p>{{ getFormattedPrice(totalTax) }}</p>
              </div>
              
              <!-- Logistics -->
              <div v-if="totalLogistics > 0" class="flex justify-between text-base text-gray-600">
                <div>
                  <p>Total Logistics</p>
                  <p class="text-sm text-gray-500">Based on weight × rates</p>
                </div>
                <p>{{ getFormattedPrice(totalLogistics) }}</p>
              </div>
              
              <!-- Divider -->
              <div class="border-t border-gray-200 my-4"></div>
              
              <!-- Total -->
              <div class="flex justify-between text-lg font-medium text-gray-900">
                <p>Total</p>
                <p>{{ getFormattedPrice(total) }}</p>
              </div>
            </div>

            <button
              @click="handleCheckout"
              class="w-full mt-6 bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useCartStore } from '../stores/cart'
import { usePricingStore } from '../stores/pricing'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '../stores/notification'

const cart = useCartStore()
const pricingStore = usePricingStore()
const notificationStore = useNotificationStore()
const router = useRouter()

// Initialize pricing store
onMounted(async () => {
  await pricingStore.init()
  checkBulkDiscounts()
})

const isLoading = computed(() => pricingStore.isLoading)
const error = computed(() => pricingStore.error)

// Price calculations using pricing store
const getItemPrice = (item: any) => {
  try {
    console.group('💲 Cart Item Price Calculation');
    console.log('Item Details:', {
      title: item.title,
      price: item.price,
      price_min: item.price_min,
      price_max: item.price_max,
      tax_rate: item.tax_rate,
      logistic_rate: item.logistic_rate,
      unit_weight: item.unit_weight,
      quantity: item.quantity
    });

    const totalPrice = pricingStore.calculateStandardPrice(item);
    const itemTotalPrice = totalPrice * item.quantity;
    
    console.log('Price Calculation:', {
      unitPrice: totalPrice,
      itemTotalPrice,
      quantity: item.quantity
    });
    console.groupEnd();

    return itemTotalPrice;
  } catch (error) {
    console.error('Error calculating cart item price:', error);
    return 0;
  }
};

const getFormattedPrice = (price: number) => {
  return pricingStore.formatStandardPrice(price);
};

// Calculate base prices
const getItemBasePrice = (item: any) => {
  const basePrice = pricingStore.calculateBasePrice(item.price || item.price_min);
  return basePrice * item.quantity;
};

// Calculate tax amount for an item
const getItemTaxAmount = (item: any) => {
  const basePrice = pricingStore.calculateBasePrice(item.price || item.price_min);
  const taxRate = item.tax_rate || item.taxRate;
  return taxRate ? pricingStore.calculateTaxAmount(basePrice, taxRate) * item.quantity : 0;
};

// Calculate logistics amount for an item
const getItemLogisticsAmount = (item: any) => {
  const logisticRate = item.logistic_rate || item.logistic;
  const unitWeight = item.unit_weight;
  return (logisticRate && unitWeight) ? 
    pricingStore.calculateLogisticsAmount(logisticRate, unitWeight) * item.quantity : 0;
};

// Calculate totals
const cartSubtotal = computed(() => {
  return cart.items.reduce((total, item) => total + getItemBasePrice(item), 0);
});

const totalTax = computed(() => {
  return cart.items.reduce((total, item) => total + getItemTaxAmount(item), 0);
});

const totalLogistics = computed(() => {
  return cart.items.reduce((total, item) => total + getItemLogisticsAmount(item), 0);
});

const total = computed(() => {
  return cartSubtotal.value + totalTax.value + totalLogistics.value;
});

// Format display rates
const getDisplayRates = (item: any) => {
  if (!item) return { tax: '', logistics: '', weight: '' };
  
  return {
    tax: (item.tax_rate || item.taxRate) ? `${item.tax_rate || item.taxRate}%` : '',
    logistics: (item.logistic_rate || item.logistic) ? `Nu. ${item.logistic_rate || item.logistic}/kg` : '',
    weight: item.unit_weight ? `${item.unit_weight} kg` : ''
  };
};

// Watch cart total for bulk discount opportunities
watch(() => cart.items, (items) => {
  const bulkEligibleItems = items.filter(item => item.quantity >= 10)
  if (bulkEligibleItems.length > 0) {
    notificationStore.displayToast('You are eligible for a bulk discount', 'success')
  }
}, { deep: true })

// Enhanced checkout with router navigation
const handleCheckout = () => {
  if (cart.items.length === 0) {
    // Notify user if cart is empty
    notificationStore.displayToast('Your cart is empty', 'error')
    return
  }

  // Navigate to checkout page
  router.push({ name: 'checkout' })
}

// Handle bulk discount notifications
const checkBulkDiscounts = () => {
  const itemsWithBulkDiscount = cart.items.filter(item => item.quantity >= 10)
  if (itemsWithBulkDiscount.length > 0) {
    notificationStore.displayToast('You are eligible for a bulk discount', 'success')
  }
}

const retryExchangeRate = () => {
  pricingStore.updateExchangeRate();
}
</script>
