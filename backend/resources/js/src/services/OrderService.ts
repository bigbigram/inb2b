import axios from 'axios';
import { CreateOrderData, Order, CreateShippingAddressData, ShippingAddress, OrderCreationResponse } from '@/types/order';
import api from './api';
const API_URL = 'https://api.indob2c.com/api';

class OrderService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = API_URL;
  }

  private getAuthHeaders() {
    // Directly get token from localStorage
    const token = localStorage.getItem('token');
    return token 
      ? { 'Authorization': `Bearer ${token}` } 
      : {};
  }
  decodeToken(token: string | null): { user_id?: number; exp?: number; sub?: string } {
    try {
      // Validate token input
      if (!token) {
        console.error('No token provided');
        return {};
      }

      // Log the raw token for debugging
      console.log('Raw Token:', token);

      // Handle Laravel Sanctum token format: {id}|{token}
      const parts = token.split('|');
      if (parts.length === 2) {
        // First part is the user ID
        const userId = parseInt(parts[0]);
        
        console.log('Extracted User ID from Sanctum Token:', userId);
        
        return {
          user_id: userId,
          sub: parts[0]
        };
      }

      // Fallback to JSON parsing
      try {
        const parsedToken = JSON.parse(token);
        if (parsedToken.user_id) {
          return { user_id: parsedToken.user_id };
        }
      } catch (jsonError) {
        // Not a JSON token
      }

      console.error('Unable to decode token');
      return {};
    } catch (error) {
      console.error('Token decoding error:', error);
      return {};
    }
  }

  async createOrder(orderData: CreateOrderData): Promise<OrderCreationResponse> {
    try {
      // Validate order data before sending
      if (!orderData) {
        throw new Error('Order data is required');
      }

      if (!orderData.shippingAddressId) {
        throw new Error('Shipping address is required');
      }

      if (!orderData.items || orderData.items.length === 0) {
        throw new Error('Order must contain at least one item');
      }

      console.log('Sending Order Request:', JSON.parse(JSON.stringify(orderData)));

      const response = await api.post('/orders', {
        shipping_address_id: orderData.shippingAddressId,
        items: orderData.items.map(item => ({
          product_id: item.productId,
          quantity: item.quantity,
          color: item.color,
          size: item.size
        }))
      });
      console.log('Full Order Creation Response:', response);
      // Extract order from the response
      const createdOrder = response.data;

      if (!createdOrder || !createdOrder.id) {
        console.error('Invalid order creation response:', response.data);
        throw new Error(
          response.data.message || 
          'Invalid order creation response. No order ID found.'
        );
      }

      return createdOrder;
    } catch (error: any) {
      console.error('Order Creation Error:', {
        error,
        errorResponse: error.response?.data,
        errorStatus: error.response?.status,
        requestData: orderData
      });

      // Extract and throw a meaningful error message
      const errorMessage = 
        error.response?.data?.message || 
        (error.response?.data?.errors 
          ? Object.values(error.response.data.errors).flat().join(', ') 
          : error.message || 'Failed to create order');

      throw new Error(errorMessage);
    }
  }

  async getOrders(): Promise<Order[]> {
    try {
      const response = await api.get('/orders', {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch orders:', error);
      throw error;
    }
  }

  async getOrderById(orderId: number): Promise<Order> {
    try {
      const response = await api.get(`/orders/${orderId}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error(`Failed to fetch order ${orderId}:`, error);
      throw error;
    }
  }

  async updateOrderStatus(orderId: number, status: string): Promise<Order> {
    try {
      const response = await api.patch(`/orders/${orderId}/status`, { status }, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error(`Failed to update order ${orderId} status:`, error);
      throw error;
    }
  }

  async trackOrder(orderNumber: string): Promise<Order> {
    try {
      const response = await api.get(`${this.apiUrl}/orders/track/${orderNumber}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error(`Failed to track order ${orderNumber}:`, error);
      throw error;
    }
  }

  async getUserShippingAddresses(): Promise<ShippingAddress[]> {
    try {
      const response = await axios.get(`${this.apiUrl}/shipping-addresses`, {
        headers: this.getAuthHeaders()
      });

      // Log the response for debugging
      console.log('User Shipping Addresses Response:', response.data);

      // Validate the response
      const addresses = response.data.addresses || response.data;
      
      if (!Array.isArray(addresses)) {
        throw new Error('Invalid shipping addresses response');
      }

      return addresses;
    } catch (error: any) {
      console.error('Failed to fetch shipping addresses:', {
        error,
        errorResponse: error.response?.data,
        errorStatus: error.response?.status
      });

      // Extract and throw a meaningful error message
      const errorMessage = error.response?.data?.message || 
        (error.response?.data?.errors 
          ? Object.values(error.response.data.errors).flat().join(', ') 
          : 'Failed to fetch shipping addresses');

      throw new Error(errorMessage);
    }
  }

  async createShippingAddress(addressData: CreateShippingAddressData): Promise<ShippingAddress> {
    try {
      const response = await axios.post(`${this.apiUrl}/shipping-addresses`, addressData, {
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        }
      });

      // Handle different possible response formats
      console.log('Shipping Address Creation Response:', response.data);

      // Extract shipping address, handling various response structures
      const shippingAddress = response.data.address || response.data;

      // Validate the shipping address
      if (!shippingAddress || !shippingAddress.id) {
        throw new Error('Invalid shipping address response');
      }

      return shippingAddress;
    } catch (error: any) {
      console.error('Shipping Address Creation Error:', {
        error,
        errorResponse: error.response?.data,
        errorStatus: error.response?.status
      });

      // Extract and throw a meaningful error message
      const errorMessage = error.response?.data?.message || 
        (error.response?.data?.errors 
          ? Object.values(error.response.data.errors).flat().join(', ') 
          : 'Failed to create shipping address');

      throw new Error(errorMessage);
    }
  }
}

export default new OrderService();
