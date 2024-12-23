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
                        class="form-radio h-5 w-5 text-indigo-600"
                      >
                    </div>
                  </div>
                </div>
                <div class="bg-white p-8 rounded-xl shadow-md">
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
                        v-model="formData.paymentMethod"
                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      >
                      <div class="ml-3">
                        <span class="block text-sm font-medium text-gray-700">Cash on Delivery</span>
                        <span class="block text-sm text-gray-500">Pay when you receive</span>
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
          <div class="bg-white p-8 rounded-xl shadow-md sticky top-4">
            <h3 class="text-xl font-semibold mb-4">Order Summary</h3>
            
            <!-- Cart Items -->
            <div class="space-y-4 mb-6">
              <div 
                v-for="item in cartItems" 
                :key="item.id" 
                class="flex justify-between items-center"
              >
                <div>
                  <p class="font-small">{{ item.title }}</p>
                  <p class="text-sm text-gray-500">
                    {{ item.quantity }} × Nu. {{ getFormattedPrice(item.displayPrice) }}
                  </p>
                </div>
                <p class="font-medium">
                  Nu. {{ getFormattedPrice(item.displayPrice * item.quantity) }}
                </p>
              </div>
            </div>
            
            <!-- Price Breakdown -->
            <div class="space-y-2 mb-4">
              <div class="flex justify-between text-base">
                <p class="text-gray-500">Subtotal</p>
                <p class="font-medium text-gray-900">
                  Nu. {{ getFormattedPrice(cartSubtotal) }}
                  <span class="text-xs text-gray-500 block">
                    ({{ cartStore.items.map(item => `${item.title}: Nu. ${getFormattedPrice(getItemPrice(item))}`).join(', ') }})
                  </span>
                </p>
              </div>
              <div class="flex justify-between text-base">
                <p class="text-gray-500">Tax</p>
                <p class="font-medium text-gray-900">
                  Nu. {{ getFormattedPrice(taxAmount) }}
                  <span class="text-xs text-gray-500 block">
                    ({{ cartStore.items.map(item => `${item.title}: Nu. ${getFormattedPrice(getItemTaxAmount(item))}`).join(', ') }})
                  </span>
                </p>
              </div>
              <div class="flex justify-between text-base">
                <p class="text-gray-500">Logistic Cost</p>
                <p class="font-medium text-gray-900">
                  Nu. {{ getFormattedPrice(logisticsAmount) }}
                  <span class="text-xs text-gray-500 block">
                    ({{ cartStore.items.map(item => `${item.title}: Nu. ${getFormattedPrice(getItemLogisticsAmount(item))}`).join(', ') }})
                  </span>
                </p>
              </div>
              <div class="border-t border-gray-200 pt-4">
                <div class="flex justify-between text-base">
                  <p class="text-lg font-semibold text-gray-900">Total</p>
                  <p class="text-lg font-semibold text-gray-900">
                    Nu. {{ getFormattedPrice(totalAmount) }}
                  </p>
                </div>
                <p class="mt-1 text-sm text-gray-500">
                  Detailed breakdown of pricing includes base price, tax, and logistics
                </p>
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
import AuthService from '@/services/AuthService'
import api from '@/services/api'
import { CreateOrderData, CreateShippingAddressData, OrderItem, ShippingAddress } from '@/types/order';
import OrderService from '../services/OrderService'

const router = useRouter()
const cartStore = useCartStore()
const pricingStore = usePricingStore()
const notificationStore = useNotificationStore()

const getItemPrice = (item: any): number => {
  return pricingStore.calculateStandardPrice(item);
};

const getFormattedPrice = (price: number): string => {
  return pricingStore.formatStandardPrice(price);
};

const getItemBasePrice = (item: any): number => {
  // Try multiple ways to extract price
  const basePrice = pricingStore.calculateBasePrice(
    item.price || 
    item.price_min || 
    (item.product?.price) || 
    0
  );
  
  console.log('Item Base Price Calculation:', {
    title: item.title,
    originalPrice: item.price || item.price_min,
    basePrice: basePrice
  });

  return basePrice;
};

const getItemTaxAmount = (item: any): number => {
  const basePrice = getItemBasePrice(item);
  const taxRate = parseFloat(item.tax_rate || item.taxRate || '0');
  const taxAmount = pricingStore.calculateTaxAmount(basePrice, taxRate);
  
  console.log('Item Tax Calculation:', {
    title: item.title,
    basePrice: basePrice,
    taxRate: `${taxRate}%`,
    taxAmount: taxAmount
  });

  return taxAmount;
};

const getItemLogisticsAmount = (item: any): number => {
  const logisticRate = parseFloat(item.logistic_rate || item.logistic || '0');
  const unitWeight = parseFloat(item.unit_weight || '0');
  const logisticsAmount = pricingStore.calculateLogisticsAmount(logisticRate, unitWeight);
  
  console.log('Item Logistics Calculation:', {
    title: item.title,
    logisticRate: logisticRate,
    unitWeight: unitWeight,
    logisticsAmount: logisticsAmount
  });

  return logisticsAmount;
};

const getDisplayRates = (item: any) => {
  return pricingStore.getDisplayRates(item);
};

// Calculate totals
const cartSubtotal = computed(() => {
  return cartStore.items.reduce((total, item) => {
    const itemBasePrice = getItemBasePrice(item);
    const itemTotal = itemBasePrice * item.quantity;
    console.log('Item Subtotal Breakdown:', {
      title: item.title,
      basePrice: itemBasePrice,
      quantity: item.quantity,
      itemTotal: itemTotal
    });
    return total + itemTotal;
  }, 0);
});

const taxAmount = computed(() => {
  return cartStore.items.reduce((total, item) => {
    const itemBasePrice = getItemBasePrice(item);
    const itemTax = getItemTaxAmount(item);
    const itemTotal = itemTax * item.quantity;
    console.log('Item Tax Breakdown:', {
      title: item.title,
      basePrice: itemBasePrice,
      taxRate: item.tax_rate || item.taxRate || '0%',
      itemTax: itemTotal
    });
    return total + itemTotal;
  }, 0);
});

const logisticsAmount = computed(() => {
  return cartStore.items.reduce((total, item) => {
    const itemLogistics = getItemLogisticsAmount(item);
    const itemTotal = itemLogistics * item.quantity;
    console.log('Item Logistics Breakdown:', {
      title: item.title,
      logisticsRate: item.logistic_rate || item.logistic,
      itemLogistics: itemTotal
    });
    return total + itemTotal;
  }, 0);
});

const totalAmount = computed(() => {
  const subtotal = cartSubtotal.value;
  const tax = taxAmount.value;
  const logistics = logisticsAmount.value;
  const total = subtotal + tax + logistics;

  console.log('Total Amount Breakdown:', {
    subtotal: subtotal,
    tax: tax,
    logistics: logistics,
    total: total
  });

  return total;
});

const cartItems = computed(() => {
  return cartStore.items.map(item => ({
    ...item,
    displayPrice: getItemPrice(item)
  }));
});

const formData = ref({
  fullName: '',
  email: '',
  phone: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  postal_code: '123456',
  country: '',
  is_default: false,
  paymentMethod: 'cod' // Default to Cash on Delivery
})

const isProcessing = ref(false)
const errorMessage = ref('')

// Shipping Address Management
const shippingAddresses = ref<ShippingAddress[]>([]);
const selectedShippingAddressId = ref<number | null>(null);
const isLoadingAddresses = ref(false);

const fetchShippingAddresses = async () => {
  // Reset state
  isLoadingAddresses.value = true;
  shippingAddresses.value = [];
  selectedShippingAddressId.value = null;

  try {
    // Check if user is authenticated
    const user = AuthService.getCurrentUser();
    if (!user) {
      console.warn('No authenticated user found. Cannot fetch shipping addresses.');
      notificationStore.displayToast('Please log in to view shipping addresses', 'warning');
      return;
    }

    // Check token availability
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No authentication token found.');
      notificationStore.displayToast('Authentication required to view shipping addresses', 'warning');
      return;
    }

    console.log('Attempting to fetch shipping addresses for user:', user);

    // Fetch user's shipping addresses
    const addresses = await OrderService.getUserShippingAddresses();
    
    // Update shipping addresses
    shippingAddresses.value = addresses;

    console.log('Fetched Shipping Addresses:', addresses);

    // Automatically select default address if exists
    const defaultAddress = addresses.find(addr => addr.is_default);
    if (defaultAddress) {
      selectedShippingAddressId.value = defaultAddress.id;
      console.log('Auto-selected default shipping address:', defaultAddress);
    } else if (addresses.length > 0) {
      // If no default, select the first address
      selectedShippingAddressId.value = addresses[0].id;
      console.log('Selected first available shipping address:', addresses[0]);
    } else {
      // If no addresses exist, prompt user to create one
      notificationStore.displayToast('Please create a shipping address', 'warning');
    }
  } catch (error) {
    console.error('Failed to fetch shipping addresses:', error);
    
    // More detailed error handling
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes('unauthorized') || errorMessage.includes('token')) {
        notificationStore.displayToast('Please log in again', 'error');
      } else {
        notificationStore.displayToast(
          error.message || 'Could not load shipping addresses', 
          'error'
        );
      }
    } else {
      notificationStore.displayToast('An unexpected error occurred', 'error');
    }
  } finally {
    // Always reset loading state
    isLoadingAddresses.value = false;
  }
};

// Call on component mount
onMounted(async () => {
  const user = AuthService.getCurrentUser();
  if (user) {
    await fetchShippingAddresses();
  }
});

// Method to select a shipping address
const selectShippingAddress = (addressId: number) => {
  selectedShippingAddressId.value = addressId;
  console.log('Selected shipping address:', addressId);
};

// Method to create a new shipping address
const createShippingAddress = async () => {
  try {
    // Validate form data
    const validationErrors: string[] = [];

    // Full Name validation
    if (!formData.value.fullName || formData.value.fullName.trim().length < 2) {
      validationErrors.push('Full Name must be at least 2 characters long');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.value.email || !emailRegex.test(formData.value.email)) {
      validationErrors.push('Please enter a valid email address');
    }

    // Phone validation (8-15 digits)
    const phoneRegex = /^[0-9]{8,15}$/;
    if (!formData.value.phone || !phoneRegex.test(formData.value.phone.replace(/\s+/g, ''))) {
      validationErrors.push('Please enter a valid phone number (8-15 digits)');
    }

    // Address Line 1 validation
    if (!formData.value.address_line1 || formData.value.address_line1.trim().length < 3) {
      validationErrors.push('Address Line 1 is required and must be at least 3 characters');
    }

    // City validation
    if (!formData.value.city || formData.value.city.trim().length < 2) {
      validationErrors.push('City is required and must be at least 2 characters');
    }

    // State validation
    if (!formData.value.state || formData.value.state.trim().length < 2) {
      validationErrors.push('State/Province is required and must be at least 2 characters');
    }

    // Country validation
    if (!formData.value.country) {
      validationErrors.push('Please select a country');
    }

    // If there are validation errors, show them and stop
    if (validationErrors.length > 0) {
      const errorMessage = validationErrors.join('\n');
      notificationStore.displayToast(errorMessage, 'error');
      return;
    }

    const addressData: CreateShippingAddressData = {
      user_id: AuthService.getCurrentUser()?.id || 0,
      full_name: formData.value.fullName,
      email: formData.value.email,
      phone: formData.value.phone,
      address_line1: formData.value.address_line1,
      address_line2: formData.value.address_line2 || null,
      city: formData.value.city,
      state: formData.value.state,
      postal_code: formData.value.postal_code,
      country: formData.value.country,
      is_default: shippingAddresses.value.length === 0 // First address becomes default
    };

    // Log shipping address creation attempt
    console.log('Attempting to create shipping address:', addressData);

    const newAddressResponse = await OrderService.createShippingAddress(addressData);
    
    // Extract the actual address 
    const newAddress = newAddressResponse;

    // Add to existing addresses
    shippingAddresses.value.push(newAddress);

    // Select the newly created address
    selectedShippingAddressId.value = newAddress.id;

    console.log('Created new shipping address:', {
      id: newAddress.id,
      fullAddress: newAddress
    });

    // Reset form after successful creation
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
      is_default: false,
      paymentMethod: 'cod'
    };

    // Optionally reset form or show success message
    notificationStore.displayToast('Shipping address added successfully', 'success');
  } catch (addressError) {
    console.error('Failed to create shipping address:', addressError);
    notificationStore.displayToast(
      addressError instanceof Error ? addressError.message : 'Failed to create shipping address', 
      'error'
    );
  }
};

// Pre-fill form with user data if logged in
onMounted(() => {
  const user = AuthService.getCurrentUser()
  if (user) {
    formData.value.fullName = user.name || ''
    formData.value.email = user.email || ''
    formData.value.phone = user.phone || ''
  }
})

const validateForm = () => {
  const requiredFields = [
    { field: 'fullName', message: 'Full Name is required', validator: (value: string) => value.trim().length >= 2 },
    { 
      field: 'phone', 
      message: 'Valid phone number is required', 
      validator: (value: string) => /^[0-9]{8,15}$/.test(value.replace(/\s+/g, '')) 
    },
    { 
      field: 'address_line1', 
      message: 'Address Line 1 must be at least 3 characters', 
      validator: (value: string) => value.trim().length >= 3 
    },
    { 
      field: 'city', 
      message: 'City must be at least 2 characters', 
      validator: (value: string) => value.trim().length >= 2 
    },
    { 
      field: 'state', 
      message: 'State must be at least 2 characters', 
      validator: (value: string) => value.trim().length >= 2 
    },
    { 
      field: 'postal_code', 
      message: 'Postal Code must be 3-10 characters', 
      validator: (value: string) => /^[A-Za-z0-9\s-]{3,10}$/.test(value.trim()) 
    },
    { 
      field: 'country', 
      message: 'Country must be at least 2 characters', 
      validator: (value: string) => value.trim().length >= 2 
    },
    { field: 'paymentMethod', message: 'Payment Method is required' }
  ];

  for (const { field, message, validator } of requiredFields) {
    const value = formData.value[field];
    
    // Skip validation for fields without a specific validator
    if (!validator) {
      if (!value) {
        notificationStore.displayToast(message, 'error');
        return false;
      }
      continue;
    }

    // Perform validation with custom validator
    if (!value || !validator(value)) {
      notificationStore.displayToast(message, 'error');
      return false;
    }
  }

  return true;
};

const createOrder = async () => {
  let orderData: CreateOrderData | null = null;

  try {
    // Check if shipping addresses exist
    if (shippingAddresses.value.length === 0) {
      // Automatically open shipping address form
      const newAddressModal = document.getElementById('new-address-modal')
      if (newAddressModal) {
        // Assuming you have a modal or form to add shipping address
        newAddressModal.classList.remove('hidden')
      }
      
      // Throw a more actionable error
      throw new Error('Please add a shipping address before creating an order. A new address form has been opened for you.');
    }

    // Validate selected shipping address
    const selectedAddress = shippingAddresses.value.find(addr => addr.is_default)
    if (!selectedAddress) {
      throw new Error('Please select a default shipping address or mark an address as default.');
    }

    // Validate cart items
    if (!cartItems.value || cartItems.value.length === 0) {
      throw new Error('Your cart is empty. Please add items before creating an order.');
    }

    // Debug log cart items
    console.log('Cart Items:', JSON.parse(JSON.stringify(cartItems.value)));

    // Calculate totals manually
    const baseAmount = cartItems.value.reduce((total, item) => {
      return total + (getItemPrice(item) * item.quantity);
    }, 0);

    const taxAmount = cartItems.value.reduce((total, item) => {
      return total + getItemTaxAmount(item) * item.quantity;
    }, 0);

    const logisticsAmount = cartItems.value.reduce((total, item) => {
      return total + getItemLogisticsAmount(item) * item.quantity;
    }, 0);

    const totalAmount = baseAmount + taxAmount + logisticsAmount;

    // Construct order data with safe item mapping
    orderData = {
      shipping_address_id: selectedAddress.id,
      base_amount: baseAmount,
      tax_amount: taxAmount,
      logistics_amount: logisticsAmount,
      total_amount: totalAmount,
      items: cartItems.value.map(item => {
        // Add comprehensive error checking
        if (!item) {
          throw new Error('Invalid cart item: item is undefined');
        }

        // Safely extract product name (adjusted for cart store structure)
        const productName = 
          item.name || 
          item.item_name || 
          item.title || 
          (item.product && (item.product.name || item.product.title)) || 
          'Unnamed Product';

        return {
          product_name: productName,
          quantity: item.quantity || 1,
          unit_price: getItemPrice(item),
          color: item.selectedColor || item.color || null,
          size: item.selectedSize || item.size || null
        };
      }),
      notes: null // Remove reference to undefined orderNotes
    };

    // Validate order data before submission
    if (!orderData.items || orderData.items.length === 0) {
      throw new Error('No valid items in the cart. Please add items before creating an order.');
    }

    console.log('Prepared Order Data:', JSON.parse(JSON.stringify(orderData)));

    const createdOrder = await OrderService.createOrder(orderData);

    console.log('Order created successfully:', createdOrder);

    // Clear the cart after successful order
    cartStore.clearCart();

    // Navigate to order confirmation
    router.push({ 
      name: 'OrderConfirmation', 
      params: { 
        orderId: createdOrder.id 
      } 
    });
  } catch (error) {
    console.error('Order Creation Failed:', { 
      error, 
      orderData: orderData ? JSON.parse(JSON.stringify(orderData)) : 'Undefined' 
    });

    // Display user-friendly error message
    errorMessage.value = error instanceof Error 
      ? error.message 
      : 'An unexpected error occurred while creating the order';

    // Display toast notification
    notificationStore.displayToast(errorMessage.value, 'error');
  } finally {
    // Always reset processing state
    isProcessing.value = false;
  }
};

const handleSubmit = async () => {
  await createOrder();
};
</script>

<style scoped>
.sticky {
  position: sticky;
  top: 1rem;
}
</style>
