<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-hidden" @click.self="close">
    <div class="flex items-center justify-center min-h-screen px-4">
      <!-- Overlay -->
      <div class="fixed inset-0 bg-black bg-opacity-75 transition-opacity"></div>

      <!-- Modal -->
      <div class="relative bg-white max-w-6xl w-full rounded-lg shadow-xl overflow-hidden">
        <!-- Close button -->
        <button 
          @click="close"
          class="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
        >
          <span class="sr-only">Close</span>
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Image container -->
        <div class="relative aspect-w-16 aspect-h-9">
          <img 
            :src="currentImage" 
            :alt="`Gallery image ${currentIndex + 1}`"
            class="object-contain w-full h-full"
          >
        </div>

        <!-- Navigation buttons -->
        <button 
          v-if="currentIndex > 0"
          @click="previous"
          class="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75"
        >
          <span class="sr-only">Previous</span>
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button 
          v-if="currentIndex < totalImages - 1"
          @click="next"
          class="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75"
        >
          <span class="sr-only">Next</span>
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <!-- Thumbnails -->
        <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          <button
            v-for="(_, index) in images"
            :key="index"
            @click="currentIndex = index"
            class="w-2 h-2 rounded-full transition-colors"
            :class="index === currentIndex ? 'bg-white' : 'bg-gray-400 hover:bg-gray-300'"
          >
            <span class="sr-only">Go to image {{ index + 1 }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  show: boolean;
  images: string[];
  initialIndex?: number;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const currentIndex = ref(props.initialIndex || 0);

const totalImages = computed(() => props.images.length);
const currentImage = computed(() => props.images[currentIndex.value]);

const next = () => {
  if (currentIndex.value < totalImages.value - 1) {
    currentIndex.value++;
  }
};

const previous = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
};

const close = () => {
  emit('close');
};

// Keyboard navigation
const handleKeydown = (event: KeyboardEvent) => {
  if (!props.show) return;
  
  switch (event.key) {
    case 'ArrowLeft':
      previous();
      break;
    case 'ArrowRight':
      next();
      break;
    case 'Escape':
      close();
      break;
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>
