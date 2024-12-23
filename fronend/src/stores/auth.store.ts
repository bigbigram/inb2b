import { defineStore } from 'pinia';
import { authService } from '@/services/auth.service';
import { userService } from '@/services/user.service';
import { useNotificationStore } from '@/stores/notification.store';

interface User {
  id: number;
  name: string;
  phone: string;
  role: 'customer' | 'admin' | 'vendor';
  is_active: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    isAuthenticated: false,
    error: null as string | null
  }),

  actions: {
    async initializeAuth() {
      try {
        // Check if user is already authenticated
        const token = localStorage.getItem('token');
        const userJson = localStorage.getItem('user');

        if (token && userJson) {
          // Parse user data
          const user = JSON.parse(userJson);

          // Set store state
          this.user = user;
          this.isAuthenticated = true;
          this.error = null;

          return {
            user,
            isAuthenticated: true
          };
        }

        // If no token or user, reset store
        this.user = null;
        this.isAuthenticated = false;
        this.error = null;

        return {
          user: null,
          isAuthenticated: false
        };
      } catch (error) {
        console.error('Auth initialization error:', error);
        
        // Reset store on error
        this.user = null;
        this.isAuthenticated = false;
        this.error = error instanceof Error ? error.message : 'Auth initialization failed';

        return {
          user: null,
          isAuthenticated: false
        };
      }
    },

    async checkAuth() {
      // Alias for initializeAuth to maintain compatibility
      return this.initializeAuth();
    },

    async register(data: { 
      name: string; 
      email: string; 
      password: string; 
      password_confirmation: string 
    }) {
      try {
        const response = await authService.register(data);
        this.user = response.user;
        this.isAuthenticated = true;
        this.error = null;
        return response;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Registration failed';
        throw error;
      }
    },

    async login(data: { 
      phone: string; 
      password: string 
    }) {
      try {
        const response = await authService.login(data);
        this.user = response.user;
        this.isAuthenticated = true;
        this.error = null;
        return response;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Login failed';
        this.isAuthenticated = false;
        this.user = null;
        throw error;
      }
    },

    async logout() {
      try {
        await authService.logout();
        this.user = null;
        this.isAuthenticated = false;
        this.error = null;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Logout failed';
        throw error;
      }
    }
  },

  persist: {
    enabled: true,
    strategies: [
      {
        key: 'auth',
        storage: localStorage
      }
    ]
  }
});
