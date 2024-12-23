<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">My Orders</h1>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong class="font-bold">Error!</strong>
      <span class="block sm:inline">{{ error }}</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="!orders.length" class="text-center py-8">
      <div class="text-gray-500 mb-4">No orders found</div>
      <router-link 
        to="/" 
        class="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
      >
        Start Shopping
      </router-link>
    </div>

    <!-- Orders List -->
    <div v-else class="space-y-6">
      <div v-for="order in orders" :key="order.id" class="bg-white rounded-lg shadow p-6">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-lg font-semibold">Order #{{ order.order_number }}</h3>
            <p class="text-gray-600">
              Placed on {{ new Date(order.created_at).toLocaleDateString() }}
            </p>
          </div>
          <div class="text-right">
            <span 
              :class="{
                'px-3 py-1 rounded-full text-sm font-semibold': true,
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
        <div class="border-t border-b py-4 mb-4">
          <div v-for="item in order.items" :key="item.id" class="flex items-center py-2">
            <div class="flex-1">
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

        <!-- Order Summary -->
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

        <!-- Actions -->
        <div class="mt-6 flex justify-between items-center">
          <div class="text-sm">
            <span class="text-gray-600">Payment Status:</span>
            <span 
              :class="{
                'ml-2 font-medium': true,
                'text-yellow-600': order.payment_status === 'pending',
                'text-green-600': order.payment_status === 'paid'
              }"
            >
              {{ order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1) }}
            </span>
          </div>
          <div class="space-x-4">
            <button 
              v-if="order.status === 'pending'"
              @click="cancelOrder(order.id)"
              class="text-red-600 hover:text-red-800"
            >
              Cancel Order
            </button>
            <router-link 
              :to="`/orders/${order.id}`"
              class="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              View Details
            </router-link>
            <router-link 
              :to="`/track-order/${order.order_number}`"
              class="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Track Order
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useOrderStore } from '@/stores/order'
import { useNotificationStore } from '@/stores/notification'

const orderStore = useOrderStore()
const notificationStore = useNotificationStore()

const orders = ref([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    loading.value = true
    orders.value = await orderStore.fetchUserOrders()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load orders'
    notificationStore.displayToast('Failed to load orders', 'error')
  } finally {
    loading.value = false
  }
})

const cancelOrder = async (orderId: number) => {
  try {
    await orderStore.updateOrderStatus(orderId, 'cancelled')
    notificationStore.displayToast('Order cancelled successfully', 'success')
    // Refresh orders list
    orders.value = await orderStore.fetchUserOrders()
  } catch (err) {
    notificationStore.displayToast(
      err instanceof Error ? err.message : 'Failed to cancel order',
      'error'
    )
  }
}
</script>
