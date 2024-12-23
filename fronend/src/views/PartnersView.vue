<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold mb-8 text-center text-gray-800">Our Strategic Partners</h1>
    
    <section class="max-w-4xl mx-auto mb-12 text-center">
      <p class="text-gray-600 text-lg">
        We collaborate with industry leaders to deliver exceptional value and innovative solutions.
      </p>
    </section>
    
    <div class="grid md:grid-cols-3 lg:grid-cols-4 gap-8 justify-center">
      <div 
        v-for="partner in partners" 
        :key="partner.id" 
        class="bg-white shadow-md rounded-lg p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow"
      >
        <img 
          :src="partner.logo" 
          :alt="partner.name" 
          class="w-32 h-32 object-contain mb-4"
        >
        <h2 class="text-xl font-semibold mb-2 text-gray-800">{{ partner.name }}</h2>
        <p class="text-gray-600 text-sm mb-4">{{ partner.description }}</p>
        <a 
          :href="partner.website" 
          target="_blank" 
          class="text-orange-500 hover:text-orange-600 font-medium"
        >
          Visit Website
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Partner {
  id: number;
  name: string;
  logo: string;
  description: string;
  website: string;
}

const partners = ref<Partner[]>([
  {
    id: 1,
    name: 'Tech Innovators',
    logo: 'https://via.placeholder.com/150?text=Tech+Logo',
    description: 'Leading technology solutions provider',
    website: 'https://techinnovators.com'
  },
  {
    id: 2,
    name: 'Global Logistics',
    logo: 'https://via.placeholder.com/150?text=Logistics+Logo',
    description: 'Efficient worldwide shipping and delivery',
    website: 'https://globallogistics.com'
  },
  {
    id: 3,
    name: 'Payment Solutions',
    logo: 'https://via.placeholder.com/150?text=Payment+Logo',
    description: 'Secure and seamless payment processing',
    website: 'https://paymentsolutions.com'
  },
  {
    id: 4,
    name: 'Cloud Services',
    logo: 'https://via.placeholder.com/150?text=Cloud+Logo',
    description: 'Scalable cloud infrastructure',
    website: 'https://cloudservices.com'
  }
])
</script>

<style scoped>
.partner-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.partner-card:hover {
  transform: scale(1.05);
}
</style>
