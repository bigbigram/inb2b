<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Order Tracking Form -->
    <div v-if="!currentOrder" class="max-w-lg mx-auto">
      <h1 class="text-2xl font-bold mb-6">Track Your Order</h1>
      
      <form @submit.prevent="trackOrder" class="space-y-4">
        <div>
          <label for="orderNumber" class="block text-sm font-medium text-gray-700 mb-1">
            Order Number
          </label>
          <input
            id="orderNumber"
            v-model="orderNumber"
            type="text"
            placeholder="Enter your order number"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <span v-if="loading">Tracking...</span>
          <span v-else>Track Order</span>
        </button>
      </form>
    </div>

    <!-- Order Details -->
    <div v-else class="max-w-3xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Order #{{ currentOrder.order_number }}</h1>
        <button
          @click="currentOrder = null"
          class="text-blue-600 hover:text-blue-800"
        >
          Track Another Order
        </button>
      </div>

      <!-- Order Status Timeline -->
      <div class="mb-8">
        <div class="relative">
          <!-- Timeline Line -->
          <div class="absolute left-8 top-0 h-full w-0.5 bg-gray-200"></div>

          <!-- Timeline Steps -->
          <div class="space-y-8">
            <!-- Order Placed -->
            <div class="relative flex items-center">
              <div 
                :class="{
                  'w-4 h-4 rounded-full border-2 flex-shrink-0 z-10': true,
                  'bg-green-500 border-green-500': hasStatus('pending'),
                  'bg-white border-gray-300': !hasStatus('pending')
                }"
              ></div>
              <div class="ml-6">
                <h3 class="font-medium">Order Placed</h3>
                <p class="text-sm text-gray-500">
                  {{ formatDate(currentOrder.created_at) }}
                </p>
              </div>
            </div>

            <!-- Processing -->
            <div class="relative flex items-center">
              <div 
                :class="{
                  'w-4 h-4 rounded-full border-2 flex-shrink-0 z-10': true,
                  'bg-green-500 border-green-500': hasStatus('processing'),
                  'bg-white border-gray-300': !hasStatus('processing')
                }"
              ></div>
              <div class="ml-6">
                <h3 class="font-medium">Processing</h3>
                <p class="text-sm text-gray-500">
                  {{ currentOrder.processing_at ? formatDate(currentOrder.processing_at) : 'Pending' }}
                </p>
              </div>
            </div>

            <!-- Shipped -->
            <div class="relative flex items-center">
              <div 
                :class="{
                  'w-4 h-4 rounded-full border-2 flex-shrink-0 z-10': true,
                  'bg-green-500 border-green-500': hasStatus('shipped'),
                  'bg-white border-gray-300': !hasStatus('shipped')
                }"
              ></div>
              <div class="ml-6">
                <h3 class="font-medium">Shipped</h3>
                <p class="text-sm text-gray-500">
                  {{ currentOrder.shipped_at ? formatDate(currentOrder.shipped_at) : 'Pending' }}
                </p>
              </div>
            </div>

            <!-- Delivered -->
            <div class="relative flex items-center">
              <div 
                :class="{
                  'w-4 h-4 rounded-full border-2 flex-shrink-0 z-10': true,
                  'bg-green-500 border-green-500': hasStatus('delivered'),
                  'bg-white border-gray-300': !hasStatus('delivered')
                }"
              ></div>
              <div class="ml-6">
                <h3 class="font-medium">Delivered</h3>
                <p class="text-sm text-gray-500">
                  {{ currentOrder.delivered_at ? formatDate(currentOrder.delivered_at) : 'Pending' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4">Order Summary</h2>
        
        <!-- Items -->
        <div class="space-y-4 mb-6">
          <div v-for="item in currentOrder.items" :key="item.id" class="flex justify-between">
            <div>
              <h4 class="font-medium">{{ item.product_name }}</h4>
              <p class="text-sm text-gray-600">
                Quantity: {{ item.quantity }}
                <span v-if="item.color || item.size" class="mx-2">|</span>
                <span v-if="item.color">Color: {{ item.color }}</span>
                <span v-if="item.color && item.size" class="mx-2">|</span>
                <span v-if="item.size">Size: {{ item.size }}</span>
              </p>
            </div>
            <div class="text-right">
              <p class="font-medium">৳{{ item.total_price.toLocaleString() }}</p>
              <p class="text-sm text-gray-600">৳{{ item.unit_price.toLocaleString() }} each</p>
            </div>
          </div>
        </div>

        <!-- Totals -->
        <div class="border-t pt-4 space-y-2">
          <div class="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>৳{{ (currentOrder.total_amount - currentOrder.shipping_cost - currentOrder.tax_amount).toLocaleString() }}</span>
          </div>
          <div class="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span>৳{{ currentOrder.shipping_cost.toLocaleString() }}</span>
          </div>
          <div class="flex justify-between text-gray-600">
            <span>Tax</span>
            <span>৳{{ currentOrder.tax_amount.toLocaleString() }}</span>
          </div>
          <div class="flex justify-between font-semibold text-lg pt-2 border-t">
            <span>Total</span>
            <span>৳{{ currentOrder.total_amount.toLocaleString() }}</span>
          </div>
        </div>

        <!-- Shipping Address -->
        <div class="mt-6">
          <h3 class="font-medium mb-2">Shipping Address</h3>
          <address class="text-gray-600 not-italic">
            {{ currentOrder.shippingAddress.full_name }}<br>
            {{ currentOrder.shippingAddress.address_line1 }}<br>
            <span v-if="currentOrder.shippingAddress.address_line2">
              {{ currentOrder.shippingAddress.address_line2 }}<br>
            </span>
            {{ currentOrder.shippingAddress.city }}, {{ currentOrder.shippingAddress.state }} {{ currentOrder.shippingAddress.postal_code }}<br>
            {{ currentOrder.shippingAddress.country }}
          </address>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useOrderStore } from '@/stores/order'
import { useNotificationStore } from '@/stores/notification'
import { useRoute } from 'vue-router'

const orderStore = useOrderStore()
const notificationStore = useNotificationStore()
const route = useRoute()

const orderNumber = ref('')
const loading = ref(false)
const currentOrder = ref(null)

// If order number is provided in route params, track it automatically
if (route.params.orderNumber) {
  orderNumber.value = route.params.orderNumber.toString()
  trackOrder()
}

async function trackOrder() {
  if (!orderNumber.value) return

  try {
    loading.value = true
    currentOrder.value = await orderStore.trackOrder(orderNumber.value)
  } catch (err) {
    notificationStore.displayToast(
      err instanceof Error ? err.message : 'Failed to track order',
      'error'
    )
    currentOrder.value = null
  } finally {
    loading.value = false
  }
}

function hasStatus(status: string): boolean {
  if (!currentOrder.value) return false

  const statusOrder = ['pending', 'processing', 'shipped', 'delivered']
  const currentStatusIndex = statusOrder.indexOf(currentOrder.value.status)
  const targetStatusIndex = statusOrder.indexOf(status)

  return currentStatusIndex >= targetStatusIndex
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString()
}
</script>
