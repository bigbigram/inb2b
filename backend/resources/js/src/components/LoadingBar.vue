<template>
  <div>
    <!-- Loading Bar -->
    <div 
      v-show="show"
      class="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-loading z-50"
    ></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean
}>()
</script>

<style scoped>
@keyframes loading {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(0); }
  100% { transform: translateX(100%); }
}

.animate-loading {
  animation: loading 2s ease-in-out infinite;
}
</style>
