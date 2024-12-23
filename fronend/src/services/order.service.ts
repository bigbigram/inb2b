import api from './api';
import { shippingAddressService } from './shipping-address.service';

export const OrderService = {
  async getUserShippingAddresses() {
    return await shippingAddressService.getShippingAddresses();
  },

  async createOrder(orderData: any) {
    try {
      // Ensure CSRF token is set before request
      await initializeCsrf()

      const response = await api.post('/api/orders', orderData)
      return response.data
    } catch (error: any) {
      console.error('Order creation error:', error)

      // Handle specific error scenarios
      if (error.response) {
        // Server responded with an error
        switch (error.response.status) {
          case 422:
            // Validation errors
            const validationErrors = error.response.data.errors || {}
            throw new Error(Object.values(validationErrors).flat()[0] || 'Validation failed')
          
          case 403:
            throw new Error('Unauthorized to create order')
          
          case 500:
            throw new Error('Server error. Please try again later.')
          
          default:
            throw new Error(error.response.data.message || 'Failed to create order')
        }
      } else if (error.request) {
        // Request made but no response received
        throw new Error('No response from server. Please check your connection.')
      } else {
        // Something happened in setting up the request
        throw new Error('Error creating order. Please try again.')
      }
    }
  },

  async getOrders() {
    try {
      const response = await api.get('/api/orders');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      throw error;
    }
  },

  async getOrderDetails(orderId: number) {
    try {
      const response = await api.get(`/api/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      throw error;
    }
  }
};
