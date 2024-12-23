<template>
  <Transition name="toast">
    <div
      v-if="show"
      :class="[
        'fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md',
        type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
      ]"
    >
      <div class="flex items-center">
        <!-- Success Icon -->
        <svg
          v-if="type === 'success'"
          class="w-6 h-6 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
        <!-- Error Icon -->
        <svg
          v-else
          class="w-6 h-6 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
        <span>{{ message }}</span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  message: string;
  type: 'success' | 'error';
  duration?: number;
}>();

const show = ref(false);

// Show toast and auto-hide
watch(() => props.message, (newMessage) => {
  if (newMessage) {
    show.value = true;
    setTimeout(() => {
      show.value = false;
    }, props.duration || 3000);
  }
}, { immediate: true });
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
