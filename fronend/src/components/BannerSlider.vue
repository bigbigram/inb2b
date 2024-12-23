<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  banners: Array<{
    image: string
    title: string
    description: string
    actionText?: string
    link?: string
  }>
}>()

const emit = defineEmits<{
  (e: 'action', banner: any): void
}>()

const currentSlide = ref(0)
const autoplayInterval = ref<number>()

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % props.banners.length
}

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + props.banners.length) % props.banners.length
}

const goToSlide = (index: number) => {
  currentSlide.value = index
}

const handleAction = (banner: any) => {
  emit('action', banner)
}

const startAutoplay = () => {
  autoplayInterval.value = window.setInterval(() => {
    nextSlide()
  }, 5000)
}

const stopAutoplay = () => {
  if (autoplayInterval.value) {
    clearInterval(autoplayInterval.value)
  }
}

onMounted(() => {
  startAutoplay()
})

onUnmounted(() => {
  stopAutoplay()
})
</script>

<template>
  <div class="relative">
    <!-- Slider Container -->
    <div class="relative overflow-hidden rounded-lg">
      <!-- Slides -->
      <div 
        class="flex transition-transform duration-500 ease-out"
        :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
      >
        <div 
          v-for="(banner, index) in props.banners" 
          :key="index"
          class="w-full flex-shrink-0 relative"
        >
          <img 
            :src="banner.image" 
            :alt="banner.title"
            class="w-full aspect-[21/9] object-cover"
            @error="(e: Event) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/1920x820'"
          >
          <!-- Content Overlay -->
          <div class="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center">
            <div class="text-white p-8 max-w-xl">
              <h2 class="text-2xl md:text-4xl font-bold mb-4">{{ banner.title }}</h2>
              <p class="text-sm md:text-base mb-6 opacity-90">{{ banner.description }}</p>
              <button 
                class="px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
                @click="handleAction(banner)"
              >
                {{ banner.actionText || 'Shop Now' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Arrows -->
      <button 
        class="absolute top-1/2 left-4 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-gray-800 hover:text-orange-500 transition-colors"
        @click="prevSlide"
      >
        <i class="fas fa-chevron-left"></i>
      </button>
      <button 
        class="absolute top-1/2 right-4 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-gray-800 hover:text-orange-500 transition-colors"
        @click="nextSlide"
      >
        <i class="fas fa-chevron-right"></i>
      </button>

      <!-- Indicators -->
      <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        <button
          v-for="(_, index) in props.banners"
          :key="index"
          @click="goToSlide(index)"
          class="w-2 h-2 rounded-full transition-all duration-300"
          :class="index === currentSlide ? 'w-6 bg-orange-500' : 'bg-white/60 hover:bg-white'"
        ></button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add styles here */
</style>