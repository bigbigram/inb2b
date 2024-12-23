<template>
  <div class="bg-white rounded-lg shadow p-4">
    <h3 class="text-lg font-semibold mb-4">Notification Settings</h3>
    
    <div class="space-y-4">
      <!-- Enable/Disable Notifications -->
      <div class="flex items-center justify-between">
        <div>
          <h4 class="font-medium">Product Notifications</h4>
          <p class="text-sm text-gray-600">Get notified when new products are added</p>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            :checked="isEnabled"
            @change="toggleNotifications" 
            class="sr-only peer"
          >
          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
        </label>
      </div>

      <!-- Clear History -->
      <div class="flex items-center justify-between">
        <div>
          <h4 class="font-medium">Notification History</h4>
          <p class="text-sm text-gray-600">Clear your notification history</p>
        </div>
        <button 
          @click="clearHistory"
          class="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300"
        >
          Clear History
        </button>
      </div>

      <!-- Test Notification -->
      <div class="flex items-center justify-between">
        <div>
          <h4 class="font-medium">Test Notifications</h4>
          <p class="text-sm text-gray-600">Send a test notification</p>
        </div>
        <button 
          @click="sendTestNotification"
          class="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300"
        >
          Test
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import NotificationService from '../services/NotificationService'

const notificationService = NotificationService.getInstance()
const isEnabled = ref(false)

onMounted(() => {
  isEnabled.value = notificationService.isEnabled()
})

const toggleNotifications = async () => {
  if (isEnabled.value) {
    await notificationService.disableNotifications()
  } else {
    await notificationService.enableNotifications()
  }
  isEnabled.value = notificationService.isEnabled()
}

const clearHistory = () => {
  notificationService.clearHistory()
}

const sendTestNotification = () => {
  notificationService.showNotification('Test Notification 🔔', {
    body: 'This is a test notification. Your notifications are working!',
    tag: 'test'
  })
}
</script>
