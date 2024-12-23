<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Forgot Password
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Enter your phone number to reset your password
        </p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleForgotPassword">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="phone" class="sr-only">Phone Number</label>
            <input 
              id="phone" 
              name="phone" 
              type="tel" 
              autocomplete="tel" 
              required 
              v-model="phone"
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm" 
              placeholder="Phone Number"
            />
          </div>
        </div>

        <div>
          <button 
            type="submit" 
            :disabled="isLoading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            <span v-if="isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ isLoading ? 'Sending...' : 'Reset Password' }}
          </button>
        </div>

        <div v-if="errorMessage" class="text-center text-red-600 text-sm">
          {{ errorMessage }}
        </div>
      </form>

      <div class="text-center">
        <router-link 
          to="/login" 
          class="font-medium text-orange-600 hover:text-orange-500"
        >
          Back to Login
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/services/api'

const phone = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const router = useRouter()

const handleForgotPassword = async () => {
  if (!phone.value) {
    errorMessage.value = 'Please enter your phone number'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await api.post('/auth/forgot-password', { phone: phone.value })
    
    // Show success message or navigate to verification
    router.push({
      name: 'verify-reset',
      query: { phone: phone.value }
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    errorMessage.value = error.response?.data?.message || 'Failed to reset password. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* Any additional styles can be added here */
</style>
