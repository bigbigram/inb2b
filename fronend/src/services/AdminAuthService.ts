import axios from 'axios';
import type { 
  LoginCredentials, 
  AdminUser, 
  AdminAuthResponse, 
  AdminPasswordReset, 
  AdminProfileUpdate 
} from '../types/auth.types';

const API_URL = '/api';

class AdminAuthService {
  async login(credentials: LoginCredentials): Promise<AdminAuthResponse> {
    const response = await axios.post(`${API_URL}/admin/login`, credentials);
    if (response.data.access_token) {
      localStorage.setItem('admin', JSON.stringify(response.data));
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
    }
    return response.data;
  }

  async resetPassword(data: AdminPasswordReset): Promise<{ message: string }> {
    const response = await axios.post(`${API_URL}/admin/reset-password`, data);
    return response.data;
  }

  async updateProfile(data: AdminProfileUpdate): Promise<AdminUser> {
    const response = await axios.put(`${API_URL}/admin/profile`, data);
    return response.data;
  }

  async getProfile(): Promise<AdminUser> {
    const response = await axios.get(`${API_URL}/admin/profile`);
    return response.data;
  }

  async deactivateAdmin(adminId: number): Promise<{ message: string }> {
    const response = await axios.put(`${API_URL}/admin/${adminId}/deactivate`);
    return response.data;
  }

  async checkAdminExists(): Promise<{ hasAdmin: boolean }> {
    const response = await axios.get(`${API_URL}/admin/check`);
    return response.data;
  }

  logout(): void {
    localStorage.removeItem('admin');
    delete axios.defaults.headers.common['Authorization'];
  }

  getCurrentAdmin(): AdminAuthResponse | null {
    const adminStr = localStorage.getItem('admin');
    if (adminStr) {
      const adminData = JSON.parse(adminStr);
      axios.defaults.headers.common['Authorization'] = `Bearer ${adminData.access_token}`;
      return adminData;
    }
    return null;
  }

  isAdminAuthenticated(): boolean {
    const admin = this.getCurrentAdmin();
    return admin !== null && admin.user.role === 'admin';
  }
}

export default new AdminAuthService();
