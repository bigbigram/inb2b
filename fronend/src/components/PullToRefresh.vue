<template>
  <div 
    class="pull-to-refresh-container"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
  >
    <!-- Pull to refresh indicator -->
    <div 
      class="pull-to-refresh-indicator"
      :class="{
        'is-pulling': isPulling,
        'is-refreshing': isRefreshing
      }"
      :style="{
        transform: `translateY(${Math.min(pullDistance, maxPullDistance)}px)`,
        opacity: Math.min(pullDistance / maxPullDistance, 1)
      }"
    >
      <div class="flex items-center justify-center gap-2">
        <svg 
          class="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-600" 
          :class="{ 'hidden': !isRefreshing }"
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            class="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            stroke-width="4"
          ></circle>
          <path 
            class="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span v-if="!isRefreshing" class="text-sm text-gray-600">
          {{ pullDistance >= maxPullDistance ? 'Release to refresh' : 'Pull to refresh' }}
        </span>
        <span v-else class="text-sm text-gray-600">Refreshing...</span>
      </div>
    </div>

    <!-- Content slot -->
    <div 
      class="pull-to-refresh-content"
      :style="{
        transform: `translateY(${Math.min(pullDistance, maxPullDistance)}px)`
      }"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  onRefresh: () => Promise<void>;
}>();

const maxPullDistance = 80;
const pullDistance = ref(0);
const startY = ref(0);
const isPulling = ref(false);
const isRefreshing = ref(false);

const onTouchStart = (e: TouchEvent) => {
  // Only enable pull to refresh when at the top of the page
  if (window.scrollY === 0) {
    startY.value = e.touches[0].clientY;
    isPulling.value = true;
  }
};

const onTouchMove = (e: TouchEvent) => {
  if (!isPulling.value || isRefreshing.value) return;

  const currentY = e.touches[0].clientY;
  const diff = currentY - startY.value;

  // Only allow pulling down
  if (diff > 0) {
    // Add resistance to the pull
    pullDistance.value = diff * 0.5;
    e.preventDefault();
  }
};

const onTouchEnd = async () => {
  if (!isPulling.value || isRefreshing.value) return;

  if (pullDistance.value >= maxPullDistance) {
    isRefreshing.value = true;
    try {
      await props.onRefresh();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      isRefreshing.value = false;
    }
  }

  isPulling.value = false;
  pullDistance.value = 0;
};
</script>

<style scoped>
.pull-to-refresh-container {
  position: relative;
  min-height: 100%;
  touch-action: pan-y;
}

.pull-to-refresh-indicator {
  position: absolute;
  left: 0;
  right: 0;
  top: -60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease-out;
}

.pull-to-refresh-content {
  transition: transform 0.2s ease-out;
}

.is-refreshing {
  transition: none;
}
</style>
