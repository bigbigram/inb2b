import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authService } from '@/services/auth.service';
import api from '@/services/api';
import { useNotificationStore } from './notification';
import router from '@/router';

export const useAuthStore = defineStore('auth', () => {
  const notificationStore = useNotificationStore();

  // Comprehensive localStorage management
  const storageManager = {
    // Safe JSON parsing with fallback
    safeJSONParse(value: string | null, fallback: any = null) {
      if (!value) return fallback;
      try {
        const parsed = JSON.parse(value);
        return parsed || fallback;
      } catch {
        console.warn('Failed to parse JSON:', value);
        return fallback;
      }
    },

    // Get an item from localStorage with safe parsing
    getItem(key: string) {
      const rawValue = localStorage.getItem(key);
      console.log(`Raw ${key} from storage:`, rawValue);
      
      // Special handling for user
      if (key === 'user') {
        return this.safeJSONParse(rawValue);
      }
      
      return rawValue || '';
    },

    // Set an item in localStorage with safe stringification
    setItem(key: string, value: any) {
      try {
        // For user, always stringify
        const storageValue = key === 'user' 
          ? JSON.stringify(value) 
          : String(value);
        
        localStorage.setItem(key, storageValue);
        console.log(`Set ${key} in storage:`, storageValue);
      } catch (error) {
        console.error(`Failed to set ${key} in storage:`, error);
      }
    },

    // Remove an item from localStorage
    removeItem(key: string) {
      localStorage.removeItem(key);
      console.log(`Removed ${key} from storage`);
    }
  };

  // Initial cleanup and validation
  (() => {
    const keysToClean = ['user', 'token'];
    keysToClean.forEach(key => {
      const value = localStorage.getItem(key);
      
      // Remove if value is explicitly problematic
      if (!value || 
          value === 'undefined' || 
          value === 'null' || 
          value.trim() === '') {
        localStorage.removeItem(key);
      }
    });
  })();

  // Initialize state with safe retrieval
  const token = ref(storageManager.getItem('token'));
  const user = ref(storageManager.getItem('user'));

  const loading = ref(false);
  const error = ref('');

  const isAuthenticated = computed(() => !!token.value);

  const setAuthData = (userData: any, tokenValue: string) => {
    console.group(' Set Auth Data');
    
    // Set in store
    user.value = userData;
    token.value = tokenValue;
    
    // Persist in localStorage
    storageManager.setItem('token', tokenValue);
    storageManager.setItem('user', userData);
    
    // Set Authorization header
    api.defaults.headers.common['Authorization'] = `Bearer ${tokenValue}`;
    
    console.log('User Data:', userData);
    console.log('Token:', tokenValue);
    console.groupEnd();
  };

  const clearAuthData = () => {
    // Clear store state
    user.value = null;
    token.value = '';
    
    // Remove from localStorage
    storageManager.removeItem('token');
    storageManager.removeItem('user');
    
    // Remove Authorization header
    delete api.defaults.headers.common['Authorization'];
  };

  const login = async (credentials: { phone: string; password: string }) => {
    try {
      console.group('🔐 Login Attempt');
      console.log('Login Credentials:', credentials);

      // Attempt login
      const response = await authService.login(credentials);

      // Update store state
      setAuthData(response.user, response.token);
      notificationStore.displayToast('Login successful!', 'success');
      
      // Check if there's an intended route
      const intendedRoute = localStorage.getItem('intendedRoute');
      if (intendedRoute) {
        localStorage.removeItem('intendedRoute');
        router.push(intendedRoute);
      } else {
        router.push('/dashboard');
      }

      console.log('Login Successful:', {
        user: user.value,
        token: !!token.value
      });
      console.groupEnd();

      return response;
    } catch (error: any) {
      console.group('❌ Login Error');
      console.error('Login Error:', error);
      console.groupEnd();

      // Clear any existing authentication state
      clearAuthData();

      // Rethrow the error for the component to handle
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      loading.value = true;
      error.value = '';

      const response = await authService.register(userData);
      
      notificationStore.displayToast('Registration successful!', 'success');
      router.push('/login');

      return response;
    } catch (err: any) {
      error.value = err.message || 'Registration failed';
      notificationStore.displayToast(error.value, 'error');
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    try {
      // Call logout service
      await authService.logout();

      // Clear local storage
      storageManager.removeItem('user');
      storageManager.removeItem('token');

      // Reset store state
      clearAuthData();
      notificationStore.displayToast('Logged out successfully', 'success');
      router.push('/login');
    } catch (error) {
      console.error('Logout Error:', error);
      throw error;
    }
  };

  const checkAuth = async () => {
    try {
      // Verify token validity
      if (token.value) {
        const response = await api.get('/check-auth');
        return response.data;
      }
      return false;
    } catch (error) {
      clearAuthData();
      return false;
    }
  };

  // Initialize auth header if token exists
  if (token.value) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth
  };
});
