import { defineStore } from 'pinia';
import { ref } from 'vue';

type ToastType = 'success' | 'error';

export const useNotificationStore = defineStore('notification', () => {
  // Toast state
  const toastMessage = ref('');
  const toastType = ref<ToastType>('error');

  // Toast display method
  function displayToast(message: string, type: ToastType = 'error', duration: number = 3000) {
    // Set toast properties
    toastMessage.value = message;
    toastType.value = type;
  }

  // Return reactive state and methods
  return {
    toastMessage,
    toastType,
    displayToast
  };
});
