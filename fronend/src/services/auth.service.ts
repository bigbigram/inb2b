import axios, { AxiosError } from '@/services/axios';
import { authApi } from './api';
import router from '@/router'; // Import router
import { useNotificationStore } from '@/stores/notification'; // Import notification store

export interface RegisterData {
  name: string;
  email?: string;
  phone: string;
  password: string;
  password_confirmation: string;
  role?: 'customer' | 'admin' | 'vendor';
}

export interface LoginData {
  phone: string;
  password: string;
}

export const authService = {
  sanitizeInput(loginData: LoginData | { phone: { phone: string; password: string } }) {
    // Normalize and sanitize input
    const input = typeof loginData === 'object' && 'phone' in loginData 
      ? (typeof loginData.phone === 'object' 
        ? { 
            phone: loginData.phone.phone, 
            password: loginData.phone.password 
          }
        : loginData)
      : loginData;

    // Validate input
    const sanitizedInput: { phone?: string; password?: string } = {};

    // Sanitize phone
    if (input.phone) {
      // Remove non-digit characters
      const cleanPhone = input.phone.replace(/\D/g, '');
      
      // Validate phone number length and format
      const phoneValidation = {
        length: cleanPhone.length,
        startsWithValidPrefix: ['17', '18', '19'].includes(cleanPhone.slice(0, 2)),
        containsOnlyDigits: /^\d+$/.test(cleanPhone)
      };

      console.log('Phone Validation:', phoneValidation);

      if (
        phoneValidation.length === 8 && 
        phoneValidation.startsWithValidPrefix && 
        phoneValidation.containsOnlyDigits
      ) {
        sanitizedInput.phone = cleanPhone;
      } else {
        throw new Error('Invalid phone number format');
      }
    }

    // Validate password
    if (input.password) {
      if (input.password.length >= 6) {
        sanitizedInput.password = input.password;
      } else {
        throw new Error('Password must be at least 6 characters long');
      }
    }

    return sanitizedInput;
  },

  async login(loginData: LoginData | { phone: { phone: string; password: string } }) {
    try {
      console.group('🔐 Login Attempt');
      console.log('Raw Input:', loginData);
      
      // Normalize and sanitize input
      const { phone, password } = this.sanitizeInput(loginData);
      
      console.log('Sanitized Phone:', phone);
      console.log('Password Length:', password?.length);

      // Ensure CSRF token is initialized before login
      const csrfToken = await initializeCsrf();
      authApi.defaults.headers.common['X-CSRF-Token'] = csrfToken;

      console.log('🚀 Login Submission');
      const credentials = { phone, password };
      console.log('Credentials:', credentials);

      // Attempt login
      const response = await authApi.post('/api/login', credentials);

      console.log('Response Status:', response.status);
      console.log('Response Data:', response.data);

      // Parse the response data
      const responseData = typeof response.data === 'string' 
        ? JSON.parse(response.data) 
        : response.data;

      if (responseData.user && responseData.token) {
        // Store user and token in localStorage with detailed logging
        console.group('💾 Storage Management');
        try {
          localStorage.setItem('user', JSON.stringify(responseData.user));
          localStorage.setItem('token', responseData.token);
          console.log('User stored:', responseData.user);
          console.log('Token stored:', responseData.token ? 'YES' : 'NO');
        } catch (storageError) {
          console.error('Storage Error:', storageError);
        }
        console.groupEnd();

        // Redirect to home page
        router.push('/');

        console.groupEnd(); // Close login attempt group
        return responseData;
      } else {
        // Handle unexpected response format
        console.groupEnd(); // Ensure group is closed
        throw {
          message: 'Invalid server response',
          status: response.status,
          data: responseData
        };
      }
    } catch (error: any) {
      console.group('❌ Login Error Breakdown');
      console.error('Full Error Object:', error);
      
      // Detailed error handling
      let errorResponse;
      if (error instanceof AxiosError) {
        errorResponse = error.response;
        
        console.log('Error Response:', errorResponse);
        console.log('Error Status:', errorResponse?.status);
        console.log('Error Data:', errorResponse?.data);

        // Throw structured error
        console.groupEnd(); // Close error group
        throw {
          message: errorResponse?.data?.message || 
                   errorResponse?.data?.errors?.phone?.[0] || 
                   errorResponse?.data?.errors?.password?.[0] || 
                   'Failed to login',
          status: errorResponse?.status,
          details: errorResponse?.data
        };
      } else if (error instanceof Error) {
        // Handle custom errors like validation errors
        console.groupEnd(); // Close error group
        throw { 
          message: error.message || 'An unexpected error occurred',
          details: error
        };
      } else {
        console.groupEnd(); // Close error group
        throw { message: 'An unexpected error occurred' };
      }
    }
  },

  async register(userData: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) {
    try {
      // Ensure CSRF token is initialized before registration
      const csrfToken = await initializeCsrf();
      authApi.defaults.headers.common['X-CSRF-Token'] = csrfToken;

      // Attempt registration
      const response = await authApi.post('/api/register', userData);

      // Log successful registration details
      console.log('Registration Response:', {
        status: response.status,
        data: response.data
      });

      return response.data;
    } catch (error: any) {
      // Detailed error logging
      console.group('❌ Registration Error Details');
      console.error('Full Error Object:', error);
      console.error('Error Response:', error.response);
      console.error('Error Status:', error.response?.status);
      console.error('Error Data:', error.response?.data);
      console.groupEnd();

      // Throw a structured error
      throw {
        message: 'Failed to register',
        status: error.response?.status,
        details: error.response?.data
      };
    }
  },

  async logout() {
    // Initialize notification store
    const notificationStore = useNotificationStore();

    try {
      // Attempt logout
      const response = await authApi.post('/api/logout');

      // Log successful logout details
      console.log('Logout Response:', {
        status: response.status,
        data: response.data
      });

      // Clear local storage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      // Optional: Clear any other authentication-related storage
      localStorage.removeItem('userRole');
      localStorage.removeItem('permissions');

      console.log('Local storage cleared');

      // Redirect to home page
      router.push('/');

      // Show success notification
      notificationStore.displayToast('Logged out successfully', 'success');

      // Refresh the page
      window.location.reload();

      return response.data;
    } catch (error: any) {
      // Detailed error logging
      console.group('❌ Logout Error Details');
      console.error('Full Error Object:', error);
      console.error('Error Response:', error.response);
      console.error('Error Status:', error.response?.status);
      console.error('Error Data:', error.response?.data);
      console.groupEnd();

      // Clear local storage even if logout fails
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('permissions');

      // Redirect to home page
      router.push('/');

      // Show error notification
      notificationStore.displayToast(
        error.response?.data?.message || 'Logout failed', 
        'error'
      );

      // Refresh the page
      window.location.reload();

      // Throw a structured error
      throw {
        message: 'Failed to logout',
        status: error.response?.status,
        details: error.response?.data
      };
    }
  },
};

export const initializeCsrf = async (): Promise<string | null> => {
  try {
    // Use the sanctum/csrf-cookie endpoint to set the CSRF cookie
    await axios.get('/sanctum/csrf-cookie', {
      baseURL: 'http://localhost:8000',
      withCredentials: true
    });

    // Fetch the CSRF token
    const response = await axios.get('/api/csrf-token', {
      baseURL: 'http://localhost:8000',
      withCredentials: true
    });

    const csrfToken = response.data.csrf_token;
    
    // Store CSRF token in localStorage or sessionStorage if needed
    if (csrfToken) {
      localStorage.setItem('csrf_token', csrfToken);
    }

    return csrfToken;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    return null;
  }
};
