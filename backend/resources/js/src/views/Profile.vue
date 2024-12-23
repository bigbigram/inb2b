<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Profile Header -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <div class="flex items-center space-x-4">
          <div class="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center">
            <span class="text-3xl font-bold text-orange-500">
              {{ initials }}
            </span>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ AuthService.user?.name || 'User Profile' }}</h1>
            <p class="text-gray-600">{{ AuthService.user?.phone || 'Phone not set' }}</p>
          </div>
        </div>
      </div>

      <!-- Error Notification -->
      <div 
        v-if="errorMessage" 
        class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" 
        role="alert"
      >
        <span class="block sm:inline">{{ errorMessage }}</span>
        <span 
          @click="errorMessage = ''" 
          class="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer"
        >
          ×
        </span>
      </div>

      <!-- Responsive Two-Column Layout -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Personal Information Column -->
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h2 class="text-xl font-semibold mb-6 text-gray-900">Personal Information</h2>
          
          <div class="space-y-4">
            <!-- Full Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input 
                v-model="editedProfile.name"
                type="text"
                :disabled="!isEditing"
                @input="validateFullName"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                :class="{ 
                  'bg-gray-100': !isEditing, 
                  'border-red-500': nameError 
                }"
                placeholder="Enter your full name"
              />
              <p v-if="nameError" class="text-red-500 text-xs mt-1">{{ nameError }}</p>
            </div>

            <!-- Phone Number -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input 
                v-model="editedProfile.phone"
                type="tel"
                :disabled="!isEditing"
                @input="validatePhone"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                :class="{ 
                  'bg-gray-100': !isEditing,
                  'border-red-500': phoneError 
                }"
                placeholder="Enter your phone number"
              />
              <p v-if="phoneError" class="text-red-500 text-xs mt-1">{{ phoneError }}</p>
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input 
                v-model="editedProfile.email"
                type="email"
                disabled
                class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
              />
            </div>

            <!-- Action Buttons -->
            <div class="mt-6 flex space-x-4">
              <button 
                v-if="!isEditing"
                @click="startEditing"
                class="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200"
              >
                Edit Profile
              </button>
              <template v-else>
                <button 
                  @click="cancelEditing"
                  class="w-1/2 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button 
                  @click="handleUpdateProfile"
                  :disabled="!isFormValid || isSaving"
                  class="w-1/2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ isSaving ? 'Saving...' : 'Save Changes' }}
                </button>
              </template>
            </div>
          </div>
        </div>

        <!-- My Activity Column -->
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h2 class="text-xl font-semibold mb-6 text-gray-900">My Activity</h2>
          
          <!-- Activity Stats -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <div class="text-2xl font-bold text-orange-500">{{ orderCount }}</div>
              <div class="text-sm text-gray-600">Orders</div>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <div class="text-2xl font-bold text-orange-500">{{ wishlistCount }}</div>
              <div class="text-sm text-gray-600">Wishlist</div>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <div class="text-2xl font-bold text-orange-500">{{ reviewCount }}</div>
              <div class="text-sm text-gray-600">Reviews</div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div>
            <h3 class="text-lg font-semibold mb-4 text-gray-800">Recent Activity</h3>
            <div v-if="recentActivities.length" class="space-y-3">
              <div 
                v-for="activity in recentActivities" 
                :key="activity.id" 
                class="bg-gray-50 p-3 rounded-lg flex justify-between items-center"
              >
                <div>
                  <p class="text-sm font-medium text-gray-800">{{ activity.description }}</p>
                  <p class="text-xs text-gray-500">{{ formatActivityDate(activity.date) }}</p>
                </div>
                <span 
                  :class="{
                    'text-green-500': activity.type === 'success',
                    'text-orange-500': activity.type === 'warning',
                    'text-red-500': activity.type === 'error'
                  }"
                >
                  {{ activity.type }}
                </span>
              </div>
            </div>
            <p v-else class="text-gray-500 text-sm">No recent activity</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import AuthService from '../services/AuthService'

// State variables
const isEditing = ref(false)
const loading = ref(false)
const error = ref('')
const successMessage = ref('')
const errorMessage = ref('')

// Form validation state
const nameError = ref('')
const phoneError = ref('')

// Profile editing form
const editedProfile = reactive({
  name: '',
  email: '',
  phone: ''
})

// Computed initials
const initials = computed(() => {
  const name = AuthService.user?.name || 'User'
  return name.split(' ').map(word => word[0]).slice(0, 2).join('').toUpperCase()
})

// Validation Methods
const validateFullName = () => {
  const name = editedProfile.name.trim()
  if (!name) {
    nameError.value = 'Full name is required'
  } else if (name.length < 2) {
    nameError.value = 'Name must be at least 2 characters'
  } else {
    nameError.value = ''
  }
}

const validatePhone = () => {
  const phone = editedProfile.phone.trim()
  const phoneRegex = /^[0-9]{8}$/
  if (!phone) {
    phoneError.value = 'Phone number is required'
  } else if (!phoneRegex.test(phone)) {
    phoneError.value = 'Phone must be 8 digits'
  } else {
    phoneError.value = ''
  }
}

// Form Validation
const isFormValid = computed(() => {
  return !nameError.value && !phoneError.value && 
         editedProfile.name.trim() && 
         editedProfile.phone.trim()
})

// Initialize editedProfile with current user data
onMounted(() => {
  if (AuthService.user) {
    editedProfile.name = AuthService.user.name || ''
    editedProfile.email = AuthService.user.email || ''
    editedProfile.phone = AuthService.user.phone || ''
  }
})

const startEditing = () => {
  isEditing.value = true
}

const cancelEditing = () => {
  isEditing.value = false
  errorMessage.value = ''
  nameError.value = ''
  phoneError.value = ''
  
  // Reset form to original values
  if (AuthService.user) {
    editedProfile.name = AuthService.user.name || ''
    editedProfile.email = AuthService.user.email || ''
    editedProfile.phone = AuthService.user.phone || ''
  }
}

const handleUpdateProfile = async () => {
  validateFullName()
  validatePhone()

  if (!isFormValid.value) {
    return
  }

  try {
    loading.value = true
    error.value = ''
    const profileData = {
      fullName: editedProfile.name.trim(),
      phone: editedProfile.phone.trim()
    }
    await AuthService.updateProfile(profileData)
    successMessage.value = 'Profile updated successfully'
    isEditing.value = false
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to update profile'
  } finally {
    loading.value = false
  }
}

// Ensure auth is initialized
onMounted(() => {
  AuthService.initializeAuth()
})

// Profile stats and activities
const orderCount = ref(5)
const wishlistCount = ref(12)
const reviewCount = ref(3)

const recentActivities = ref([
  { 
    id: 1, 
    description: 'Profile updated', 
    date: new Date('2023-12-15T10:30:00'), 
    type: 'success' 
  },
  { 
    id: 2, 
    description: 'Order #1234 shipped', 
    date: new Date('2023-12-10T14:45:00'), 
    type: 'warning' 
  }
])

// Date formatting utility
const formatActivityDate = (date: Date) => {
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  return `${diffDays} days ago`
}

const isSaving = ref(false)
</script>

<style scoped>
/* Optional additional styles */
input:disabled {
  cursor: not-allowed;
  opacity: 0.7;
  background-color: #f3f4f6; /* Tailwind's gray-100 */
  border-color: #d1d5db; /* Tailwind's gray-300 */
}
</style>
