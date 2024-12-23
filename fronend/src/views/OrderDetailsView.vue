<template>
  <div class="order-details-container">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-spinner">
      <span>Loading order details...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMessage" class="error-message">
      <div class="alert alert-danger">
        <h3>Order Loading Error</h3>
        <p>{{ errorMessage }}</p>
        <button @click="retryLoadOrder" class="btn btn-secondary mt-2">
          Try Again
        </button>
      </div>
    </div>

    <!-- Order Details -->
    <div v-else-if="order" class="order-details">
      <div class="order-header">
        <h2>Order #{{ order.order_number }}</h2>
        <span class="badge" :class="getStatusClass(order.status)">
          {{ order.status }}
        </span>
      </div>

      <div class="order-summary">
        <div class="summary-section">
          <h4>Order Summary</h4>
          <p>Total Amount: {{ formatCurrency(order.total_amount) }}</p>
          <p>Shipping Cost: {{ formatCurrency(order.shipping_cost) }}</p>
          <p>Tax Amount: {{ formatCurrency(order.tax_amount) }}</p>
        </div>

        <div class="items-section">
          <h4>Order Items</h4>
          <table class="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in order.items" :key="item.id">
                <td>{{ item.product_name }}</td>
                <td>{{ item.quantity }}</td>
                <td>{{ formatCurrency(item.unit_price) }}</td>
                <td>{{ formatCurrency(item.total_price) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import orderService from '@/services/OrderService';
import { Order } from '@/types/order';

export default defineComponent({
  name: 'OrderDetailsView',
  setup() {
    const route = useRoute();
    const order = ref<Order | null>(null);
    const isLoading = ref(true);
    const errorMessage = ref('');

    const loadOrder = async () => {
      try {
        // Reset states
        isLoading.value = true;
        errorMessage.value = '';

        // Get order number from route
        const orderNumber = route.params.orderNumber as string;

        console.group('🔍 Order Loading');
        console.log('Attempting to load order with number:', orderNumber);

        // Validate order number
        if (!orderNumber) {
          throw new Error('Order number is required');
        }

        // Load order using service
        order.value = await orderService.getOrder(orderNumber);
        
        console.log('Order loaded successfully:', order.value);
        console.groupEnd();
      } catch (error) {
        console.group('❌ Order Loading Error');
        console.error('Failed to load order:', error);
        
        // Display user-friendly error message
        errorMessage.value = error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred while loading the order';
        
        console.groupEnd();
      } finally {
        isLoading.value = false;
      }
    };

    const retryLoadOrder = () => {
      loadOrder();
    };

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value);
    };

    const getStatusClass = (status: string) => {
      const statusClasses = {
        'pending': 'badge-warning',
        'processing': 'badge-info',
        'shipped': 'badge-primary',
        'delivered': 'badge-success',
        'cancelled': 'badge-danger'
      };
      return statusClasses[status] || 'badge-secondary';
    };

    // Load order when component is mounted
    onMounted(loadOrder);

    return {
      order,
      isLoading,
      errorMessage,
      loadOrder,
      retryLoadOrder,
      formatCurrency,
      getStatusClass
    };
  }
});
</script>

<style scoped>
.order-details-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.error-message {
  text-align: center;
  padding: 20px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.badge {
  padding: 5px 10px;
  border-radius: 4px;
}

.badge-warning { background-color: #ffc107; color: #000; }
.badge-info { background-color: #17a2b8; color: #fff; }
.badge-primary { background-color: #007bff; color: #fff; }
.badge-success { background-color: #28a745; color: #fff; }
.badge-danger { background-color: #dc3545; color: #fff; }
.badge-secondary { background-color: #6c757d; color: #fff; }
</style>
