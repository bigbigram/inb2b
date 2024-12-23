<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50 overflow-y-auto">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg my-8">
      <!-- Header -->
      <div class="text-center">
        <router-link to="/" class="inline-block mb-6">
          <img :src="headerLogo" alt="E-Commerce Logo" class="h-12 w-auto mx-auto">
        </router-link>
        <h2 class="text-3xl font-bold text-gray-900">Welcome back</h2>
        <p class="mt-2 text-sm text-gray-600">
          Don't have an account?
          <router-link to="/register" class="text-orange-500 hover:text-orange-600 font-medium">
            Sign up
          </router-link>
        </p>
      </div>

      <!-- Form -->
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="space-y-4">
          <!-- Email -->
        <div>
          <label for="phone" class="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <input
            id="phone"
            v-model="phone"
            type="tel"
            required
            autocomplete="tel"
            class="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
            :class="{ 'border-red-500': phoneError }"
            @blur="validatePhone"
          >
          <p v-if="phoneError" class="mt-1 text-sm text-red-500">{{ phoneError }}</p>      
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="current-password"
                class="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                :class="{ 'border-red-500': passwordError }"
                @blur="validatePassword"
              >
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <p v-if="passwordError" class="mt-1 text-sm text-red-500">{{ passwordError }}</p>
          </div>

          <!-- Remember Me & Forgot Password -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                v-model="rememberMe"
                type="checkbox"
                class="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
              >
              <label for="remember-me" class="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            <router-link to="/forgot-password" class="text-sm text-orange-500 hover:text-orange-600">
              Forgot password?
            </router-link>
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="loading || !isFormValid"
          class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="!loading">Sign in</span>
          <div v-else class="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </button>

        <!-- Back to Home -->
        <div class="text-center mt-4">
          <router-link 
            to="/" 
            class="inline-flex items-center text-sm text-gray-600 hover:text-orange-500"
          >
            <i class="fas fa-arrow-left mr-2"></i>
            Back to Home
          </router-link>
        </div>
      </form>
      <Toast 
        :message="notificationStore.toastMessage" 
        :type="notificationStore.toastType"
        :duration="3000"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useNotificationStore } from '@/stores/notification.store'
import Toast from '@/components/Toast.vue'
import headerLogo from '@/assets/header-logo.jpg'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

// Form state
const phone = ref('')  // Instead of email
const password = ref('')
const rememberMe = ref(false)
const loading = ref(false)
const showPassword = ref(false)

// Error state
const error = ref('')
const phoneError = ref('')  // Instead of emailError
const passwordError = ref('')
const loginError = ref('')

const validatePhone = () => {
  phoneError.value = ''
  if (!phone.value) {
    phoneError.value = 'Phone number is required'
    return false
  }
  
  // Validate 8-digit phone number
  const phoneRegex = /^[0-9]{8}$/
  if (!phoneRegex.test(phone.value)) {
    phoneError.value = 'Please enter a valid 8-digit phone number'
    return false
  }
  
  return true
}

const validatePassword = () => {
  passwordError.value = ''
  if (!password.value) {
    passwordError.value = 'Password is required'
    return false
  }
  if (password.value.length < 6) {
    passwordError.value = 'Password must be at least 6 characters'
    return false
  }
  return true
}

const isFormValid = computed(() => {
  return phone.value && password.value && !phoneError.value && !passwordError.value
})

const handleLogin = async () => {
  // Reset error state
  loginError.value = '';
  loading.value = true;

  try {
    // Attempt login
    const loginData = {
      phone: phone.value,
      password: password.value
    };

    // Call login service
    await authStore.login(loginData);

    // Success handled in auth service (redirects to home)
    notificationStore.displayToast('Login successful', 'success');
  } catch (error: any) {
    // Handle login error
    console.error('Login error:', error);
    
    // Set error message
    loginError.value = error.message || 'Login failed';
    
    // Display error toast
    notificationStore.displayToast(
      loginError.value, 
      'error'
    );
  } finally {
    // Reset loading state
    loading.value = false;
  }
}
</script>