import api from './api';
import type { ShippingAddress, ShippingAddressInput } from '../types/shippingAddress.types';

class ShippingAddressService {
  async getAddresses(): Promise<ShippingAddress[]> {
    try {
      const response = await api.get('/api/shipping-addresses');
      
      // Log full response for debugging
      console.log('Shipping Addresses API Response:', {
        status: response.status,
        headers: response.headers,
        data: response.data
      });

      // Validate response data
      if (!response.data) {
        throw new Error('No data received from shipping addresses endpoint');
      }

      // Handle different possible response formats
      const addresses = response.data.data || response.data.addresses || response.data;

      // Ensure addresses is an array
      if (!Array.isArray(addresses)) {
        throw new Error(`Expected an array of addresses, received: ${typeof addresses}`);
      }

      return addresses;
    } catch (error: any) {
      // More detailed error logging
      console.error('Fetch Shipping Addresses Failed:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });

      // Throw a more informative error
      throw new Error(
        error.response?.data?.message || 
        'Unable to fetch shipping addresses. Please check your connection and try again.'
      );
    }
  }

  async createAddress(addressData: ShippingAddressInput): Promise<ShippingAddress> {
    try {
      const response = await api.post('/api/shipping-addresses', addressData);
      return response.data;
    } catch (error: any) {
      console.error('Create Shipping Address Failed:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      throw new Error(
        error.response?.data?.message || 
        'Unable to create shipping address. Please try again.'
      );
    }
  }

  async updateAddress(id: number, addressData: Partial<ShippingAddressInput>): Promise<ShippingAddress> {
    try {
      const response = await api.put(`/api/shipping-addresses/${id}`, addressData);
      return response.data;
    } catch (error: any) {
      console.error('Update Shipping Address Failed:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      throw new Error(
        error.response?.data?.message || 
        'Unable to update shipping address. Please try again.'
      );
    }
  }

  async deleteAddress(id: number): Promise<void> {
    try {
      await api.delete(`/api/shipping-addresses/${id}`);
    } catch (error: any) {
      console.error('Delete Shipping Address Failed:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      throw new Error(
        error.response?.data?.message || 
        'Unable to delete shipping address. Please try again.'
      );
    }
  }
}

export default new ShippingAddressService();
