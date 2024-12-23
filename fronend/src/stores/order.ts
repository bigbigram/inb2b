import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import OrderService, { Order, CreateOrderData } from '@/services/OrderService';

export const useOrderStore = defineStore('order', () => {
  const orders = ref<Order[]>([]);
  const currentOrder = ref<Order | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const sortedOrders = computed(() => {
    return [...orders.value].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  });

  const createOrder = async (orderData: CreateOrderData) => {
    try {
      loading.value = true;
      error.value = null;
      const newOrder = await OrderService.createOrder(orderData);
      orders.value.unshift(newOrder);
      return newOrder;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create order';
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  const fetchUserOrders = async () => {
    try {
      loading.value = true;
      error.value = null;
      const fetchedOrders = await OrderService.getUserOrders();
      orders.value = fetchedOrders;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch orders';
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  const getOrderById = async (orderId: number) => {
    try {
      const response = await OrderService.api.get(`/orders/${orderId}`)
      return response.data
    } catch (error) {
      handleApiError(error)
      throw error
    }
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      loading.value = true;
      error.value = null;
      const updatedOrder = await OrderService.updateOrderStatus(orderId, status);
      
      // Update order in the list
      const index = orders.value.findIndex(o => o.id === orderId);
      if (index !== -1) {
        orders.value[index] = updatedOrder;
      }
      
      // Update current order if it's the same
      if (currentOrder.value?.id === orderId) {
        currentOrder.value = updatedOrder;
      }
      
      return updatedOrder;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update order status';
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  const trackOrder = async (orderNumber: string) => {
    try {
      loading.value = true;
      error.value = null;
      const order = await OrderService.trackOrder(orderNumber);
      currentOrder.value = order;
      return order;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to track order';
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  const apiFetchUserOrders = async () => {
    try {
      const response = await OrderService.api.get('/orders')
      return response.data
    } catch (error) {
      handleApiError(error)
      throw error
    }
  };

  const apiTrackOrder = async (orderNumber: string) => {
    try {
      const response = await OrderService.api.get(`/orders/${orderNumber}`)
      return response.data
    } catch (error) {
      handleApiError(error)
      throw error
    }
  };

  const apiUpdateOrderStatus = async (orderId: number, status: string) => {
    try {
      const response = await OrderService.api.patch(`/orders/${orderId}`, { status })
      return response.data
    } catch (error) {
      handleApiError(error)
      throw error
    }
  };

  return {
    orders,
    currentOrder,
    loading,
    error,
    sortedOrders,
    createOrder,
    fetchUserOrders,
    getOrderById,
    updateOrderStatus,
    trackOrder,
    apiFetchUserOrders,
    apiTrackOrder,
    apiUpdateOrderStatus,
  };
});
