import { CreateOrderData, Order, CreateShippingAddressData, ShippingAddress, OrderCreationResponse } from '@/types/order';
import type { AxiosInstance } from 'axios';
import { api, initializeCsrf } from './api';
import axios from '@/services/axios';
import { handleApiError, ApiErrorResponse } from '@/utils/errorHandler';

export class OrderService {
  private static instance: OrderService;
  private apiInstance?: AxiosInstance;

  private constructor() {}

  public static getInstance(): OrderService {
    if (!OrderService.instance) {
      OrderService.instance = new OrderService();
    }
    return OrderService.instance;
  }

  public initialize(apiInstance: AxiosInstance) {
    this.apiInstance = apiInstance;
  }

  private getApi(): AxiosInstance {
    if (!this.apiInstance) {
      this.apiInstance = api;
    }
    return this.apiInstance;
  }

  async getUserShippingAddresses(): Promise<ShippingAddress[]> {
    try {
      const response = await this.getApi().get('/shipping-addresses');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch shipping addresses:', error);
      throw error;
    }
  }

  async createShippingAddress(data: CreateShippingAddressData): Promise<ShippingAddress> {
    try {
      const response = await this.getApi().post('/shipping-addresses', data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to create shipping address:', error);

      // Throw a more informative error for validation errors
      if (error.response?.status === 422) {
        const validationErrors = error.response.data.errors;
        if (validationErrors) {
          // Convert validation errors object to readable message
          const errorMessages = Object.entries(validationErrors)
            .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
            .join('\n');
          throw new Error(`Validation failed:\n${errorMessages}`);
        }
      }

      if (error.response?.status === 404) {
        throw new Error('Shipping address not found');
      }

      if (error.response?.status === 403) {
        throw new Error('Invalid shipping address');
      }

      throw error;
    }
  }

  async createOrder(orderData: CreateOrderData): Promise<OrderCreationResponse> {
    try {
      console.group('📦 Order Creation Payload');
      console.log('Full Order Data:', JSON.stringify(orderData, null, 2));

      // Transform order_items to items to match backend validation
      const transformedOrderData = {
        ...orderData,
        items: orderData.order_items
      };
      delete transformedOrderData.order_items;

      // Sanitize order data to remove any undefined or null values
      const sanitizedOrderData = Object.fromEntries(
        Object.entries(transformedOrderData).filter(([_, v]) => v != null)
      );

      console.log('Sanitized Order Data:', JSON.stringify(sanitizedOrderData, null, 2));
      console.groupEnd();

      // Ensure CSRF token is initialized before request
      await initializeCsrf();

      // Create order with comprehensive error handling
      try {
        const response = await this.getApi().post('/api/orders', sanitizedOrderData);
        
        console.log('✅ Order Creation Response:', {
          status: response.status,
          data: response.data
        });

        return response.data;
      } catch (apiError: any) {
        console.error('❌ API Order Creation Error', apiError);
        
        // More detailed error logging
        if (apiError.response) {
          console.log('Response Status:', apiError.response.status);
          console.log('Response Data:', apiError.response.data);
          console.log('Response Headers:', apiError.response.headers);

          // Handle validation errors
          if (apiError.response.status === 422) {
            const validationErrors = apiError.response.data.errors;
            if (validationErrors) {
              const errorMessages = Object.entries(validationErrors)
                .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
                .join('\n');
              throw new Error(`Order Validation Failed:\n${errorMessages}`);
            }
          }
        }

        throw apiError;
      }
    } catch (error: any) {
      console.error('❌ Order Creation Error', error);
      throw error;
    }
  }

  async getOrders(): Promise<Order[]> {
    try {
      const response = await this.getApi().get('/orders');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      throw error;
    }
  }

  async getOrder(orderNumber: string): Promise<Order> {
    try {
      console.group('🔍 Order Retrieval');
      console.log('Fetching order:', orderNumber);

      const response = await this.getApi().get(`/orders/${orderNumber}`);
      
      console.log('Order retrieved:', response.data);
      console.groupEnd();

      return response.data;
    } catch (error: any) {
      console.group('❌ Order Retrieval Error');
      console.error(`Failed to fetch order ${orderNumber}:`, error);
      
      // Detailed error logging
      if (error.response) {
        console.error('Response Status:', error.response.status);
        console.error('Response Data:', error.response.data);
      }
      console.groupEnd();

      // More descriptive error handling
      const errorMessage = error.response?.data?.message || 
                           error.response?.data?.error || 
                           `Unable to retrieve order ${orderNumber}. Please try again later.`;
      
      throw new Error(errorMessage);
    }
  }

  async createOrderWithComprehensiveErrorHandling(orderData: Order): Promise<Order> {
    try {
      const response = await axios.post('/orders', orderData);
      return response.data;
    } catch (error) {
      // Use the new error handler
      const apiError: ApiErrorResponse = handleApiError(error);
      
      // Log the error
      console.group('❌ Order Creation Error');
      console.error('Order Creation Failed:', apiError);
      console.groupEnd();

      // Throw the structured error for the caller to handle
      throw apiError;
    }
  }

  async getOrderWithComprehensiveErrorHandling(orderNumber: string): Promise<Order> {
    try {
      const response = await axios.get(`/orders/${orderNumber}`);
      return response.data;
    } catch (error) {
      // Use the new error handler
      const apiError: ApiErrorResponse = handleApiError(error);
      
      // Log the error
      console.group('❌ Order Retrieval Error');
      console.error('Order Retrieval Failed:', apiError);
      console.groupEnd();

      // Throw the structured error for the caller to handle
      throw apiError;
    }
  }

  async listOrdersWithComprehensiveErrorHandling(page: number = 1, limit: number = 10): Promise<{ 
    data: Order[], 
    total: number, 
    current_page: number, 
    last_page: number 
  }> {
    try {
      const response = await axios.get('/orders', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      // Use the new error handler
      const apiError: ApiErrorResponse = handleApiError(error);
      
      // Log the error
      console.group('❌ Orders List Error');
      console.error('Orders List Retrieval Failed:', apiError);
      console.groupEnd();

      // Throw the structured error for the caller to handle
      throw apiError;
    }
  }
}

// Create the singleton instance
export const orderService = new OrderService();
export default orderService;
