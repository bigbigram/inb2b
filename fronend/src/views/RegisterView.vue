<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();
const router = useRouter();

const name = ref('');
const password = ref('');
const passwordConfirmation = ref('');
const phone = ref('');
const role = ref('');
const error = ref('');

const handleRegister = async () => {
  try {
    await authStore.register({
      name: name.value,
      phone: phone.value,
      password: password.value,
      password_confirmation: passwordConfirmation.value,
      role: role.value
    });
    router.push('/dashboard'); // Redirect after successful registration
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Registration failed';
  }
};
</script>

<template>
  <div class="register-container">
    <form @submit.prevent="handleRegister" class="register-form">
      <h2>Register</h2>
      <div v-if="error" class="error-message">{{ error }}</div>
      
      <div class="form-group">
        <label for="name">Name</label>
        <input 
          type="text" 
          id="name" 
          v-model="name" 
          required 
          placeholder="Enter your name"
        />
      </div>
      
      <div class="form-group">
        <label for="phone">Phone Number</label>
        <input 
          type="tel" 
          id="phone" 
          v-model="phone" 
          required 
          placeholder="Enter your phone number"
        />
      </div>
      
      <div class="form-group">
        <label for="role">User Role</label>
        <select 
          id="role" 
          v-model="role" 
          required
        >
          <option value="customer">Customer</option>
          <option value="vendor">Vendor</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="password">Password</label>
        <input 
          type="password" 
          id="password" 
          v-model="password" 
          required 
          placeholder="Enter your password"
          minlength="8"
        />
      </div>
      
      <div class="form-group">
        <label for="password_confirmation">Confirm Password</label>
        <input 
          type="password" 
          id="password_confirmation" 
          v-model="passwordConfirmation" 
          required 
          placeholder="Confirm your password"
          minlength="8"
        />
      </div>
      
      <button type="submit" class="register-button">Register</button>
      
      <p class="login-link">
        Already have an account? 
        <router-link to="/login">Login</router-link>
      </p>
    </form>
  </div>
</template>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
}

.register-form {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.register-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.register-button:hover {
  background-color: #45a049;
}

.error-message {
  color: red;
  margin-bottom: 1rem;
  text-align: center;
}

.login-link {
  text-align: center;
  margin-top: 1rem;
}

.login-link a {
  color: #4CAF50;
  text-decoration: none;
}
</style>
