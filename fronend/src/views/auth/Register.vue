<template>
  <div class="register-container">
    <form @submit.prevent="handleRegister" class="register-form">
      <div class="form-group">
        <label for="name">Full Name</label>
        <input 
          type="text" 
          id="name" 
          v-model="registerForm.name" 
          :class="{'is-invalid': errors.name}"
          placeholder="Enter your full name"
          required
        />
        <div v-if="errors.name" class="invalid-feedback">
          {{ errors.name }}
        </div>
      </div>

      <div class="form-group">
        <label for="phone">Phone Number</label>
        <input 
          type="tel" 
          id="phone" 
          v-model="registerForm.phone" 
          :class="{'is-invalid': errors.phone}"
          placeholder="Enter your phone number"
          required
        />
        <div v-if="errors.phone" class="invalid-feedback">
          {{ errors.phone }}
        </div>
      </div>

      <div class="form-group">
        <label for="email">Email (Optional)</label>
        <input 
          type="email" 
          id="email" 
          v-model="registerForm.email" 
          :class="{'is-invalid': errors.email}"
          placeholder="Enter your email (optional)"
        />
        <div v-if="errors.email" class="invalid-feedback">
          {{ errors.email }}
        </div>
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input 
          type="password" 
          id="password" 
          v-model="registerForm.password" 
          :class="{'is-invalid': errors.password}"
          placeholder="Create a password (min 6 characters)"
          required
        />
        <div v-if="errors.password" class="invalid-feedback">
          {{ errors.password }}
        </div>
      </div>

      <button 
        type="submit" 
        class="btn-register" 
        :disabled="isLoading"
      >
        {{ isLoading ? 'Registering...' : 'Register' }}
      </button>

      <div v-if="generalError" class="general-error">
        {{ generalError }}
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { AuthService } from '@/services/authService'
import { RegisterData } from '@/types/auth.types'

const authService = new AuthService()
const router = useRouter()

const registerForm = reactive<RegisterData>({
  name: '', 
  phone: '',
  email: '',
  password: '',
  role: 'customer'
})

const errors = reactive({
  name: '',
  phone: '',
  email: '',
  password: '',
})

const isLoading = ref(false)
const generalError = ref('')

const resetErrors = () => {
  errors.name = ''
  errors.phone = ''
  errors.email = ''
  errors.password = ''
  generalError.value = ''
}

const handleRegister = async () => {
  resetErrors()
  isLoading.value = true

  try {
    const response = await authService.register(registerForm)
    // Successful registration
    router.push('/dashboard')
  } catch (error: any) {
    isLoading.value = false
    
    // Handle specific error types
    if (error.response && error.response.data && error.response.data.errors) {
      const serverErrors = error.response.data.errors
      
      // Map server errors to our local error object
      if (serverErrors.name) errors.name = serverErrors.name[0]
      if (serverErrors.phone) errors.phone = serverErrors.phone[0]
      if (serverErrors.email) errors.email = serverErrors.email[0]
      if (serverErrors.password) errors.password = serverErrors.password[0]
    } else {
      // Generic error handling
      generalError.value = error.message || 'Registration failed. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.register-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

.register-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  margin-bottom: 5px;
  display: block;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.is-invalid {
  border-color: red;
}

.invalid-feedback {
  color: red;
  font-size: 0.8em;
  margin-top: 5px;
}

.btn-register {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-register:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.general-error {
  color: red;
  text-align: center;
  margin-top: 10px;
}
</style>
