<template>
  <div class="navbar-container">
    <!-- Top Bar -->
    <div class="bg-gray-100 border-b">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center h-10 text-sm">
          <div class="flex items-center space-x-4">
            <a href="tel:+97517914444" class="text-gray-600 hover:text-blue-600 flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              +975 17914444
            </a>
            <a href="mailto:indob2bt@gmail.com" class="text-gray-600 hover:text-blue-600 hidden sm:flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              indob2bt@gmail.com
            </a>
          </div>
          <div class="flex items-center space-x-4">
            <router-link to="/track-order" class="text-gray-600 hover:text-blue-600">Track Order</router-link>
            <router-link to="/help" class="text-gray-600 hover:text-blue-600 hidden sm:block">Help Center</router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Navigation -->
    <nav class="bg-white shadow-lg sticky top-0 z-50">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center h-20">
          <!-- Logo -->
          <div class="flex items-center space-x-4">
            <!-- Category Menu Button -->
            <button 
              @click="toggleCategoryMenu"
              class="flex items-center space-x-1 text-gray-700 hover:text-blue-600 font-medium py-2 px-4 rounded-lg hover:bg-gray-100"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span class="hidden sm:inline">Categories</span>
            </button>
            
            <router-link to="/" class="flex items-center">
              <img 
                src="../assets/header-logo.jpg" 
                alt="IndoB2BT Logo" 
                class="h-12 w-auto object-contain"
              >
            </router-link>
          </div>

          <!-- Search Bar -->
          <div class="hidden md:flex flex-1 max-w-2xl mx-8">
            <div class="relative w-full">
              <input 
                type="text" 
                placeholder="Search for products..."
                class="w-full pl-12 pr-4 py-3 rounded-full border-2 border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
              <div class="absolute left-4 top-3.5 text-gray-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Right Menu -->
          <div class="flex items-center space-x-6">
            <!-- Wishlist -->
            <router-link to="/wishlist" class="hidden sm:flex items-center text-gray-700 hover:text-blue-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span class="ml-1">Wishlist</span>
            </router-link>

            <!-- User Menu -->
            <div class="relative">
              <button 
                @click="toggleAccountMenu"
                class="flex items-center text-gray-700 hover:text-blue-600"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span class="ml-1 hidden sm:block">Account</span>
              </button>
              <div 
                v-show="isAccountMenuOpen"
                class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2"
              >
                <router-link 
                  to="/login" 
                  class="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  @click="isAccountMenuOpen = false"
                >
                  Sign In
                </router-link>
                <router-link 
                  to="/register" 
                  class="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  @click="isAccountMenuOpen = false"
                >
                  Register
                </router-link>
                <hr class="my-2">
                <router-link 
                  to="/orders" 
                  class="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  @click="isAccountMenuOpen = false"
                >
                  My Orders
                </router-link>
                <router-link 
                  to="/profile" 
                  class="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  @click="isAccountMenuOpen = false"
                >
                  Profile
                </router-link>
              </div>
            </div>

            <!-- Cart -->
            <router-link to="/cart" class="flex items-center text-gray-700 hover:text-blue-600">
              <div class="relative inline-flex">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <div 
                  v-if="cartItemCount > 0"
                  class="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center bg-blue-600 text-white text-xs font-bold rounded-full"
                  style="transform: translate(25%, -25%);"
                >
                  {{ cartItemCount }}
                </div>
              </div>
              <span class="ml-2 hidden sm:inline">Cart</span>
            </router-link>

            <!-- Mobile Menu Button -->
            <button 
              @click="toggleMobileMenu"
              class="lg:hidden text-gray-700 hover:text-blue-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path v-if="!isMobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div 
        v-show="isMobileMenuOpen" 
        class="lg:hidden fixed inset-0 z-50 overflow-hidden"
        @click="toggleMobileMenu"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black bg-opacity-50"></div>
        
        <!-- Menu Content -->
        <div 
          class="absolute inset-y-0 right-0 max-w-xs w-full bg-white shadow-xl"
          @click.stop
        >
          <div class="h-full flex flex-col">
            <!-- Close Button -->
            <div class="px-4 py-4 border-b flex justify-end">
              <button 
                @click="toggleMobileMenu"
                class="p-2 rounded-lg hover:bg-gray-100"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Mobile Menu Items -->
            <div class="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
              <!-- Search -->
              <div class="relative">
                <input 
                  type="text" 
                  placeholder="Search for products..."
                  class="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                >
                <div class="absolute left-4 top-3.5 text-gray-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              <!-- Navigation Links -->
              <nav class="space-y-2">
                <router-link 
                  to="/" 
                  class="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
                  @click="toggleMobileMenu"
                >
                  Home
                </router-link>
                <router-link 
                  to="/wishlist" 
                  class="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
                  @click="toggleMobileMenu"
                >
                  Wishlist
                </router-link>
                <router-link 
                  to="/contact" 
                  class="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
                  @click="toggleMobileMenu"
                >
                  Contact
                </router-link>
              </nav>
              <div class="border-t pt-6">
                <router-link
                  to="/cart"
                  class="flex items-center justify-between py-2.5 px-4 rounded-lg hover:bg-blue-50 hover:text-blue-600"
                  @click="toggleMobileMenu"
                >
                  <span class="flex items-center">
                    <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Cart
                  </span>
                  <span v-if="cartItemCount > 0" class="bg-blue-600 text-white px-2 py-1 rounded-full text-xs">
                    {{ cartItemCount }}
                  </span>
                </router-link>
              </div>
               <!-- Legal Links -->
               <div class="border-t pt-6">
                <div class="space-y-2">
                  <router-link 
                    to="/terms" 
                    class="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
                    @click="toggleMobileMenu"
                  >
                    Terms & Conditions
                  </router-link>
                  <router-link 
                    to="/privacy" 
                    class="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
                    @click="toggleMobileMenu"
                  >
                    Privacy Policy
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Category Menu -->
      <div 
        v-show="isCategoryMenuOpen"
        class="absolute left-0 right-0 top-full bg-white shadow-lg border-t z-40"
      >
        <div class="container mx-auto px-4 py-6">
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div v-for="category in categories" :key="category.id" class="space-y-4">
              <h3 class="font-medium text-gray-900">{{ category.name }}</h3>
              <ul class="space-y-2">
                <li v-for="subcategory in category.subcategories" :key="subcategory.id">
                  <router-link 
                    :to="{ path: '/category', query: { id: subcategory.id }}"
                    class="text-gray-600 hover:text-blue-600"
                    @click="isCategoryMenuOpen = false"
                  >
                    {{ subcategory.name }}
                  </router-link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { useCartStore } from '../stores/cart';
import { useRoute } from 'vue-router';

const cartStore = useCartStore();
const route = useRoute();

const isMobileMenuOpen = ref(false);
const isAccountMenuOpen = ref(false);
const isCategoryMenuOpen = ref(false);

const cartItemCount = computed(() => {
  return cartStore.totalItems;
});

// Define categories with icons and subcategories
const categories = ref([
  {
    id: 1,
    name: 'Electronics',
    path: '/category/electronics',
    subcategories: [
      { id: 1, name: 'Smartphones' },
      { id: 2, name: 'Laptops' },
      { id: 3, name: 'Tablets' },
    ]
  },
  {
    id: 2,
    name: 'Fashion',
    path: '/category/fashion',
    subcategories: [
      { id: 1, name: "Men's Clothing" },
      { id: 2, name: "Women's Clothing" },
      { id: 3, name: "Kids' Clothing" },
    ]
  },
  {
    id: 3,
    name: 'Home & Living',
    path: '/category/home-living',
    subcategories: [
      { id: 1, name: 'Furniture' },
      { id: 2, name: 'Home Decor' },
      { id: 3, name: 'Kitchenware' },
    ]
  },
  {
    id: 4,
    name: 'Beauty',
    path: '/category/beauty',
    subcategories: [
      { id: 1, name: 'Skincare' },
      { id: 2, name: 'Haircare' },
      { id: 3, name: 'Makeup' },
    ]
  },
  {
    id: 5,
    name: 'Sports & Outdoor',
    path: '/category/sports-outdoor',
    subcategories: [
      { id: 1, name: 'Fitness' },
      { id: 2, name: 'Team Sports' },
      { id: 3, name: 'Outdoor Gear' },
    ]
  }
]);

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
  if (isMobileMenuOpen.value) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
};

const toggleAccountMenu = () => {
  isAccountMenuOpen.value = !isAccountMenuOpen.value;
  isCategoryMenuOpen.value = false;
};

const toggleCategoryMenu = () => {
  isCategoryMenuOpen.value = !isCategoryMenuOpen.value;
  isAccountMenuOpen.value = false;
};

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  const accountMenu = document.querySelector('.account-menu');
  const categoryMenu = document.querySelector('.category-menu');
  
  if (accountMenu && !accountMenu.contains(target)) {
    isAccountMenuOpen.value = false;
  }
  
  if (categoryMenu && !categoryMenu.contains(target)) {
    isCategoryMenuOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Close menus when route changes
watch(route, () => {
  isMobileMenuOpen.value = false;
  isAccountMenuOpen.value = false;
  isCategoryMenuOpen.value = false;
  document.body.style.overflow = '';
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>