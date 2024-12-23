import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationStore = defineStore('notification', () => {
  const showToast = ref(false)
  const toastMessage = ref('')
  const toastType = ref<'success' | 'error' | 'info'>('info')

  const displayToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    toastMessage.value = message
    toastType.value = type
    showToast.value = true

    setTimeout(() => {
      showToast.value = false
    }, 3000)
  }

  return {
    showToast,
    toastMessage,
    toastType,
    displayToast
  }
})
