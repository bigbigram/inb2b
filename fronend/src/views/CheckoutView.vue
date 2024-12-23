<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div v-if="cartItems.length === 0" class="text-center py-16">
        <i class="fas fa-shopping-cart text-6xl text-gray-300 mb-4"></i>
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">Your Cart is Empty</h2>
        <router-link 
          to="/" 
          class="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          Continue Shopping
        </router-link>
      </div>
      
      <div v-else class="flex flex-col md:flex-row gap-8">
        <!-- Checkout Form -->
        <div class="flex-1">
          <h2 class="text-3xl font-bold mb-6">Checkout Details</h2>
          
          <!-- Error Message -->
          <div 
            v-if="errorMessage" 
            class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" 
            role="alert"
          >
            <span class="block sm:inline">{{ errorMessage }}</span>
          </div>
          
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Personal Information -->
            <div class="bg-white p-8 rounded-xl shadow-md">
              <h3 class="text-xl font-semibold mb-4">Personal Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Full Name</label>
                  <input 
                    type="text" 
                    v-model="formData.fullName"
                    required
                    placeholder="Enter your full name"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Email</label>
                  <input 
                    type="email" 
                    v-model="formData.email"
                    required
                    placeholder="your@email.com"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                </div>
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700">Phone</label>
                  <input 
                    type="tel" 
                    v-model="formData.phone"
                    required
                    placeholder="Your contact number"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                </div>
              </div>
            </div>

            <!-- Shipping Address -->
            <div class="bg-white p-8 rounded-xl shadow-md">
              <h3 class="text-xl font-semibold mb-4">
                {{ shippingAddresses.length > 0 ? 'Add New Shipping Address' : 'Enter Shipping Address' }}
              </h3>
              <div class="space-y-4">
                <div v-if="shippingAddresses.length > 0" class="bg-white p-6 rounded-xl shadow-md mb-6">
                  <h3 class="text-xl font-semibold mb-4">Saved Shipping Addresses</h3>
                  <div class="space-y-4">
                    <div 
                      v-for="address in shippingAddresses" 
                      :key="address.id" 
                      @click="selectShippingAddress(address.id)"
                      class="flex items-center p-4 border rounded-lg cursor-pointer transition-colors"
                      :class="{
                        'border-indigo-500 bg-indigo-50': selectedShippingAddressId === address.id,
                        'border-gray-300 hover:border-indigo-300': selectedShippingAddressId !== address.id
                      }"
                    >
                      <div class="flex-1">
                        <p class="font-medium">
                          {{ address.address_line1 }}
                          <span v-if="address.address_line2" class="text-gray-500 ml-2">
                            ({{ address.address_line2 }})
                          </span>
                        </p>
                        <p class="text-sm text-gray-600">
                          {{ address.city }}, {{ address.state }} {{ address.postal_code }}
                        </p>
                        <p class="text-sm text-gray-600">{{ address.country }}</p>
                        <span 
                          v-if="address.is_default" 
                          class="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                        >
                          Default Address
                        </span>
                      </div>
                      <input 
                        type="radio" 
                        :checked="selectedShippingAddressId === address.id"
                        class="ml-4"
                      >
                    </div>
                  </div>
                </div>
                <div v-if="showAddressForm" class="bg-white p-8 rounded-xl shadow-md">
                  <h3 class="text-xl font-semibold mb-4">
                    {{ shippingAddresses.length > 0 ? 'Add New Shipping Address' : 'Enter Shipping Address' }}
                  </h3>
                  <div class="space-y-4">
                    <!-- Full Name -->
                    <div class="grid grid-cols-1 gap-4">
                      <div>
                        <label for="fullName" class="block text-sm font-medium text-gray-700">Full Name *</label>
                        <input 
                          type="text" 
                          id="fullName" 
                          v-model="formData.fullName" 
                          required
                          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>

                    <!-- Contact Information -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label for="email" class="block text-sm font-medium text-gray-700">Email *</label>
                        <input 
                          type="email" 
                          id="email" 
                          v-model="formData.email" 
                          required
                          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          placeholder="Enter your email"
                        />
                      </div>
                      <div>
                        <label for="phone" class="block text-sm font-medium text-gray-700">Phone Number *</label>
                        <input 
                          type="tel" 
                          id="phone" 
                          v-model="formData.phone" 
                          required
                          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>

                    <!-- Address Lines -->
                    <div class="grid grid-cols-1 gap-4">
                      <div>
                        <label for="address_line1" class="block text-sm font-medium text-gray-700">Address Line 1 *</label>
                        <input 
                          type="text" 
                          id="address_line1" 
                          v-model="formData.address_line1" 
                          required
                          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          placeholder="Street address, Shop name, company name"
                        />
                      </div>
                      <div>
                        <label for="address_line2" class="block text-sm font-medium text-gray-700">Address Line 2 (Optional)</label>
                        <input 
                          type="text" 
                          id="address_line2" 
                          v-model="formData.address_line2"
                          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          placeholder="Apartment, building"
                        />
                      </div>
                    </div>

                    <!-- City, State, Postal Code, Country -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label for="city" class="block text-sm font-medium text-gray-700">Gewog *</label>
                        <input 
                          type="text" 
                          id="city" 
                          v-model="formData.city" 
                          required
                          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          placeholder="Enter Gewog"
                        />
                      </div>
                      <div>
                        <label for="state" class="block text-sm font-medium text-gray-700">Dzongkhag *</label>
                        <select 
                          id="state" 
                          v-model="formData.state" 
                          required
                          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        >
                          <option value="">Select Dzongkhag</option>
                          <option value="Bumthang">Bumthang</option>
                          <option value="Chhukha">Chhukha</option>
                          <option value="Dagana">Dagana</option>
                          <option value="Gasa">Gasa</option>
                          <option value="Gelephu Thromde">Gelephu Thromde</option>
                          <option value="Haa">Haa</option>
                          <option value="Lhuentse">Lhuentse</option>
                          <option value="Monggar">Monggar</option>
                          <option value="Paro">Paro</option>
                          <option value="Pema Gatshel">Pema Gatshel</option>
                          <option value="Phuentsholing Thromde">Phuentsholing Thromde</option>
                          <option value="Punakha">Punakha</option>
                          <option value="Samdrup Jongkhar">Samdrup Jongkhar</option>
                          <option value="Samdrup Jongkhar Thromde">Samdrup Jongkhar Thromde</option>
                          <option value="Samtse">Samtse</option>
                          <option value="Sarpang">Sarpang</option>
                          <option value="Thimphu">Thimphu</option>
                          <option value="Thimphu Thromde">Thimphu Thromde</option>
                          <option value="Trashigang">Trashigang</option>
                          <option value="Trashiyangtse">Trashiyangtse</option>
                          <option value="Trongsa">Trongsa</option>
                          <option value="Tsirang">Tsirang</option>
                          <option value="Wangdue Phodrang">Wangdue Phodrang</option>
                          <option value="Zhemgang">Zhemgang</option>
                        </select>
                      </div>
                      <div>
                        <label for="postal_code" class="block text-sm font-medium text-gray-700">Postal Code *</label>
                        <input 
                          type="text" 
                          id="postal_code" 
                          v-model="formData.postal_code" 
                          required
                          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          placeholder="Enter postal code" value="123456" readonly
                        />
                      </div>
                    </div>

                    <!-- Country -->
                    <div>
                      <label for="country" class="block text-sm font-medium text-gray-700">Country *</label>
                      <select 
                        id="country" 
                        v-model="formData.country" 
                        required
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      >
                        <option value="">Select</option>
                        <option value="BT">Bhutan</option>
                      </select>
                    </div>

                    <!-- Set as Default Address -->
                    <div class="flex items-center">
                      <input 
                        type="checkbox" 
                        id="is_default" 
                        v-model="formData.is_default"
                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label for="is_default" class="ml-2 block text-sm text-gray-900">
                        Set as default shipping address
                      </label>
                    </div>

                    <!-- Add Address Button -->
                    <div class="mt-4">
                      <button 
                        type="button" 
                        @click="createShippingAddress"
                        class="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        Add Shipping Address
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Payment Method Selection -->
            <div class="bg-white p-8 rounded-xl shadow-md">
              <h3 class="text-xl font-semibold mb-4">Payment Method</h3>
              <div class="space-y-4">
                <div class="flex flex-col sm:flex-row gap-4">
                  <div class="flex-1">
                    <label class="relative flex items-center p-4 border rounded-lg cursor-pointer hover:border-indigo-500 transition-colors">
                      <input 
                        type="radio" 
                        id="cod" 
                        value="cod" 
                        v-model="paymentMethod"
                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        @click="selectPaymentMethod('cod')"
                      >
                      <div class="ml-3">
                        <span class="block text-sm font-medium text-gray-700">Cash on Delivery</span>
                        <span class="block text-sm text-gray-500">Pay when you receive</span>
                      </div>
                    </label>
                  </div>
                  <div class="flex-1">
                    <label class="relative flex items-center p-4 border rounded-lg cursor-pointer hover:border-indigo-500 transition-colors">
                      <input 
                        type="radio" 
                        id="online" 
                        value="online" 
                        v-model="paymentMethod"
                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        @click="selectPaymentMethod('online')"
                      >
                      <div class="ml-3">
                        <span class="block text-sm font-medium text-gray-700">Online Payment</span>
                        <span class="text-xs text-gray-500">Secure online transaction</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Submit Button -->
            <button 
              type="submit" 
              :disabled="isProcessing"
              class="w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {{ isProcessing ? 'Processing...' : 'Place Order' }}
            </button>
          </form>
        </div>

        <!-- Order Summary -->
        <div class="w-full md:w-96">
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
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { usePricingStore } from '@/stores/pricing'
import { useNotificationStore } from '@/stores/notification'
import orderService, { OrderService } from '@/services/orderService'
import shippingAddressService from '@/services/shippingAddressService'
import { useAuthStore } from '@/stores/auth.store'

// Setup script
const router = useRouter()
const cartStore = useCartStore()
const pricingStore = usePricingStore()
const notificationStore = useNotificationStore()
const authStore = useAuthStore()

// Rest of the existing setup code remains the same...

// Form data
const formData = ref<Record<string, any>>({
  fullName: '',
  email: '',
  phone: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  postal_code: '',
  country: '',
  paymentMethod: 'cod'
})

// Shipping addresses state
const shippingAddresses = ref<any[]>([])
const selectedShippingAddressId = ref<number | null>(null)
const loading = ref(false);

// Add ref for form visibility
const isAddingNewAddress = ref(false);

// Fetch shipping addresses on mount if user is authenticated
onMounted(async () => {
  if (authStore.isAuthenticated) {
    await fetchShippingAddresses()
  } else {
    router.push('/login')
  }
})

// Pre-fill form with user data
onMounted(() => {
  if (authStore.user) {
    formData.value.fullName = authStore.user.name || ''
    formData.value.email = authStore.user.email || ''
    formData.value.phone = authStore.user.phone || ''
  }
})

const fetchShippingAddresses = async () => {
  try {
    loading.value = true;
    
    // Fetch addresses and ensure it's an array
    const fetchedAddresses = await shippingAddressService.getAddresses();
    shippingAddresses.value = Array.isArray(fetchedAddresses) 
      ? fetchedAddresses 
      : (console.warn('Addresses is not an array:', fetchedAddresses), []);
    
    // Log fetched addresses for debugging
    console.log('Fetched Shipping Addresses:', shippingAddresses.value);
    
    // Find the default address
    const defaultAddress = shippingAddresses.value.find(
      (address: any) => address.isDefault || address.is_default
    );
    
    if (defaultAddress) {
      selectedShippingAddressId.value = defaultAddress.id;
    } else if (shippingAddresses.value.length > 0) {
      // If no default, select the first address
      selectedShippingAddressId.value = shippingAddresses.value[0].id;
    }
  } catch (error) {
    console.error('Failed to fetch shipping addresses:', error);
    notificationStore.displayToast(
      'Failed to load shipping addresses', 
      'error'
    );
  } finally {
    loading.value = false;
  }
};

const createShippingAddress = async () => {
  try {
    // Validate address data
    if (!validateAddressForm()) {
      return null
    }

    // Prepare address data
    const addressData = {
      full_name: formData.value.fullName,
      email: formData.value.email,
      phone: formData.value.phone,
      address_line1: formData.value.address_line1,
      address_line2: formData.value.address_line2 || null,
      city: formData.value.city,
      state: formData.value.state,
      postal_code: formData.value.postal_code,
      country: formData.value.country || 'Bhutan',
      is_default: false  // You can modify this based on user preference
    }

    // Create shipping address
    const newAddress = await shippingAddressService.createAddress(addressData)

    // Add the new address to the list of shipping addresses
    shippingAddresses.value.push(newAddress)

    // Select the newly created address
    selectedShippingAddressId.value = newAddress.id

    // Reset address form
    isAddingNewAddress.value = false

    // Log for debugging
    console.log('New Shipping Address Created:', newAddress)

    return newAddress.id
  } catch (error: any) {
    // Handle address creation error
    console.error('Failed to create shipping address:', error)
    
    // Display error notification
    notificationStore.displayToast(
      error.message || 'Failed to create shipping address', 
      'error'
    )

    return null
  }
}

const handleCheckout = async () => {
  try {
    console.group('🚨 COMPREHENSIVE CHECKOUT PROCESS');
    
    // Get pricing store
    const pricingStore = usePricingStore();

    // Debug cart items
    console.log('🛒 Raw Cart Items:', cartStore.items);

    // Validate cart has items
    if (cartStore.items.length === 0) {
      console.error('❌ Cart is empty');
      notificationStore.displayToast('Your cart is empty. Please add items before checkout.', 'error');
      return;
    }

    // Reset error states
    errorMessage.value = '';
    isProcessing.value = true;

    // Validate form inputs
    if (!validateForm()) {
      console.warn('❌ Form Validation Failed');
      notificationStore.displayToast('Please fill out all required fields correctly.', 'error');
      isProcessing.value = false;
      return;
    }

    // Validate shipping address
    if (!selectedShippingAddressId.value) {
      console.error('❌ No shipping address selected');
      notificationStore.displayToast('Please select a shipping address.', 'error');
      isProcessing.value = false;
      return;
    }

    // Validate payment method
    if (!paymentMethod.value) {
      console.error('❌ No payment method selected');
      notificationStore.displayToast('Please select a payment method.', 'error');
      isProcessing.value = false;
      return;
    }

    // Detailed cart item validation
    const cartValidationResult = validateCartItems();
    if (!cartValidationResult.isValid) {
      console.warn('❌ Cart Validation Failed:', cartValidationResult.errorMessage);
      notificationStore.displayToast(
        cartValidationResult.errorMessage || 'Invalid cart items', 
        'error'
      );
      isProcessing.value = false;
      return;
    }

    // Compute total with explicit logging using pricing store
    const itemPriceDetails = cartStore.items.map(item => {
      // Use pricing store to calculate base price
      const basePrice = pricingStore.getItemPrice(item);
      
      // Calculate tax amount
      const taxAmount = getItemTaxAmount(item);
      
      // Then calculate standard price with additional costs
      const standardPrice = pricingStore.calculateStandardPrice(item);
      
      console.log(`🔍 Item Price Breakdown for ${item.title || 'Unknown Product'}:`, {
        productId: item.id || item.product_id || item.item_id,
        quantity: item.quantity,
        basePrice: basePrice,
        taxAmount: taxAmount,
        standardPrice: standardPrice,
        totalItemPrice: standardPrice * item.quantity
      });

      return {
        productId: item.id || item.product_id || item.item_id,
        title: item.title,
        quantity: item.quantity,
        basePrice: basePrice,
        taxAmount: taxAmount,
        standardPrice: standardPrice,
        totalItemPrice: standardPrice * item.quantity
      };
    });

    const subtotal = itemPriceDetails.reduce((sum, item) => sum + item.totalItemPrice, 0);
    const totalTax = itemPriceDetails.reduce((sum, item) => sum + item.taxAmount, 0);
    
    // Use pricing store's shipping cost calculation
    const shippingCost = pricingStore.calculateShippingCost(cartStore.items);

    console.log('💸 Total Calculation:', {
      subtotal: subtotal,
      totalTax: totalTax,
      shippingCost: shippingCost,
      totalAmount: subtotal + totalTax + shippingCost
    });

    // Validate total amount explicitly
    if (subtotal <= 0) {
      console.error('❌ Invalid total amount:', subtotal);
      notificationStore.displayToast(
        'Unable to process order. Total amount is zero. Please check your cart items.', 
        'error'
      );
      isProcessing.value = false;
      return;
    }

    // Prepare order data with robust error handling
    const orderData = {
      shipping_address_id: selectedShippingAddressId.value,
      payment_method: paymentMethod.value,
      payment_status: 'pending',
      status: 'pending',
      total_amount: Number((subtotal + totalTax + shippingCost).toFixed(2)),
      shipping_cost: Number(shippingCost.toFixed(2)),
      tax_amount: Number(totalTax.toFixed(2)),
      notes: formData.value.notes || null,
      order_items: cartStore.items.map(item => {
        // Use pricing store to calculate base price
        const basePrice = pricingStore.getItemPrice(item);
        
        // Then calculate standard price with additional costs
        const standardPrice = pricingStore.calculateStandardPrice(item);

        // Robust product ID extraction
        const productId = item.id || item.product_id || item.item_id;
        if (!productId) {
          console.error('❌ Cart item missing product ID:', item);
          throw new Error(`Cart item is missing a valid product ID: ${JSON.stringify(item)}`);
        }

        return {
          product_id: productId,
          product_name: item.title || item.name || 'Unknown Product',
          unit_price: Number(basePrice.toFixed(2)),
          quantity: item.quantity,
          total_price: Number((standardPrice * item.quantity).toFixed(2)),
          color: item.selectedColor || null,
          size: item.selectedSize || null,
          product_options: item.selectedOptions ? JSON.stringify(item.selectedOptions) : null
        };
      })
    };

    console.log('📦 Prepared Order Data:', orderData);

    // Create the order
    const createdOrder = await orderService.createOrder(orderData);

    console.log('✅ Order Created:', createdOrder);

    // Clear cart after successful order
    cartStore.clearCart();

    // Navigate to order confirmation
    router.push({
      name: 'OrderConfirmation', 
      params: { 
        orderId: createdOrder.id 
      }
    });

    console.groupEnd();
  } catch (error: any) {
    console.group('❌ Checkout Error');
    console.error('Full Error Object:', error);
    
    // Display specific error message
    const errorMsg = error.message || 
      'An unexpected error occurred during checkout. Please try again.';
    
    // Set error state
    errorMessage.value = errorMsg;

    // Show error notification
    notificationStore.displayToast(errorMsg, 'error');

    console.groupEnd();
  } finally {
    // Always reset processing state
    isProcessing.value = false;
  }
};

const handleSubmit = async (event: Event) => {
  // Prevent default form submission
  event.preventDefault();

  // Reset previous error states
  errorMessage.value = '';
  formErrors.value = {};

  try {
    // Validate form inputs
    if (!validateForm()) {
      return;
    }

    // Proceed with checkout
    await handleCheckout();
  } catch (error: any) {
    // Catch any unexpected errors
    console.error('Checkout submission error:', error);

    // Set error message
    const errorMsg = error.message || 
      'An unexpected error occurred during checkout. Please try again.';
    
    errorMessage.value = errorMsg;
    
    // Show error notification
    notificationStore.displayToast(errorMsg, 'error');
  }
};

const showAddressForm = computed(() => {
  return isAddingNewAddress.value || shippingAddresses.value.length === 0;
});

const selectShippingAddress = (addressId: number) => {
  // Find the selected address
  const address = shippingAddresses.value.find(addr => addr.id === addressId)
  
  if (address) {
    // Update the selected shipping address
    selectedShippingAddressId.value = addressId
    
    // Log for debugging
    console.log('Selected Shipping Address:', {
      id: address.id,
      fullAddress: `${address.address_line1}, ${address.city}, ${address.state} ${address.postal_code}`
    })
  } else {
    console.error('No address found with ID:', addressId)
  }
}

const selectPaymentMethod = (method: string) => {
  // Set the payment method
  paymentMethod.value = method
  
  // Log for debugging
  console.log('Selected Payment Method:', method)
}

const validateForm = () => {
  // Reset previous errors
  formErrors.value = {}

  // Log current state for debugging
  console.log('Validation State:', {
    selectedShippingAddressId: selectedShippingAddressId.value,
    isAddingNewAddress: isAddingNewAddress.value,
    paymentMethod: paymentMethod.value,
    shippingAddresses: shippingAddresses.value
  })

  // Validate shipping address
  const hasValidShippingAddress = 
    (selectedShippingAddressId.value !== null) || 
    isAddingNewAddress.value

  if (!hasValidShippingAddress) {
    console.warn('No shipping address selected or being added')
    notificationStore.displayToast('Please select a shipping address or add a new one', 'error')
    return false
  }

  // Validate cart
  if (!cartStore.items.length) {
    notificationStore.displayToast('Your cart is empty', 'error')
    return false
  }

  // If adding new address, validate address fields
  if (isAddingNewAddress.value) {
    const requiredFields = [
      'fullName', 
      'email', 
      'phone', 
      'address_line1', 
      'city', 
      'state', 
      'postal_code', 
      'country'
    ]

    requiredFields.forEach(field => {
      if (!formData.value[field]) {
        formErrors.value[field] = `${field.replace('_', ' ').toUpperCase()} is required`
      }
    })

    // Validate email format
    if (formData.value.email && !/\S+@\S+\.\S+/.test(formData.value.email)) {
      formErrors.value.email = 'Invalid email format'
    }

    // Validate phone number (basic format check)
    if (formData.value.phone && !/^\+?[1-9]\d{1,14}$/.test(formData.value.phone)) {
      formErrors.value.phone = 'Invalid phone number'
    }

    // Check if there are any form errors
    if (Object.keys(formErrors.value).length > 0) {
      notificationStore.displayToast('Please correct the form errors', 'error')
      return false
    }
  }

  // Validate payment method
  if (!paymentMethod.value) {
    console.warn('No payment method selected')
    notificationStore.displayToast('Please select a payment method', 'error')
    return false
  }

  return true
}

const validateCartItems = () => {
  // Validate each cart item using existing calculation methods
  const invalidItems = cartStore.items.filter(item => {
    // Check for missing or invalid item information
    if (!item.id && !item.item_id) {
      console.error('Cart item missing ID:', item)
      return true
    }

    // Check for missing or invalid quantity
    if (!item.quantity || item.quantity <= 0) {
      console.error('Cart item has invalid quantity:', item)
      return true
    }

    // Validate price calculation
    try {
      const basePrice = getItemBasePrice(item)
      const taxAmount = getItemTaxAmount(item)
      const logisticsAmount = getItemLogisticsAmount(item)

      if (basePrice <= 0) {
        console.error('Cart item has invalid base price:', item)
        return true
      }
    } catch (error) {
      console.error('Error calculating item prices:', error, item)
      return true
    }

    return false
  })

  // If any invalid items are found, throw an error
  if (invalidItems.length > 0) {
    console.error('Invalid cart items found:', invalidItems)
    return {
      isValid: false,
      errorMessage: `${invalidItems.length} cart item(s) are invalid. Please review your cart.`
    }
  }

  // Log cart summary for debugging
  console.log('Cart Items Validation Summary:', {
    totalItems: cartStore.items.length,
    totalPrice: cartStore.totalPrice,
    items: cartStore.items.map(item => ({
      id: item.id || item.item_id,
      name: item.title || item.name,
      quantity: item.quantity,
      basePrice: getItemBasePrice(item),
      taxAmount: getItemTaxAmount(item),
      logisticsAmount: getItemLogisticsAmount(item)
    }))
  })

  return {
    isValid: true
  }
}

const getItemPrice = (item: any): number => {
  return pricingStore.calculateStandardPrice(item);
};

const getFormattedPrice = (price: number): string => {
  return pricingStore.formatStandardPrice(price);
};

const getItemBasePrice = (item: any): number => {
  const basePrice = pricingStore.calculateBasePrice(item.price || item.price_min);
  return basePrice * item.quantity;
};

const getItemTaxAmount = (item: any): number => {
  const basePrice = pricingStore.calculateBasePrice(item.price || item.price_min);
  const taxRate = item.tax_rate || item.taxRate;
  return taxRate ? pricingStore.calculateTaxAmount(basePrice, taxRate) * item.quantity : 0;
};

const getItemLogisticsAmount = (item: any): number => {
  const logisticRate = item.logistic_rate || item.logistic;
  const unitWeight = item.unit_weight;
  return (logisticRate && unitWeight) ? 
    pricingStore.calculateLogisticsAmount(logisticRate, unitWeight) * item.quantity : 0;
};

const getDisplayRates = (item: any) => {
  if (!item) return { tax: '', logistics: '', weight: '' };
  
  return {
    tax: (item.tax_rate || item.taxRate) ? `${item.tax_rate || item.taxRate}%` : '',
    logistics: (item.logistic_rate || item.logistic) ? `Nu. ${item.logistic_rate || item.logistic}/kg` : '',
    weight: item.unit_weight ? `${item.unit_weight} kg` : ''
  };
};

const retryExchangeRate = () => {
  pricingStore.updateExchangeRate();
};

// Calculate totals
const isLoading = computed(() => pricingStore.isLoading)
const error = computed(() => pricingStore.error)

const cartSubtotal = computed(() => {
  return cartStore.items.reduce((total, item) => total + getItemBasePrice(item), 0);
});

const totalTax = computed(() => {
  return cartStore.items.reduce((total, item) => total + getItemTaxAmount(item), 0);
});

const totalLogistics = computed(() => {
  return cartStore.items.reduce((total, item) => total + getItemLogisticsAmount(item), 0);
});

const total = computed(() => {
  return cartSubtotal.value + totalTax.value + totalLogistics.value;
});

// Rest of the existing code remains the same...

const isProcessing = ref(false)
const errorMessage = ref<string>('');
const formErrors = ref<Record<string, string>>({})
const paymentMethod = ref('')

const calculateShippingCost = (): number => {
  try {
    console.group('🚚 Shipping Cost Calculation');
    
    // If no items, return a default minimum shipping cost
    if (cartStore.items.length === 0) {
      console.log('❗ No items in cart. Returning default minimum shipping cost.');
      return 50; // Default minimum shipping cost
    }

    // Calculate shipping based on total weight
    const totalWeight = cartStore.items.reduce((total, item) => {
      // Use unit_weight, unit_weight, or default to 0.5
      const itemWeight = Number(item.unit_weight || item.weight || 0.5);
      const quantity = Number(item.quantity || 1);
      
      console.log(`🏋️ Item Weight Calculation:`, {
        title: item.title,
        unitWeight: itemWeight,
        quantity: quantity,
        totalItemWeight: itemWeight * quantity
      });

      return total + (itemWeight * quantity);
    }, 0);

    // Base shipping rate (can be adjusted based on your business logic)
    const baseShippingRate = 50; // Nu. 50 per kg
    
    // Calculate shipping cost
    const shippingCost = Math.max(
      50, // Minimum shipping cost
      Math.ceil(totalWeight * baseShippingRate)
    );

    console.log('📦 Shipping Cost Breakdown:', {
      totalWeight: totalWeight,
      baseShippingRate: baseShippingRate,
      calculatedShippingCost: shippingCost
    });

    console.groupEnd();

    return shippingCost;
  } catch (error) {
    console.error('❌ Shipping Cost Calculation Error:', error);
    console.groupEnd();
    
    // Fallback to a default shipping cost
    return 50;
  }
};

const calculateTaxAmount = () => {
  // Implement tax calculation logic
  return 0 // Placeholder
}

const toggleAddressForm = (show: boolean) => {
  isAddingNewAddress.value = show;
  if (!show) {
    // Reset form data when hiding
    formData.value = {
      fullName: '',
      email: '',
      phone: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      paymentMethod: 'cod'
    };
  }
};

const cartItems = computed(() => {
  return cartStore.items.map(item => ({
    ...item,
    displayPrice: getItemPrice(item)
  }));
});
</script>

<style scoped>
.sticky {
  position: sticky;
  top: 1rem;
}
</style>
