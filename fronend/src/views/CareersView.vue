<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold mb-8 text-center text-gray-800">Join Our Team</h1>
    
    <section class="max-w-4xl mx-auto mb-12 text-center">
      <p class="text-gray-600 text-lg">
        We're always looking for talented and passionate individuals to help us grow and innovate.
      </p>
    </section>
    
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="job in openPositions" 
        :key="job.id" 
        class="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow"
      >
        <h2 class="text-xl font-semibold mb-3 text-gray-800">{{ job.title }}</h2>
        <p class="text-gray-600 mb-4">{{ job.department }}</p>
        <div class="flex items-center justify-between">
          <span class="text-sm text-green-600 font-medium">{{ job.type }}</span>
          <button 
            @click="applyForJob(job)"
            class="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
          >
            Apply Now
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useNotificationStore } from '@/stores/notification.store'

interface JobPosition {
  id: number;
  title: string;
  department: string;
  type: string;
}

const notificationStore = useNotificationStore()

const openPositions = ref<JobPosition[]>([
  {
    id: 1,
    title: 'Senior Software Engineer',
    department: 'Engineering',
    type: 'Full-time'
  },
  {
    id: 2,
    title: 'Product Designer',
    department: 'Design',
    type: 'Full-time'
  },
  {
    id: 3,
    title: 'Customer Support Specialist',
    department: 'Customer Success',
    type: 'Remote'
  }
])

const applyForJob = (job: JobPosition) => {
  notificationStore.displayToast(
    `Thank you for your interest in the ${job.title} position. Our HR team will review your application.`, 
    'success'
  )
}
</script>

<style scoped>
.job-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.job-card:hover {
  transform: translateY(-5px);
}
</style>
