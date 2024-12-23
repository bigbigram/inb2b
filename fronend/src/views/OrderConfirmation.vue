<template>
  <div v-if="isLoading" class="flex justify-center items-center min-h-screen">
    <div class="text-center">
      <div class="animate-spin inline-block w-12 h-12 border-4 border-current border-t-transparent text-blue-600 rounded-full" role="status">
        <span class="sr-only">Loading...</span>
      </div>
      <p class="mt-4 text-gray-600 text-lg">Loading order details...</p>
    </div>
  </div>

  <div v-else-if="error" class="flex justify-center items-center min-h-screen">
    <div class="text-center bg-red-100 p-8 rounded-lg">
      <svg class="mx-auto h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h2 class="mt-4 text-xl font-semibold text-red-800">Order Not Found</h2>
      <p class="mt-2 text-red-600">{{ error }}</p>
      <button 
        @click="goBackToOrders" 
        class="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
      >
        Back to Orders
      </button>
    </div>
  </div>

  <div v-else-if="order" class="container mx-auto px-4 py-8">
    <!-- Order Details Header -->
    <div class="flex flex-col md:flex-row justify-between items-center mb-6">
      <h1 class="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-0">
        Order Confirmation
      </h1>
      <button 
        @click="downloadPDF" 
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download PDF
      </button>
    </div>

    <!-- Responsive Table Container -->
    <div class="overflow-x-auto bg-white shadow-md rounded-lg">
      <table class="w-full text-sm text-left text-gray-600">
        <thead class="text-xs text-gray-700 uppercase bg-gray-100">
          <tr>
            <th class="px-4 py-3">Product</th>
            <th class="px-4 py-3 hidden md:table-cell">Color</th>
            <th class="px-4 py-3 hidden md:table-cell">Size</th>
            <th class="px-4 py-3 text-center">Qty</th>
            <th class="px-4 py-3 text-right">Price</th>
            <th class="px-4 py-3 hidden md:table-cell text-right">Tax</th>
            <th class="px-4 py-3 hidden md:table-cell text-right">Logistics</th>
            <th class="px-4 py-3 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="item in order.items" 
            :key="item.id || item.product_name" 
            class="border-b hover:bg-gray-50 transition-colors"
          >
            <td class="px-4 py-3">
              <div class="font-medium">{{ item.product_name || 'Unknown Product' }}</div>
              <div class="md:hidden text-xs text-gray-500">
                <span>Color: {{ item.color || 'N/A' }}</span>
                <span class="ml-2">Size: {{ item.size || 'N/A' }}</span>
              </div>
            </td>
            <td class="px-4 py-3 hidden md:table-cell">{{ item.color || 'N/A' }}</td>
            <td class="px-4 py-3 hidden md:table-cell">{{ item.size || 'N/A' }}</td>
            <td class="px-4 py-3 text-center">{{ item.quantity || 0 }}</td>
            <td class="px-4 py-3 text-right">{{ (item.unit_price || 0).toFixed(2) }}</td>
            <td class="px-4 py-3 hidden md:table-cell text-right">
              {{ (item.tax_amount || 0).toFixed(2) }}
            </td>
            <td class="px-4 py-3 hidden md:table-cell text-right">
              {{ (item.logistics_amount || 0).toFixed(2) }}
            </td>
            <td class="px-4 py-3 text-right font-semibold">
              {{ ((item.quantity || 0) * (item.unit_price || 0)).toFixed(2) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Responsive Price Breakdown -->
    <div class="mt-6 bg-white shadow-md rounded-lg p-6">
      <div class="grid grid-cols-2 gap-4">
        <div class="text-gray-600">Total Tax</div>
        <div class="text-right">Nu. {{ (taxAmount || 0).toFixed(2) }}</div>
        
        <div class="text-gray-600">Total Shipping</div>
        <div class="text-right">Nu. {{ (shippingCost || 0).toFixed(2) }}</div>
        
        <div class="col-span-2 border-t pt-4 text-xl font-bold flex justify-between">
          <span>Total</span>
          <span>Nu. {{ (subtotal || 0).toFixed(2) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { useRoute, useRouter } from 'vue-router'
import OrderService, { Order } from '@/services/OrderService'
import { useNotificationStore } from '@/stores/notification'

const route = useRoute()
const router = useRouter()
const notificationStore = useNotificationStore()

const order = ref<Order | null>(null)
const isLoading = ref(true)
const error = ref(null)

// Computed properties for price breakdown
const subtotal = computed(() => {
  if (!order.value || !order.value.items) return 0;
  
  return order.value.items.reduce((sum, item) => {
    // Safely handle price calculation
    const itemPrice = item.unit_price || 0;
    const itemQuantity = item.quantity || 0;
    return sum + (itemPrice * itemQuantity);
  }, 0);
})

const taxAmount = computed(() => {
  if (!order.value || !order.value.items) return 0;
  
  return order.value.items.reduce((sum, item) => {
    // Safely handle tax calculation
    const itemPrice = item.unit_price || 0;
    const itemQuantity = item.quantity || 0;
    const taxRate = item.tax_amount 
      ? parseFloat(item.tax_amount.toString()) / (itemPrice * itemQuantity)
      : 0;
    
    return sum + (itemPrice * itemQuantity * taxRate);
  }, 0);
})

const shippingCost = computed(() => {
  if (!order.value || !order.value.items) return 0;
  
  return order.value.items.reduce((sum, item) => {
    // Safely handle shipping cost calculation
    const itemQuantity = item.quantity || 0;
    const logisticRate = item.logistics_amount 
      ? parseFloat(item.logistics_amount.toString()) 
      : 0;
    
    return sum + (itemQuantity * logisticRate);
  }, 0);
})

const total = computed(() => {
  // Safely calculate total with fallback to 0
  const subtotalValue = subtotal.value || 0;
  const taxValue = taxAmount.value || 0;
  const shippingValue = shippingCost.value || 0;
  
  return subtotalValue + taxValue + shippingValue;
})

// Fetch order details on component mount
onMounted(async () => {
  try {
    const orderId = route.params.orderId as string
    order.value = await OrderService.getOrderById(parseInt(orderId))

    // Comprehensive logging of order details
    console.log('Fetched Order Details:', {
      id: order.value?.id,
      createdAt: order.value?.created_at || order.value?.createdAt,
      paymentMethod: order.value?.payment_method || order.value?.paymentMethod,
      shippingAddress: order.value?.shipping_address || order.value?.shippingAddress,
      status: order.value?.status,
      items: order.value?.items,
      fullOrder: order.value
    });

    // Validate order data with more detailed checks
    if (!order.value) {
      throw new Error('Order not found');
    }

    // Additional validation for critical order properties
    if (!order.value.id) {
      console.warn('Order is missing ID');
    }
    if (!order.value.status) {
      console.warn('Order is missing status');
    }
    if (!order.value.items || order.value.items.length === 0) {
      console.warn('Order has no items');
    }
  } catch (error: any) {
    console.error('Order Retrieval Error:', {
      errorMessage: error.message,
      errorStack: error.stack,
      errorResponse: error.response?.data
    });

    error.value = error.message || 'Could not fetch order details'
    isLoading.value = false
    notificationStore.error(error.value)
    router.push('/orders')
  } finally {
    isLoading.value = false
  }
})

// Utility methods
const formatPaymentMethod = (method?: string) => {
  // Handle undefined or null method
  if (!method) return 'Payment Method Not Specified';

  // Handle different payment method representations
  const methodMap: { [key: string]: string } = {
    'cod': 'Cash on Delivery',
    'cash_on_delivery': 'Cash on Delivery',
    'credit_card': 'Credit Card',
    'debit_card': 'Debit Card',
    'bank_transfer': 'Bank Transfer'
  };

  // Convert to lowercase safely
  const lowercaseMethod = method.toLowerCase().trim();
  
  return methodMap[lowercaseMethod] || method;
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'Date Not Available';

  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
}

const getStatusClass = (status: string) => {
  switch(status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800'
    case 'processing': return 'bg-blue-100 text-blue-800'
    case 'shipped': return 'bg-green-100 text-green-800'
    case 'delivered': return 'bg-green-200 text-green-900'
    case 'cancelled': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const downloadPDF = () => {
  // Create a new jsPDF instance
  const doc = new jsPDF()
  
  // Add company logo and header
  doc.setFontSize(22)
  doc.text('Order Confirmation', 14, 22)
  
  // Order details
  doc.setFontSize(12)
  doc.text(`Order #: ${order.value.order_number}`, 14, 32)
  doc.text(`Date: ${new Date(order.value.created_at).toLocaleDateString()}`, 14, 39)
  
  // Prepare table data
  const tableColumn = ['Product', 'Color', 'Size', 'Qty', 'Unit Price', 'Tax', 'Logistics', 'Total']
  const tableRows = order.value.items.map(item => [
    item.product_name || 'Unknown Product',
    item.color || 'N/A',
    item.size || 'N/A',
    item.quantity || 0,
    `Nu. ${(item.unit_price || 0).toFixed(2)}`,
    `Nu. ${(item.tax_amount || 0).toFixed(2)}`,
    `Nu. ${(item.logistics_amount || 0).toFixed(2)}`,
    `Nu. ${((item.quantity || 0) * (item.unit_price || 0)).toFixed(2)}`
  ])
  
  // Add table
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 50,
    theme: 'striped',
    styles: { 
      fontSize: 10,
      cellPadding: 3 
    },
    headStyles: { 
      fillColor: [41, 128, 185],
      textColor: 255 
    }
  })
  
  // Add totals
  const finalY = doc.previousAutoTable.finalY + 10
  doc.text(`Subtotal: Nu. ${(subtotal.value || 0).toFixed(2)}`, 14, finalY)
  doc.text(`Total Tax: Nu. ${(taxAmount.value || 0).toFixed(2)}`, 14, finalY + 7)
  doc.text(`Shipping: Nu. ${(shippingCost.value || 0).toFixed(2)}`, 14, finalY + 14)
  doc.text(`Total: Nu. ${(total.value || 0).toFixed(2)}`, 14, finalY + 21)
  
  // Save the PDF
  doc.save(`order_${order.value.order_number}_confirmation.pdf`)
}

const goBackToOrders = () => {
  router.push('/orders')
}
</script>

<style scoped>
/* Responsive table styles */
@media (max-width: 768px) {
  .md\:table-cell {
    display: none !important;
  }
}
</style>
