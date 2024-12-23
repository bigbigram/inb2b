<script setup lang="ts">
import BaseLayout from './components/BaseLayout.vue'
import { RouterView } from 'vue-router'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import MobileFooter from './components/MobileFooter.vue'
import Toast from './components/Toast.vue'
import { RouterLink } from 'vue-router';
import { useToast } from './composables/useToast';

const { toast } = useToast();

</script>

<template>
  <Toast 
    v-if="toast"
    :message="toast.message"
    :type="toast.type"
    :show="!!toast"
  />
  <router-view v-slot="{ Component, route }">
    <template v-if="route.meta.requiresGuest">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </template>
    <BaseLayout v-else>
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </BaseLayout>
  </router-view>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');

/* Page Transitions */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}

/* Global Styles */
html {
  scroll-behavior: smooth;
}

body {
  font-family: 'Inter', sans-serif;
  @apply text-gray-800 bg-gray-50;
}

/* Form Styles */
input[type='text'],
input[type='email'],
input[type='password'],
input[type='number'],
input[type='tel'],
textarea,
select {
  @apply w-full rounded-lg border-gray-300 shadow-sm;
  @apply focus:border-orange-500 focus:ring-orange-500;
}

button {
  @apply transition-colors duration-200;
}

.btn {
  @apply px-4 py-2 rounded-lg font-medium;
}

.btn-primary {
  @apply bg-orange-500 text-white hover:bg-orange-600;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-800 hover:bg-gray-300;
}

.btn-outline {
  @apply border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white;
}

/* Container */
.container {
  @apply max-w-7xl mx-auto px-4;
}

/* Section Spacing */
.section {
  @apply py-12 md:py-16;
}

/* Card Styles */
.card {
  @apply bg-white rounded-lg shadow-sm;
}

.card-body {
  @apply p-6;
}

/* Loading States */
.skeleton {
  @apply animate-pulse bg-gray-200 rounded;
}

/* Error States */
.error-text {
  @apply text-red-500 text-sm mt-1;
}

/* Success States */
.success-text {
  @apply text-green-500 text-sm mt-1;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  @apply w-2;
}

::-webkit-scrollbar-track {
  @apply bg-gray-100;
}

::-webkit-scrollbar-thumb {
  @apply bg-primary-200 rounded-full hover:bg-primary-300;
}

/* Mobile Optimizations */
@media (max-width: 640px) {
  .container {
    @apply px-4;
  }
}
</style>