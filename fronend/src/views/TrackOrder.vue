<template>
  <div class="transition-wrapper">
    <div class="max-w-2xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Track Your Order</h1>
      
      <div class="bg-white p-6 rounded-lg shadow-md">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Order ID Field -->
          <div>
            <label for="orderId" class="block text-sm font-medium text-gray-700">Order ID</label>
            <div class="mt-1">
              <input
                type="text"
                id="orderId"
                v-model="formData.orderId"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                :class="{ 'border-red-500': errors.orderId }"
                placeholder="Enter your Order ID"
              />
              <p v-if="errors.orderId" class="mt-1 text-sm text-red-600">{{ errors.orderId }}</p>
            </div>
          </div>

          <!-- Phone Number Field -->
          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700">Phone Number</label>
            <div class="mt-1">
              <input
                type="tel"
                id="phone"
                v-model="formData.phone"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                :class="{ 'border-red-500': errors.phone }"
                placeholder="Enter your phone number"
              />
              <p v-if="errors.phone" class="mt-1 text-sm text-red-600">{{ errors.phone }}</p>
            </div>
          </div>

          <!-- Submit Button -->
          <div>
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-orange-400"
            >
              <svg
                v-if="isLoading"
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {{ isLoading ? 'Tracking...' : 'Track Order' }}
            </button>
          </div>
        </form>

        <!-- Result Section -->
        <div v-if="orderStatus" class="mt-6 p-4 bg-gray-50 rounded-md">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Order Status</h2>
          <div class="space-y-2">
            <p class="text-sm text-gray-600">
              <span class="font-medium">Status:</span> {{ orderStatus.status }}
            </p>
            <p class="text-sm text-gray-600">
              <span class="font-medium">Last Updated:</span> {{ orderStatus.lastUpdated }}
            </p>
            <p class="text-sm text-gray-600">
              <span class="font-medium">Location:</span> {{ orderStatus.location }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import NotificationService from '../services/NotificationService'
import type { OrderStatus as NotificationOrderStatus } from '../services/NotificationService'
import axios from 'axios'

interface FormData {
  orderId: string
  phone: string
}

interface FormErrors {
  orderId?: string
  phone?: string
}

interface OrderStatus {
  status: string
  lastUpdated: string
  location?: string
}

const formData = reactive<FormData>({
  orderId: '',
  phone: ''
})

const errors = reactive<FormErrors>({})
const isLoading = ref(false)
const orderStatus = ref<OrderStatus | null>(null)

const notificationService = NotificationService.getInstance()

// Function to update order status in the backend
const updateStatus = async (orderId: string, newStatus: string): Promise<void> => {
  try {
    const response = await axios.post(`/api/orders/${orderId}/status`, {
      status: newStatus
    })
    if (response.data.success) {
      console.log('Order status updated successfully')
    }
  } catch (error) {
    console.error('Error updating order status:', error)
    throw error
  }
}

const validateForm = (): boolean => {
  errors.orderId = ''
  errors.phone = ''
  let isValid = true

  if (!formData.orderId) {
    errors.orderId = 'Order ID is required'
    isValid = false
  } else if (formData.orderId.length < 6) {
    errors.orderId = 'Order ID must be at least 6 characters'
    isValid = false
  }

  if (!formData.phone) {
    errors.phone = 'Phone number is required'
    isValid = false
  } else if (!/^\+?[\d\s-]{8,}$/.test(formData.phone)) {
    errors.phone = 'Please enter a valid phone number'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isLoading.value = true
  try {
    // Update status in backend
    await updateStatus(formData.orderId, 'processing')
    
    // Update local state
    orderStatus.value = {
      status: 'processing',
      lastUpdated: new Date().toLocaleString(),
      location: 'Distribution Center'
    }

    // Send notification about order status
    notificationService.notifyOrderStatus({
      id: formData.orderId,
      status: 'processing' as NotificationOrderStatus
    })

  } catch (error) {
    console.error('Error tracking order:', error)
    errors.orderId = 'Failed to update order status. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.transition-wrapper {
  min-height: calc(100vh - 64px); /* Adjust based on your header height */
  background-color: rgb(249, 250, 251);
}
</style>
