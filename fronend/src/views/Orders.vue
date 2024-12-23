<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
    <LoadingBar :show="isLoading" />
    
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900 sm:text-3xl">My Orders</h1>
        
        <!-- Search Input -->
        <div class="relative">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search orders" 
            class="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
          <svg class="absolute left-2 top-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      
      <!-- Order Filters -->
      <div class="mb-6 flex flex-wrap gap-4">
        <button 
          v-for="filter in filters" 
          :key="filter.name"
          @click="currentFilter = filter.value"
          :class="[
            'px-4 py-2 rounded-full text-sm font-medium transition-colors',
            currentFilter === filter.value
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          ]"
        >
          {{ filter.name }}
        </button>
      </div>

      <!-- Orders List -->
      <div v-if="isLoading" class="text-center py-12 bg-white rounded-lg">
        <div class="animate-spin inline-block w-12 h-12 border-4 border-current border-t-transparent text-blue-600 rounded-full" role="status">
          <span class="sr-only">Loading...</span>
        </div>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Loading Orders...</h3>
      </div>

      <div v-else-if="error" class="flex justify-center items-center min-h-screen">
        <div class="text-center bg-red-100 p-8 rounded-lg">
          <svg class="mx-auto h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 class="mt-4 text-xl font-semibold text-red-800">Orders Not Found</h2>
          <p class="mt-2 text-red-600">{{ error }}</p>
          <button 
            @click="$router.push('/')" 
            class="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Back to Shopping
          </button>
        </div>
      </div>

      <div v-else class="space-y-4">
        <div v-if="filteredOrders.length" class="space-y-4">
          <div 
            v-for="order in filteredOrders" 
            :key="order.id" 
            class="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
          >
            <!-- Order Header -->
            <div class="p-4 sm:p-6 border-b border-gray-100">
              <div class="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">
                    Order #{{ order.order_number }}
                  </h3>
                  <p class="text-sm text-gray-500">
                    Placed on {{ formatDate(order.created_at) }}
                  </p>
                </div>
                <div class="flex items-center gap-4">
                  <span 
                    :class="[
                      'px-3 py-1 rounded-full text-sm font-medium',
                      getStatusClass(order.status)
                    ]"
                  >
                    {{ order.status }}
                  </span>
                  <button 
                    @click="toggleOrderDetails(order.id)"
                    class="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                  >
                    {{ expandedOrders.includes(order.id) ? 'Hide Details' : 'View Details' }}
                    <svg 
                      class="w-4 h-4 transition-transform"
                      :class="{ 'rotate-180': expandedOrders.includes(order.id) }"
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Order Details (Expandable) -->
            <div 
              v-show="expandedOrders.includes(order.id)"
              class="p-4 sm:p-6 bg-gray-50"
            >
              <div class="space-y-4">
                <!-- Order Items -->
                <div v-for="item in order.items" :key="item.id" class="flex items-center gap-4">
                  <img 
                    :src="item.image || '/placeholder-product.jpg'" 
                    :alt="item.product_name" 
                    class="w-16 h-16 object-cover rounded-md"
                  >
                  <div class="flex-1">
                    <h4 class="font-medium text-gray-900">{{ item.product_name }}</h4>
                    <p class="text-sm text-gray-500">Quantity: {{ item.quantity }}</p>
                  </div>
                  <p class="font-medium text-gray-900">Nu. {{ (item.unit_price * item.quantity).toFixed(2) }}</p>
                </div>

                <!-- Order Summary -->
                <div class="border-t border-gray-200 pt-4 mt-4">
                  <div class="space-y-2">
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-600">Subtotal</span>
                      <span class="font-medium">Nu. {{ order.subtotal.toFixed(2) }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-600">Shipping</span>
                      <span class="font-medium">Nu. {{ order.shipping_cost.toFixed(2) }}</span>
                    </div>
                    <div class="flex justify-between text-base font-medium pt-2 border-t border-gray-200">
                      <span>Total</span>
                      <span>Nu. {{ order.total_amount.toFixed(2) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Shipping Address -->
                <div v-if="order.shipping_address" class="border-t border-gray-200 pt-4">
                  <h4 class="font-medium text-gray-900 mb-2">Shipping Address</h4>
                  <p class="text-sm text-gray-600">{{ order.shipping_address }}</p>
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-wrap gap-4 pt-4">
                  <button 
                    @click="navigateToOrderDetails(order.id)"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    View Order Details
                  </button>
                  <button 
                    @click="downloadInvoice(order.id)"
                    class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Download Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div 
          v-else 
          class="text-center py-12 bg-white rounded-lg"
        >
          <svg
            class="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 48 48"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20 8h-2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-2M8 20v12a2 2 0 002 2h12a2 2 0 002-2V20m0 0l-4-4m4 4L32 8"
            />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
          <p class="mt-1 text-sm text-gray-500">
            {{ 
              currentFilter === 'all' 
                ? "You haven't placed any orders yet." 
                : `No ${currentFilter} orders found.`
            }}
          </p>
          <div class="mt-6">
            <router-link
              to="/"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Start Shopping
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import OrderService, { Order } from '@/services/OrderService'
import { useNotificationStore } from '@/stores/notification'
import LoadingBar from '@/components/LoadingBar.vue'

const router = useRouter()
const notificationStore = useNotificationStore()

const orders = ref<Order[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const currentFilter = ref('all')
const expandedOrders = ref<number[]>([])
const searchQuery = ref('')

const filters = [
  { name: 'All Orders', value: 'all' },
  { name: 'Processing', value: 'processing' },
  { name: 'Shipped', value: 'shipped' },
  { name: 'Delivered', value: 'delivered' },
  { name: 'Cancelled', value: 'cancelled' }
]

const filteredOrders = computed(() => {
  if (!orders.value) return []
  return orders.value.filter(order => {
    const matchesFilter = currentFilter.value === 'all' || order.status.toLowerCase() === currentFilter.value
    const matchesSearch = order.order_number.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesFilter && matchesSearch
  })
})

const fetchOrders = async () => {
  try {
    isLoading.value = true
    error.value = null
    orders.value = await OrderService.getUserOrders()

    // Comprehensive logging
    console.log('Fetched Orders:', {
      count: orders.value.length,
      firstOrder: orders.value[0]
    })

    if (!orders.value || orders.value.length === 0) {
      error.value = 'No orders found'
    }
  } catch (fetchError) {
    error.value = 'Failed to fetch orders. Please try again later.'
    notificationStore.error(error.value)
    console.error('Order fetch error:', fetchError)
  } finally {
    isLoading.value = false
  }
}

const toggleOrderDetails = (orderId: number) => {
  const index = expandedOrders.value.indexOf(orderId)
  if (index > -1) {
    expandedOrders.value.splice(index, 1)
  } else {
    expandedOrders.value.push(orderId)
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getStatusClass = (status: string) => {
  const statusClasses = {
    'processing': 'bg-yellow-100 text-yellow-800',
    'shipped': 'bg-blue-100 text-blue-800',
    'delivered': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800'
  }
  return statusClasses[status.toLowerCase()] || 'bg-gray-100 text-gray-800'
}

const navigateToOrderDetails = (orderId: number) => {
  router.push(`/order-confirmation/${orderId}`)
}

const downloadInvoice = async (orderId: number) => {
  try {
    const response = await OrderService.downloadOrderInvoice(orderId)
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = `order_${orderId}_invoice.pdf`
    link.click()
  } catch (error) {
    notificationStore.error('Failed to download invoice')
    console.error('Invoice download error:', error)
  }
}

onMounted(fetchOrders)
</script>

<style scoped>
/* Additional custom styles if needed */
</style>
