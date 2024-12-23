<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold mb-8 text-center text-gray-800">Shipping Information</h1>
    
    <div class="max-w-4xl mx-auto space-y-8">
      <section class="bg-white shadow-md rounded-lg p-6">
        <h2 class="text-2xl font-semibold mb-4 text-gray-800">Shipping Methods</h2>
        <div class="grid md:grid-cols-3 gap-4">
          <div 
            v-for="method in shippingMethods" 
            :key="method.id" 
            class="bg-gray-50 p-4 rounded-lg border border-gray-200"
          >
            <h3 class="font-bold text-lg mb-2">{{ method.name }}</h3>
            <p class="text-gray-600 mb-2">{{ method.description }}</p>
            <span class="text-orange-500 font-medium">{{ method.price }}</span>
          </div>
        </div>
      </section>
      
      <section class="bg-white shadow-md rounded-lg p-6">
        <h2 class="text-2xl font-semibold mb-4 text-gray-800">Shipping Zones</h2>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-100">
                <th class="p-3 text-left">Region</th>
                <th class="p-3 text-left">Estimated Delivery</th>
                <th class="p-3 text-left">Shipping Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="zone in shippingZones" 
                :key="zone.id" 
                class="border-b"
              >
                <td class="p-3">{{ zone.name }}</td>
                <td class="p-3">{{ zone.deliveryTime }}</td>
                <td class="p-3 text-orange-500">{{ zone.cost }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      
      <section class="bg-white shadow-md rounded-lg p-6">
        <h2 class="text-2xl font-semibold mb-4 text-gray-800">Shipping Policy</h2>
        <ul class="space-y-3 text-gray-600">
          <li>✓ Free shipping on orders over $100</li>
          <li>✓ Tracked and insured shipping</li>
          <li>✓ Flexible return policy within 30 days</li>
          <li>✓ International shipping available</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface ShippingMethod {
  id: number;
  name: string;
  description: string;
  price: string;
}

interface ShippingZone {
  id: number;
  name: string;
  deliveryTime: string;
  cost: string;
}

const shippingMethods = ref<ShippingMethod[]>([
  {
    id: 1,
    name: 'Standard Shipping',
    description: 'Delivery in 5-7 business days',
    price: 'Free'
  },
  {
    id: 2,
    name: 'Express Shipping',
    description: 'Delivery in 2-3 business days',
    price: '$9.99'
  },
  {
    id: 3,
    name: 'Next Day Delivery',
    description: 'Guaranteed next business day',
    price: '$19.99'
  }
])

const shippingZones = ref<ShippingZone[]>([
  {
    id: 1,
    name: 'Local (Within City)',
    deliveryTime: '1-2 days',
    cost: 'Free'
  },
  {
    id: 2,
    name: 'National',
    deliveryTime: '3-5 days',
    cost: '$5.99'
  },
  {
    id: 3,
    name: 'International',
    deliveryTime: '7-14 days',
    cost: '$19.99'
  }
])
</script>

<style scoped>
table tr:nth-child(even) {
  background-color: #f9fafb;
}
</style>
