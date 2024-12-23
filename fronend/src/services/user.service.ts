import api from './api';

export const userService = {
  async getProfile() {
    try {
      const response = await api.get('/api/profile');
      return {
        data: response.data.user || response.data
      };
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      throw error;
    }
  },

  async updateProfile(profileData: {
    name: string;
    phone: string;
  }) {
    try {
      const response = await api.put('/api/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }
};
