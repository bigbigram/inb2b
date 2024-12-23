import { defineStore } from 'pinia';
import AuthService from '@/services/AuthService';
import type { User, LoginCredentials, RegisterData } from '../types/auth.types';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const router = useRouter();

  const isAuthenticated = computed(() => {
    // Ensure user exists and token is valid
    return AuthService.isAuthenticated();
  });

  // Initialize user from localStorage
  const initializeAuth = () => {
    const userData = AuthService.getCurrentUser();
    if (userData) {
      user.value = userData;
    }
  };

  // Login
  const login = async (credentials: LoginCredentials) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await AuthService.login(credentials);
      user.value = response.user;
      router.push('./');
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Login failed';
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  // Register
  const register = async (data: RegisterData) => {
    try {
      loading.value = true;
      error.value = null;
      await AuthService.register(data);
      // After registration, login the user
      await login({ phone: data.phone, password: data.password });
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Registration failed';
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  // Logout
  const logout = () => {
    AuthService.logout();
    user.value = null;
    router.push('/login');
  };

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    initializeAuth
  };
});
