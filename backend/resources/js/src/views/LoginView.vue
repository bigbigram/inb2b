<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();
const router = useRouter();

const phone = ref('');
const password = ref('');
const error = ref('');

const handleLogin = async () => {
  try {
    await authStore.login({ 
      phone: phone.value, 
      password: password.value 
    });
    router.push('/dashboard'); 
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Login failed';
  }
};
</script>

<template>
  <div class="login-container">
    <form @submit.prevent="handleLogin" class="login-form">
      <h2>Login</h2>
      <div v-if="error" class="error-message">{{ error }}</div>
      
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
        <label for="password">Password</label>
        <input 
          type="password" 
          id="password" 
          v-model="password" 
          required 
          placeholder="Enter your password"
        />
      </div>
      
      <button type="submit" class="login-button">Login</button>
      
      <p class="register-link">
        Don't have an account? 
        <router-link to="/register">Register</router-link>
      </p>
    </form>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
}

.login-form {
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

.login-button {
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

.login-button:hover {
  background-color: #45a049;
}

.error-message {
  color: red;
  margin-bottom: 1rem;
  text-align: center;
}

.register-link {
  text-align: center;
  margin-top: 1rem;
}

.register-link a {
  color: #4CAF50;
  text-decoration: none;
}
</style>
