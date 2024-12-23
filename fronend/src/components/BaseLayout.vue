<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Toast Notification -->
    <div v-if="notification.showToast" 
         class="fixed left-0 right-0 mx-auto w-fit top-[40vh] px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in"
         :class="{
           'bg-green-500 text-white': notification.toastType === 'success',
           'bg-red-500 text-white': notification.toastType === 'error',
           'bg-blue-500 text-white': notification.toastType === 'info'
         }">
      <p class="font-medium text-center">
        <i class="fas" :class="{
          'fa-check': notification.toastType === 'success',
          'fa-times': notification.toastType === 'error',
          'fa-info': notification.toastType === 'info'
        }"></i>
        {{ notification.toastMessage }}
      </p>
    </div>
    <!-- Mobile Sidebar -->
    <div v-if="isSidebarOpen" 
         class="fixed inset-0 z-50 lg:hidden"
         @click="isSidebarOpen = !isSidebarOpen">
      <div class="fixed inset-y-0 right-0 w-72 bg-white shadow-lg transform transition-transform duration-300 ease-in-out"
           :class="{ 'translate-x-0': isSidebarOpen, 'translate-x-full': !isSidebarOpen }"
           @click.stop>
        <!-- Sidebar Content -->
        <div class="h-full flex flex-col">
          <div class="p-6 border-b flex justify-between items-center bg-gradient-to-r from-orange-500 to-orange-600">
            <img :src="headerLogo" alt="Logo" class="h-8 brightness-0 invert">
            <button @click="isSidebarOpen = !isSidebarOpen" 
                    class="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <!-- Main Navigation -->
          <nav class="flex-1 px-4 py-6">
            <div class="space-y-1">
              <router-link to="/"
                          class="flex items-center px-4 py-3 text-gray-600 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900"
                          :class="{ 'text-orange-500 font-medium': $route.path === '/' }"
                          @click="isSidebarOpen = !isSidebarOpen">
                <i class="fas fa-home w-5"></i>
                <span class="ml-3">Home</span>
              </router-link>
              
              <router-link to="/orders"
                          class="flex items-center px-4 py-3 text-gray-600 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900"
                          :class="{ 'text-orange-500 font-medium': $route.path === '/orders' }"
                          @click="isSidebarOpen = !isSidebarOpen">
                <i class="fas fa-shopping-bag w-5"></i>
                <span class="ml-3">Orders</span>
              </router-link>
              
              <router-link to="/profile"
                          class="flex items-center px-4 py-3 text-gray-600 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900"
                          :class="{ 'text-orange-500 font-medium': $route.path === '/profile' }"
                          @click="isSidebarOpen = !isSidebarOpen">
                <i class="fas fa-user w-5"></i>
                <span class="ml-3">Profile</span>
              </router-link>

              <router-link to="/contact"
                          class="flex items-center px-4 py-3 text-gray-600 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900"
                          :class="{ 'text-orange-500 font-medium': $route.path === '/contact' }"
                          @click="isSidebarOpen = !isSidebarOpen">
                <i class="fas fa-envelope w-5"></i>
                <span class="ml-3">Contact Us</span>
              </router-link>
              
              <router-link to="/support"
                          class="flex items-center px-4 py-3 text-gray-600 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900"
                          :class="{ 'text-orange-500 font-medium': $route.path === '/support' }"
                          @click="isSidebarOpen = !isSidebarOpen">
                <i class="fas fa-headset w-5"></i>
                <span class="ml-3">Support</span>
              </router-link>

              <router-link to="/about"
                          class="flex items-center px-4 py-3 text-gray-600 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900"
                          :class="{ 'text-orange-500 font-medium': $route.path === '/about' }"
                          @click="isSidebarOpen = !isSidebarOpen">
                <i class="fas fa-info-circle w-5"></i>
                <span class="ml-3">About Us</span>
              </router-link>
            </div>

            <!-- Quick Links Section -->
            <div class="mt-8">
              <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-4">Quick Links</h3>
              <div class="space-y-1">
                <router-link to="/blog"
                            class="flex items-center px-4 py-2 text-gray-600 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900"
                            :class="{ 'text-orange-500 font-medium': $route.path === '/blog' }"
                            @click="isSidebarOpen = !isSidebarOpen">
                  <i class="fas fa-newspaper w-5"></i>
                  <span class="ml-3">Blog</span>
                </router-link>
                <router-link to="/careers"
                            class="flex items-center px-4 py-2 text-gray-600 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900"
                            :class="{ 'text-orange-500 font-medium': $route.path === '/careers' }"
                            @click="isSidebarOpen = !isSidebarOpen">
                  <i class="fas fa-briefcase w-5"></i>
                  <span class="ml-3">Careers</span>
                </router-link>
                <router-link to="/partners"
                            class="flex items-center px-4 py-2 text-gray-600 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900"
                            :class="{ 'text-orange-500 font-medium': $route.path === '/partners' }"
                            @click="isSidebarOpen = !isSidebarOpen">
                  <i class="fas fa-handshake w-5"></i>
                  <span class="ml-3">Partners</span>
                </router-link>
              </div>
            </div>
          </nav>
          
          <!-- Footer Links -->
          <div class="px-4 py-6 border-t bg-gray-50">
            <div class="space-y-4">
              <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4">Legal</h3>
              <div class="space-y-1">
                <router-link to="/terms"
                            class="flex items-center px-4 py-2 text-sm text-gray-600 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900"
                            :class="{ 'text-orange-500 font-medium': $route.path === '/terms' }"
                            @click="isSidebarOpen = !isSidebarOpen">
                  <i class="fas fa-file-contract w-5"></i>
                  <span class="ml-3">Terms of Service</span>
                </router-link>
                <router-link to="/privacy"
                            class="flex items-center px-4 py-2 text-sm text-gray-600 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900"
                            :class="{ 'text-orange-500 font-medium': $route.path === '/privacy' }"
                            @click="isSidebarOpen = !isSidebarOpen">
                  <i class="fas fa-shield-alt w-5"></i>
                  <span class="ml-3">Privacy Policy</span>
                </router-link>
                <router-link to="/shipping"
                            class="flex items-center px-4 py-2 text-sm text-gray-600 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900"
                            :class="{ 'text-orange-500 font-medium': $route.path === '/shipping' }"
                            @click="isSidebarOpen = !isSidebarOpen">
                  <i class="fas fa-truck w-5"></i>
                  <span class="ml-3">Shipping Policy</span>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black bg-opacity-0"></div>
    </div>
    <!-- Header -->
    <header class="sticky top-0 z-50 bg-white shadow-sm">
      <div class="container mx-auto px-4 h-16 flex items-center justify-between">
        <!-- Logo -->
        <div class="flex items-center">
          <router-link to="/">
            <img :src="headerLogo" alt="Logo" class="h-10">
          </router-link>
          <button
            class="ml-4 lg:hidden text-gray-600 hover:text-gray-900"
            @click="isSidebarOpen = !isSidebarOpen"
          >
            <i class="fas fa-bars text-xl"></i>
          </button>
        </div>

        <!-- Desktop Navigation -->
        <nav class="hidden lg:flex items-center space-x-6">
          <router-link
            v-for="item in navigationItems"
            :key="item.path"
            :to="item.path"
            class="text-gray-600 hover:text-orange-500 transition-colors"
            :class="{ 'text-orange-500': $route.path === item.path }"
          >
            {{ item.name }}
          </router-link>
        </nav>
        <!-- Auth Actions -->
        <div class="flex items-center space-x-4">
          <!-- Cart Icon (Visible for All) -->
          <router-link 
            to="/cart" 
            class="relative hidden lg:inline-block text-gray-600 hover:text-orange-500"
          >
            <i class="fas fa-shopping-cart"></i>
            <span 
              v-if="cartStore.itemCount > 0" 
              class="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center"
            >
              {{ cartStore.itemCount }}
            </span>
          </router-link>

          <template v-if="auth.isAuthenticated">
            <div class="relative group">
              <button class="flex items-center space-x-2 text-gray-600 hover:text-orange-500">
                <i class="fas fa-user"></i>
                <span>{{ auth.user?.name || 'Account' }}</span>
              </button>
              <div class="absolute right-0 mt-2 w-48 py-2 bg-white rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <router-link
                  to="/profile"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Profile
                </router-link>
                <button 
                  @click="handleLogout"
                  class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            </div>
          </template>
          <template v-else>
            <router-link
              to="/login"
              class="text-orange-600 hover:text-orange-700 px-4 py-2 rounded-md hover:bg-orange-50 transition-colors flex items-center space-x-2"
            >
              <i class="fas fa-sign-in-alt"></i>
              <span>Login</span>
            </router-link>
            <router-link
              to="/register"
              class="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors flex items-center space-x-2"
            >
              <i class="fas fa-user-plus"></i>
              <span>Register</span>
            </router-link>
          </template>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="pb-16 md:pb-24">
      <slot></slot>
    </main>

    <!-- Mobile Footer -->
    <MobileFooter class="md:hidden" />
    
    <!-- Desktop Footer -->
    <Footer class="hidden md:block mt-8" />
  </div>

</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '../stores/notification'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'
import headerLogo from '../assets/header-logo.jpg'
import MobileFooter from './MobileFooter.vue'
import Footer from './Footer.vue'

const notification = useNotificationStore()
const cartStore = useCartStore()
const auth = useAuthStore()
const router = useRouter()
const isSidebarOpen = ref(false)

const navigationItems = [
  { path: '/', name: 'Home' },
  { path: '/category', name: 'Category' },
  { path: '/orders', name: 'Orders' },
  { path: '/track-order', name: 'Track Order' },
  { path: '/contact', name: 'Contact' },
  { path: '/help', name: 'Help' }
]

const handleLogout = async () => {
  try {
    await auth.logout()
    notification.showToast('Successfully logged out', 'success')
    router.push('/')
  } catch (error) {
    notification.showToast('Failed to logout', 'error')
  }
}

</script>

<style>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
