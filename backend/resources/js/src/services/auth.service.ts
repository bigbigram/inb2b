import axios from '@/services/axios';

interface RegisterData {
  name: string;
  phone: string;
  password: string;
  password_confirmation: string;
  role?: 'customer' | 'admin' | 'vendor';
}

interface LoginData {
  phone: string;
  password: string;
}

export const authService = {
  async register(data: RegisterData) {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value as string);
        }
      });

      const response = await axios.post('/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  },

  async login(data: LoginData) {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await axios.post('/login', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  async logout() {
    try {
      const response = await axios.post('/logout');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Logout failed' };
    }
  }
};
