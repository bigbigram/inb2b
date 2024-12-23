import api from './api';
import axios from 'axios';
import type { LoginCredentials, User, AuthResponse, RegisterData } from '../types/auth.types';

class AuthService {
  user: User | null = null

  initializeAuth() {
    const storedUser = this.getCurrentUser();
    this.user = storedUser;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post('/login', {
        phone: credentials.phone,
        password: credentials.password
      });

      if (response.data) {
        this.handleSuccessfulLogin(response.data);
        return response.data;
      }
    } catch (error: any) {
      console.error('Login Failed:', error);
      
      // Handle specific login errors
      if (error.response && error.response.status === 401) {
        throw new Error('Invalid phone number or password');
      }
      
      throw error;
    }

    throw new Error('Login failed. No response from server.');
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Validate required fields with more lenient checks
      const sanitizedData = {
        name: data.name?.trim() || '',
        phone: data.phone?.trim().replace(/[^\d]/g, ''), // Remove non-digit characters
        email: data.email?.trim() || undefined,
        password: data.password?.trim() || '',
        role: data.role || 'customer'
      };

      console.log('Sanitized Registration Data:', sanitizedData);

      // Throw specific errors if critical fields are empty
      if (!sanitizedData.name) {
        throw new Error('Full name is required');
      }

      if (!sanitizedData.phone) {
        throw new Error('Phone number is required');
      }

      if (!sanitizedData.password) {
        throw new Error('Password is required');
      }

      // Log the exact data being sent
      console.log('Sending Registration Request:', sanitizedData);

      const response = await api.post('/register', sanitizedData);
      
      if (response.data) {
        this.handleSuccessfulLogin(response.data);
        return response.data;
      }
    } catch (error: any) {
      console.error('Full Registration Error:', error);
      
      // Detailed error logging
      if (error.response) {
        console.error('Backend Error Response:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      
      // Handle specific validation errors from backend
      if (error.response && error.response.data && error.response.data.errors) {
        const validationErrors = error.response.data.errors;
        const errorMessages = Object.values(validationErrors).flat().join(', ');
        throw new Error(`Registration failed: ${errorMessages}`);
      }
      
      // Rethrow the original error if it's not from backend validation
      throw error;
    }

    throw new Error('Registration failed. No response from server.');
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.warn('Logout failed on server:', error);
    } finally {
      this.clearAuth();
    }
  }

  async getProfile(): Promise<User> {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      console.error('Fetch Profile Failed:', error);
      throw new Error('Unable to fetch profile.');
    }
  }

  async updateProfile(profileData: { name?: string; fullName?: string; phone: string }): Promise<User> {
    try {
      // Prepare payload, only including defined fields
      const payload: { name?: string; fullName?: string; phone: string } = {
        phone: profileData.phone
      };

      // Add name or fullName if provided
      if (profileData.fullName) {
        payload.fullName = profileData.fullName;
      } else if (profileData.name) {
        payload.name = profileData.name;
      }
      
      const response = await api.put('/profile/update', payload);
      
      // Update local storage with new user data
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...response.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        this.user = updatedUser;
      }
      
      return response.data;
    } catch (error: unknown) {
      this.logError(error, 'Profile Update');
      
      // More detailed error handling
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Profile update failed';
        throw new Error(errorMessage);
      }
      
      throw new Error('An unexpected error occurred while updating profile');
    }
  }

  private handleSuccessfulLogin(data: AuthResponse) {
    console.log('Login Successful');
    
    // Store token and user info
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Update local state
    this.user = data.user;
  }

  clearAuth() {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Update local state
    this.user = null;
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) {
      return false; 
    }

    try {
      // Handle custom token format with prefix
      let cleanToken = token;
      const prefixMatch = token.match(/^\d+\|(.+)$/);
      if (prefixMatch) {
        cleanToken = prefixMatch[1];
      }

      // Split the cleaned token
      const parts = cleanToken.split('.');
      
      // If no dots, assume it's a simple token
      if (parts.length === 1) {
        // Basic validation for non-JWT tokens
        return cleanToken.length > 20;
      }

      // For JWT tokens
      if (parts.length !== 3) {
        return false;
      }

      const payload = JSON.parse(atob(parts[1]));
      const exp = payload.exp;
      
      if (!exp) {
        return true; 
      }

      return Date.now() < exp * 1000;
    } catch (error) {
      return false;
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!token && !!user && this.isTokenValid();
  }

  private logError(error: unknown, context: string = 'Unknown context'): void {
    if (error instanceof Error) {
      console.error(`Error in ${context}:`, {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    } else {
      console.error(`Unknown error in ${context}:`, error);
    }
  }
}

export default new AuthService();
