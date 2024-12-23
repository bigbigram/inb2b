import api from './api';

export const shippingAddressService = {
  async getShippingAddresses() {
    try {
      const response = await api.get('/api/shipping-addresses');
      
      // Ensure the response is an array
      const addresses = Array.isArray(response.data) 
        ? response.data 
        : (response.data.addresses || []);

      return addresses.map(address => ({
        id: address.id,
        fullName: address.full_name,
        email: address.email,
        phone: address.phone,
        addressLine1: address.address_line1,
        addressLine2: address.address_line2 || '',
        city: address.city,
        state: address.state,
        postalCode: address.postal_code || '',
        country: address.country,
        isDefault: address.is_default || false
      }));
    } catch (error) {
      console.error('Failed to fetch shipping addresses:', error);
      throw error;
    }
  },

  async createShippingAddress(addressData: {
    fullName: string;
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode?: string;
    country: string;
    isDefault?: boolean;
  }) {
    try {
      const response = await api.post('/api/shipping-addresses', {
        full_name: addressData.fullName,
        email: addressData.email,
        phone: addressData.phone,
        address_line1: addressData.addressLine1,
        address_line2: addressData.addressLine2 || null,
        city: addressData.city,
        state: addressData.state,
        postal_code: addressData.postalCode || null,
        country: addressData.country,
        is_default: addressData.isDefault || false
      });

      return {
        id: response.data.id,
        fullName: response.data.full_name,
        email: response.data.email,
        phone: response.data.phone,
        addressLine1: response.data.address_line1,
        addressLine2: response.data.address_line2 || '',
        city: response.data.city,
        state: response.data.state,
        postalCode: response.data.postal_code || '',
        country: response.data.country,
        isDefault: response.data.is_default || false
      };
    } catch (error) {
      console.error('Failed to create shipping address:', error);
      throw error;
    }
  },

  async updateShippingAddress(id: number, addressData: {
    fullName?: string;
    email?: string;
    phone?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    isDefault?: boolean;
  }) {
    try {
      const response = await api.put(`/api/shipping-addresses/${id}`, {
        full_name: addressData.fullName,
        email: addressData.email,
        phone: addressData.phone,
        address_line1: addressData.addressLine1,
        address_line2: addressData.addressLine2 || null,
        city: addressData.city,
        state: addressData.state,
        postal_code: addressData.postalCode || null,
        country: addressData.country,
        is_default: addressData.isDefault
      });

      return {
        id: response.data.id,
        fullName: response.data.full_name,
        email: response.data.email,
        phone: response.data.phone,
        addressLine1: response.data.address_line1,
        addressLine2: response.data.address_line2 || '',
        city: response.data.city,
        state: response.data.state,
        postalCode: response.data.postal_code || '',
        country: response.data.country,
        isDefault: response.data.is_default || false
      };
    } catch (error) {
      console.error('Failed to update shipping address:', error);
      throw error;
    }
  },

  async deleteShippingAddress(id: number) {
    try {
      await api.delete(`/api/shipping-addresses/${id}`);
      return true;
    } catch (error) {
      console.error('Failed to delete shipping address:', error);
      throw error;
    }
  }
};
