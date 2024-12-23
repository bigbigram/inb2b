import { ref } from 'vue';

interface Toast {
  message: string;
  type: 'success' | 'error';
}

const toast = ref<Toast | null>(null);

export function useToast() {
  const showToast = (message: string, type: 'success' | 'error') => {
    toast.value = { message, type };
    setTimeout(() => {
      toast.value = null;
    }, 3000);
  };

  return {
    toast,
    showToast,
  };
}
