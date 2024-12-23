<template>
  <div class="categories-view bg-gray-50 min-h-screen">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <h1 class="text-2xl font-semibold text-gray-900">Categories</h1>
        <input 
          v-model="searchQuery"
          type="search"
          class="mt-4 w-full p-2 pl-10 text-sm text-gray-700 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-600"
          placeholder="Search categories..."
        />
        <p class="text-sm text-gray-500 mt-2">{{ searchStats }}</p>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        <div v-for="n in 8" :key="n" class="animate-pulse">
          <div class="aspect-square bg-gray-200 rounded-2xl"></div>
          <div class="h-4 bg-gray-200 rounded mt-3 w-2/3"></div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="rounded-xl bg-white p-6 max-w-lg mx-auto">
          <div class="text-red-500 mb-4">
            <svg class="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p class="text-gray-600 mb-4">{{ error }}</p>
          <button 
            @click="loadCategories"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Try Again
          </button>
        </div>
      </div>

      <!-- Categories Grid -->
      <div 
        v-else 
        class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        <div 
          v-for="category in filteredCategories"
          :key="category.cate_id"
          class="group cursor-pointer relative"
          @click="navigateToCategory(category.cate_id)"
        >
          <!-- Loading Overlay -->
          <div 
            v-if="navigatingCategoryId === category.cate_id"
            class="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center"
          >
            <div class="animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
          </div>

          <div class="category-card bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
            <!-- Image Container -->
            <div class="aspect-square relative overflow-hidden">
              <img 
                :src="category.image_url || category.cate_image" 
                :alt="category.cate_name"
                class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                @error="handleImageError"
              >
              <!-- Gradient Overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            
            <!-- Category Name -->
            <div class="p-4">
              <h2 class="text-sm sm:text-base font-medium text-gray-900 group-hover:text-primary-600 transition-colors duration-300">
                {{ category.cate_name }}
              </h2>
              <div class="mt-1 text-xs sm:text-sm text-gray-500">
                View Products →
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import { getCategories } from '../api/products';
import type { Category } from '../types/product';

const router = useRouter();
const categories = ref<Category[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const navigatingCategoryId = ref<string | null>(null);
const searchQuery = ref('');
const debouncedSearchQuery = ref('');
let searchDebounceTimer: NodeJS.Timeout;

// Debounced search
watch(searchQuery, (newValue) => {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    debouncedSearchQuery.value = newValue;
  }, 300);
});

// Search functionality with debounce
const filteredCategories = computed(() => {
  if (!debouncedSearchQuery.value) return categories.value;
  
  const query = debouncedSearchQuery.value.toLowerCase();
  return categories.value.filter(category => 
    category.cate_name.toLowerCase().includes(query)
  );
});

// Search stats
const searchStats = computed(() => {
  if (!debouncedSearchQuery.value) return '';
  return `Found ${filteredCategories.value.length} of ${categories.value.length} categories`;
});

// Back navigation
const handleBackNavigation = (e: PopStateEvent) => {
  if (navigatingCategoryId.value) {
    e.preventDefault();
    navigatingCategoryId.value = null;
  }
};

onMounted(() => {
  loadCategories();
  window.addEventListener('popstate', handleBackNavigation);
});

onBeforeUnmount(() => {
  clearTimeout(searchDebounceTimer);
  window.removeEventListener('popstate', handleBackNavigation);
});

// Keep existing functions unchanged
const loadCategories = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const fetchedCategories = await getCategories();
    console.log('Fetched categories:', fetchedCategories);
    
    if (!fetchedCategories || fetchedCategories.length === 0) {
      error.value = 'No categories available';
      return;
    }
    
    categories.value = fetchedCategories;
  } catch (err) {
    console.error('Error loading categories:', err);
    error.value = 'Failed to load categories. Please try again.';
  } finally {
    loading.value = false;
  }
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = '/placeholder-category.jpg';
};

const navigateToCategory = async (categoryId: string) => {
  console.log('Raw category ID:', categoryId);
  
  // Ensure we have a valid category ID
  if (!categoryId || categoryId === 'undefined' || categoryId === 'null') {
    console.error('Invalid category ID:', categoryId);
    error.value = 'Invalid category ID';
    return;
  }

  // Find the category to ensure it exists
  const category = categories.value.find(c => c.cate_id === categoryId);
  if (!category) {
    console.error('Category not found:', categoryId);
    error.value = 'Category not found';
    return;
  }

  console.log('Navigating to category:', { id: categoryId, name: category.cate_name });
  navigatingCategoryId.value = categoryId;
  
  try {
    await router.push({
      name: 'category',
      query: { cate_id: categoryId }
    });
  } catch (err) {
    console.error('Navigation error:', err);
    error.value = 'Failed to navigate to category. Please try again.';
  } finally {
    navigatingCategoryId.value = null;
  }
};
</script>

<style scoped>
/* Base card styles */
.category-card {
  position: relative;
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transform-origin: center;
  backface-visibility: hidden;
  will-change: transform, opacity, box-shadow;
}

/* Enhanced transitions */
.category-grid-move {
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.category-grid-enter-active {
  transition: 
    opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Hover animations */
.category-card .image-container {
  overflow: hidden;
}

.category-card img {
  transition: transform 0.5s ease-out;
}

.category-card:hover img {
  transform: scale(1.05);
}

.category-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 1rem;
  opacity: 0;
  transition: opacity 0.3s;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.category-card:hover::after {
  opacity: 1;
}

/* Loading animation */
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.animate-pulse {
  background: linear-gradient(
    90deg,
    #d3d3d3 25%,
    #f7f7f7 50%,
    #d3d3d3 75%
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

/* Responsive styles */
@media (max-width: 640px) {
  .category-card {
    transform: none !important;
  }
  
  .category-card:active::after {
    opacity: 1;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .category-grid-move,
  .category-grid-enter-active,
  .category-grid-leave-active,
  .category-card,
  .category-card img {
    transition: none !important;
    animation: none !important;
  }
}
</style>
