<template>
  <div 
    v-if="show"
    class="fixed top-4 right-4 w-96 bg-white rounded-lg shadow-xl z-50 overflow-hidden transform transition-transform"
    :class="{ 'translate-x-0': show, 'translate-x-full': !show }"
  >
    <div class="p-4 bg-blue-600 text-white flex justify-between items-center">
      <h3 class="text-lg font-semibold">Cart</h3>
      <button @click="close" class="text-white hover:text-gray-200">
        <span class="sr-only">Close</span>
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div class="p-4">
      <div v-if="item" class="flex items-start space-x-4">
        <img 
          :src="item.image || 'https://via.placeholder.com/150'" 
          :alt="item.title"
          class="w-20 h-20 object-cover rounded"
          @error="(e) => { const img = e.target as HTMLImageElement; img.src = 'https://via.placeholder.com/150'; }"
        >
        <div class="flex-1">
          <h4 class="font-medium text-gray-900">{{ item.title }}</h4>
          <p class="text-sm text-gray-500">
            {{ item.color }} / {{ item.size }}
          </p>
          <div class="mt-1 text-sm">
            <span class="font-medium">${{ item.price }}</span>
            <span class="text-gray-500 ml-1">× {{ item.quantity }}</span>
          </div>
        </div>
      </div>

      <div class="mt-4 space-y-2">
        <button 
          @click="viewCart"
          class="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          View Cart
        </button>
        <button 
          @click="checkout"
          class="w-full py-2 px-4 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition-colors"
        >
          Checkout
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps<{
  show: boolean;
  item?: {
    title: string;
    color: string;
    size: string;
    price: number;
    quantity: number;
    image: string;
  };
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const close = () => {
  emit('close');
};

const viewCart = () => {
  router.push('/cart');
  close();
};

const checkout = () => {
  router.push('/checkout');
  close();
};

// Auto-close after 3 seconds when shown
let autoCloseTimer: number | null = null;

const startAutoCloseTimer = () => {
  if (autoCloseTimer) {
    clearTimeout(autoCloseTimer);
  }
  autoCloseTimer = window.setTimeout(() => {
    close();
  }, 2000);
};

watch(() => props.show, (newValue) => {
  if (newValue) {
    startAutoCloseTimer();
  } else if (autoCloseTimer) {
    clearTimeout(autoCloseTimer);
  }
});

// Close on escape key
onMounted(() => {
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && props.show) {
      close();
    }
  };

  window.addEventListener('keydown', handleKeydown);
  
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
    }
  });
});
</script>

<style scoped>
.translate-x-full {
  transform: translateX(100%);
}
</style>
