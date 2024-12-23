<template>
  <footer class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
    <div class="grid grid-cols-4 h-16">
      <router-link 
        to="/" 
        class="flex flex-col items-center justify-center text-gray-600 transition-colors duration-200 hover:text-orange-500"
        :class="{ 'text-orange-500 font-medium': $route.path === '/' }"
      >
        <i class="fas fa-home text-xl"></i>
        <span class="text-xs mt-1">Home</span>
      </router-link>

      <router-link 
        to="/categories" 
        class="flex flex-col items-center justify-center text-gray-600 transition-colors duration-200 hover:text-orange-500"
        :class="{ 'text-orange-500 font-medium': $route.path === '/categories' }"
      >
        <i class="fas fa-th-large text-xl"></i>
        <span class="text-xs mt-1">Categories</span>
      </router-link>

      <router-link 
        to="/cart" 
        class="flex flex-col items-center justify-center text-gray-600 transition-colors duration-200 hover:text-orange-500 relative"
        :class="{ 'text-orange-500 font-medium': $route.path === '/cart' }"
      >
        <div class="relative">
          <i class="fas fa-shopping-cart text-xl"></i>
          <span 
            v-if="cartStore.itemCount > 0" 
            class="absolute -top-2 -right-2.5 bg-orange-500 text-white text-xs font-medium rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
          >
            {{ cartStore.itemCount }}
          </span>
        </div>
        <span class="text-xs mt-1">Cart</span>
      </router-link>

      <router-link 
        to="/profile" 
        class="flex flex-col items-center justify-center text-gray-600 transition-colors duration-200 hover:text-orange-500"
        :class="{ 'text-orange-500 font-medium': $route.path === '/profile' }"
      >
        <i class="fas fa-user text-xl"></i>
        <span class="text-xs mt-1">Profile</span>
      </router-link>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useCartStore } from '../stores/cart'

const cartStore = useCartStore()
</script>

<style>
.footer-icon {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.cart-badge {
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  min-width: 1.25rem;
  height: 1.25rem;
  padding: 0 0.25rem;
  border-radius: 9999px;
  background-color: #f97316;
  color: white;
  font-size: 0.75rem;
  line-height: 1.25rem;
  text-align: center;
}
</style>
