import { defineStore } from 'pinia';
import { authService } from '../services/auth.service';

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
