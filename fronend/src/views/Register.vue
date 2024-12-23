<template>
  <div class="min-h-screen bg-gray-50 py-6 px-4 overflow-y-auto">
    <div class="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg my-4">
      <!-- Header -->
      <div class="text-center">
        <router-link to="/" class="inline-block mb-6">
          <img :src="headerLogo" alt="E-Commerce Logo" class="h-12 w-auto mx-auto">
        </router-link>
        <h2 class="text-3xl font-bold text-gray-900">Create an account</h2>
        <p class="mt-2 text-sm text-gray-600">
          Already have an account?
          <router-link to="/login" class="text-orange-500 hover:text-orange-600 font-medium">
            Sign in
          </router-link>
        </p>
      </div>

      <!-- Form -->
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="space-y-4">
          <!-- Full Name -->
          <div>
            <label for="fullName" class="block text-sm font-medium text-gray-700">
              Full name
            </label>
            <input
              id="fullName"
              v-model="fullName"
              type="text"
              required
              autocomplete="name"
              class="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              :class="{ 'border-red-500': nameError }"
            >
            <p v-if="nameError" class="mt-1 text-sm text-red-500">{{ nameError }}</p>
          </div>
          <div>
          <label for="phone" class="block text-sm font-medium text-gray-700">
            Phone number
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
            placeholder="Enter 8-digit phone number"
          >
          <p v-if="phoneError" class="mt-1 text-sm text-red-500">{{ phoneError }}</p>
        </div>
          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              autocomplete="email"
              class="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              :class="{ 'border-red-500': emailError }"
              @blur="validateEmail"
            >
            <p v-if="emailError" class="mt-1 text-sm text-red-500">{{ emailError }}</p>
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
                autocomplete="new-password"
                class="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                :class="{ 'border-red-500': passwordError }"
                @blur="validatePassword"
                @input="validatePasswordStrength"
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
            <!-- Password Strength Indicator -->
            <div v-if="password" class="mt-2">
              <div class="flex items-center space-x-2">
                <div class="text-sm text-gray-600">Password strength:</div>
                <div class="flex-1 h-2 bg-gray-200 rounded-full">
                  <div
                    class="h-full rounded-full transition-all duration-300"
                    :class="{
                      'w-1/3 bg-red-500': passwordStrength === 'weak',
                      'w-2/3 bg-yellow-500': passwordStrength === 'medium',
                      'w-full bg-green-500': passwordStrength === 'strong'
                    }"
                  ></div>
                </div>
                <div class="text-sm" :class="{
                  'text-red-500': passwordStrength === 'weak',
                  'text-yellow-500': passwordStrength === 'medium',
                  'text-green-500': passwordStrength === 'strong'
                }">{{ passwordStrength }}</div>
              </div>
            </div>
          </div>

          <!-- Terms -->
          <div class="flex items-center">
            <input
              id="terms"
              v-model="acceptTerms"
              type="checkbox"
              required
              class="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
            >
            <label for="terms" class="ml-2 block text-sm text-gray-700">
              I agree to the
              <router-link to="/terms" class="text-orange-500 hover:text-orange-600">Terms and Conditions</router-link>
            </label>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="text-center">
          <p class="text-red-500 text-sm">{{ error }}</p>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="loading || !isFormValid"
          class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="!loading">Create account</span>
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
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import headerLogo from '@/assets/header-logo.jpg'

const router = useRouter()
const authStore = useAuthStore()

const fullName = ref('')
const phone = ref('')
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const acceptTerms = ref(false)
const loading = ref(false)
const error = ref('')
const nameError = ref('')
const phoneError = ref('')
const emailError = ref('')
const passwordError = ref('')
const passwordStrength = ref('')

// Validation Functions
const validateName = () => {
  nameError.value = ''
  if (!fullName.value) {
    nameError.value = 'Full name is required'
    return false
  }
  if (fullName.value.length < 2) {
    nameError.value = 'Name must be at least 2 characters'
    return false
  }
  return true
}

const validateEmail = () => {
  emailError.value = ''
  if (!email.value) {
    emailError.value = 'Email is required'
    return false
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    emailError.value = 'Please enter a valid email address'
    return false
  }
  return true
}

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
  if (!password.value) {
    passwordError.value = 'Password is required'
    return false
  }
  if (password.value.length < 6) {
    passwordError.value = 'Password must be at least 6 characters long'
    return false
  }
  passwordError.value = ''
  return true
}

const validatePasswordStrength = () => {
  if (!password.value) {
    passwordStrength.value = ''
    return
  }

  const hasLower = /[a-z]/.test(password.value)
  const hasUpper = /[A-Z]/.test(password.value)
  const hasNumber = /\d/.test(password.value)
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password.value)
  
  const strength = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length

  if (password.value.length < 6) {
    passwordStrength.value = 'weak'
  } else if (strength <= 2) {
    passwordStrength.value = 'weak'
  } else if (strength === 3) {
    passwordStrength.value = 'medium'
  } else {
    passwordStrength.value = 'strong'
  }
}

// Computed Validation
const isFormValid = computed(() => {
  return fullName.value && 
         phone.value && 
         email.value && 
         password.value && 
         acceptTerms.value &&
         !nameError.value && 
         !phoneError.value && 
         !emailError.value && 
         !passwordError.value
})

// Registration Handler
const handleRegister = async () => {
  // Reset previous errors
  error.value = ''
  nameError.value = ''
  phoneError.value = ''
  emailError.value = ''
  passwordError.value = ''

  // Validate form before submission
  validateName()
  validatePhone()
  validateEmail()
  validatePassword()

  // Check if there are any validation errors
  if (nameError.value || phoneError.value || emailError.value || 
      passwordError.value) {
    return
  }

  // Prepare registration data
  const registerData = {
    name: fullName.value.trim(),
    phone: phone.value.trim(),
    email: email.value.trim() || undefined,
    password: password.value.trim(),
    role: 'customer'
  }

  // Set loading state
  loading.value = true

  try {
    // Attempt registration
    await authStore.register(registerData)
    
    // Redirect to dashboard or home page
    router.push('/')
  } catch (err: any) {
    // Handle registration errors
    loading.value = false
    
    console.log('Full Error Object:', err);
    
    // Check if error is from backend validation
    if (err.response && err.response.data) {
      console.log('Backend Error Details:', err.response.data);
      
      const errorData = err.response.data;
      
      // Handle validation errors
      if (errorData.errors) {
        const errors = errorData.errors;
        
        // Map backend validation errors to frontend error fields
        if (errors.name) nameError.value = errors.name[0];
        if (errors.phone) phoneError.value = errors.phone[0];
        if (errors.email) emailError.value = errors.email[0];
        if (errors.password) passwordError.value = errors.password[0];
        
        // If no specific field errors, set a generic error
        if (!nameError.value && !phoneError.value && !emailError.value && !passwordError.value) {
          error.value = errorData.message || 'Registration failed';
        }
      } else {
        // Generic error handling if no specific validation errors
        error.value = errorData.message || 'Registration failed. Please try again.';
      }
    } else {
      // Generic error handling for network or other errors
      error.value = err.message || 'Registration failed. Please try again.';
    }
  } finally {
    loading.value = false
  }
}
</script>