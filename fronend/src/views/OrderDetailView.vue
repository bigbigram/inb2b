<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong class="font-bold">Error!</strong>
      <span class="block sm:inline">{{ error }}</span>
    </div>

    <!-- Order Details -->
    <div v-else-if="order" class="max-w-3xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Order #{{ order.order_number }}</h1>
        <router-link
          to="/orders"
          class="text-blue-600 hover:text-blue-800"
        >
          Back to Orders
        </router-link>
      </div>

      <!-- Order Status -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-lg font-semibold">Order Status</h2>
            <p class="text-gray-600">Placed on {{ formatDate(order.created_at) }}</p>
          </div>
          <span 
            :class="{
              'px-4 py-2 rounded-full text-sm font-semibold': true,
              'bg-yellow-100 text-yellow-800': order.status === 'pending',
              'bg-blue-100 text-blue-800': order.status === 'processing',
              'bg-green-100 text-green-800': order.status === 'delivered',
              'bg-red-100 text-red-800': order.status === 'cancelled'
            }"
          >
            {{ order.status.charAt(0).toUpperCase() + order.status.slice(1) }}
          </span>
        </div>
      </div>

      <!-- Order Items -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4">Order Items</h2>
        <div class="space-y-4">
          <div v-for="item in order.items" :key="item.id" class="flex justify-between border-b pb-4 last:border-0">
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
      </div>

      <!-- Order Summary -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4">Order Summary</h2>
        <div class="space-y-2">
          <div class="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>৳{{ (order.total_amount - order.shipping_cost - order.tax_amount).toLocaleString() }}</span>
          </div>
          <div class="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span>৳{{ order.shipping_cost.toLocaleString() }}</span>
          </div>
          <div class="flex justify-between text-gray-600">
            <span>Tax</span>
            <span>৳{{ order.tax_amount.toLocaleString() }}</span>
          </div>
          <div class="flex justify-between font-semibold text-lg pt-2 border-t">
            <span>Total</span>
            <span>৳{{ order.total_amount.toLocaleString() }}</span>
          </div>
        </div>
      </div>

      <!-- Shipping Information -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4">Shipping Information</h2>
        <div class="grid md:grid-cols-2 gap-6">
          <!-- Shipping Address -->
          <div>
            <h3 class="font-medium mb-2">Shipping Address</h3>
            <address class="text-gray-600 not-italic">
              {{ order.shippingAddress.full_name }}<br>
              {{ order.shippingAddress.address_line1 }}<br>
              <span v-if="order.shippingAddress.address_line2">
                {{ order.shippingAddress.address_line2 }}<br>
              </span>
              {{ order.shippingAddress.city }}, {{ order.shippingAddress.state }} {{ order.shippingAddress.postal_code }}<br>
              {{ order.shippingAddress.country }}
            </address>
          </div>

          <!-- Payment Information -->
          <div>
            <h3 class="font-medium mb-2">Payment Information</h3>
            <div class="text-gray-600">
              <p>Payment Method: {{ order.payment_method.toUpperCase() }}</p>
              <p>Payment Status: 
                <span 
                  :class="{
                    'font-medium': true,
                    'text-yellow-600': order.payment_status === 'pending',
                    'text-green-600': order.payment_status === 'paid'
                  }"
                >
                  {{ order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1) }}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="mt-6 flex justify-end">
        <button 
          v-if="order.status === 'pending'"
          @click="cancelOrder"
          class="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
        >
          Cancel Order
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/order'
import { useNotificationStore } from '@/stores/notification'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()
const notificationStore = useNotificationStore()

const order = ref(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    loading.value = true
    const orderId = parseInt(route.params.id as string)
    const response = await orderStore.getOrderById(orderId)
    order.value = response
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load order'
    notificationStore.displayToast('Failed to load order', 'error')
  } finally {
    loading.value = false
  }
})

const cancelOrder = async () => {
  try {
    if (!order.value) return

    await orderStore.updateOrderStatus(order.value.id, 'cancelled')
    notificationStore.displayToast('Order cancelled successfully', 'success')
    router.push('/orders')
  } catch (err) {
    notificationStore.displayToast(
      err instanceof Error ? err.message : 'Failed to cancel order',
      'error'
    )
  }
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString()
}
</script>
