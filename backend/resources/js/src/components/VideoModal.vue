<template>
  <Transition name="modal">
    <div v-if="show" class="fixed inset-0 z-50" @click="close">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"></div>
      
      <!-- Modal container -->
      <div class="fixed z-10 w-full h-full overflow-auto" :style="modalStyle">
        <div 
          class="relative w-full max-w-4xl mx-auto bg-black rounded-lg overflow-hidden shadow-2xl transform transition-all"
          @click.stop
        >
          <!-- Close button -->
          <button 
            @click="close"
            class="absolute top-4 right-4 z-10 text-white/80 hover:text-white focus:outline-none"
          >
            <span class="sr-only">Close</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Video container with aspect ratio -->
          <div class="relative aspect-video w-full bg-black">
            <!-- Loading spinner -->
            <div v-if="loading" class="absolute inset-0 flex items-center justify-center">
              <div class="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white"></div>
            </div>

            <!-- YouTube iframe -->
            <iframe
              v-if="isYouTubeVideo"
              :src="embedUrl"
              class="absolute inset-0 w-full h-full"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
              @load="onIframeLoad"
            ></iframe>

            <!-- Regular video player -->
            <video
              v-else
              ref="videoPlayer"
              class="absolute inset-0 w-full h-full"
              controls
              autoplay
              :class="{ 'opacity-0': loading }"
              @loadstart="onLoadStart"
              @canplay="onCanPlay"
              @error="handleVideoError"
            >
              <source :src="videoUrl" type="video/mp4">
              Your browser does not support the video tag.
            </video>
          </div>

          <!-- Video title -->
          <div v-if="title" class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <h3 class="text-white text-lg font-medium">{{ title }}</h3>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps<{
  show: boolean;
  videoUrl: string;
  title?: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'error'): void;
}>();

const videoPlayer = ref<HTMLVideoElement | null>(null);
const loading = ref(true);

// Calculate modal position based on scroll
const modalStyle = computed(() => {
  if (typeof window === 'undefined') return {};
  
  const scrollY = window.scrollY || window.pageYOffset;
  const viewportHeight = window.innerHeight;
  const padding = 32; // 2rem padding
  
  return {
    top: `${scrollY}px`,
    height: `${viewportHeight}px`,
    padding: `${padding}px`
  };
});

// Lock body scroll when modal is open
watch(() => props.show, (newValue) => {
  if (newValue) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

// Detect YouTube URL
const isYouTubeVideo = computed(() => {
  return props.videoUrl.includes('youtube.com') || props.videoUrl.includes('youtu.be');
});

// Generate YouTube embed URL
const embedUrl = computed(() => {
  if (!isYouTubeVideo.value) return '';
  
  try {
    const url = new URL(props.videoUrl);
    let videoId = '';
    
    if (url.hostname === 'youtu.be') {
      videoId = url.pathname.slice(1);
    } else {
      videoId = url.searchParams.get('v') || '';
    }
    
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : '';
  } catch (error) {
    console.error('Error parsing YouTube URL:', error);
    return '';
  }
});

// Handle video loading states
const onLoadStart = () => {
  loading.value = true;
};

const onCanPlay = () => {
  loading.value = false;
};

const onIframeLoad = () => {
  loading.value = false;
};

const handleVideoError = () => {
  loading.value = false;
  emit('error');
};

const close = () => {
  if (videoPlayer.value) {
    videoPlayer.value.pause();
    videoPlayer.value.currentTime = 0;
  }
  document.body.style.overflow = '';
  emit('close');
};

// Handle escape key
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.show) {
    close();
  }
};

// Handle window resize
const handleResize = () => {
  if (props.show) {
    // Force a re-render of the modal position
    modalStyle.value;
  }
};

// Add and remove event listeners
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('resize', handleResize);
  // Ensure we restore body scroll
  document.body.style.overflow = '';
});

// Reset video when URL changes
watch(() => props.videoUrl, () => {
  if (videoPlayer.value) {
    loading.value = true;
    videoPlayer.value.load();
  }
});
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  @apply transition-all duration-300 ease-out;
}

.modal-enter-from,
.modal-leave-to {
  @apply opacity-0 scale-95;
}

.modal-enter-to,
.modal-leave-from {
  @apply opacity-100 scale-100;
}
</style>
