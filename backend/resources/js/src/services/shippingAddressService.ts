import api from './api';
import type { ShippingAddress, ShippingAddressInput } from '../types/shippingAddress.types';

class ShippingAddressService {
  async getAddresses(): Promise<ShippingAddress[]> {
    try {
      const response = await api.get('/shipping-addresses');
      return response.data;
    } catch (error) {
      console.error('Fetch Shipping Addresses Failed:', error);
      throw new Error('Unable to fetch shipping addresses.');
    }
  }

  async createAddress(addressData: ShippingAddressInput): Promise<ShippingAddress> {
    try {
      const response = await api.post('/shipping-addresses', addressData);
      return response.data;
    } catch (error) {
      console.error('Create Shipping Address Failed:', error);
      throw new Error('Unable to create shipping address.');
    }
  }

  async updateAddress(id: number, addressData: Partial<ShippingAddressInput>): Promise<ShippingAddress> {
    try {
      const response = await api.put(`/shipping-addresses/${id}`, addressData);
      return response.data;
    } catch (error) {
      console.error('Update Shipping Address Failed:', error);
      throw new Error('Unable to update shipping address.');
    }
  }

  async deleteAddress(id: number): Promise<void> {
    try {
      await api.delete(`/shipping-addresses/${id}`);
    } catch (error) {
      console.error('Delete Shipping Address Failed:', error);
      throw new Error('Unable to delete shipping address.');
    }
  }
}

export default new ShippingAddressService();
