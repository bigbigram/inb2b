<template>
  <section class="categories-section">
    <div class="container-fluid">
      <!-- Loading State -->
      <div v-if="loading" class="categories-grid">
        <div v-for="n in (limit || 8)" :key="n" class="category-skeleton">
          <div class="image-skeleton"></div>
          <div class="text-skeleton"></div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-container">
        <p class="error-text">{{ error }}</p>
        <button @click="loadCategories" class="retry-button">
          <i class="fas fa-redo mr-2"></i>
          Retry
        </button>
      </div>

      <!-- Categories Grid -->
      <div v-else ref="containerRef" class="categories-wrapper">
        <div class="categories-container">
          <div class="categories-grid">
            <div v-for="category in visibleCategories" 
                 :key="category.id" 
                 class="category-card"
                 :class="{ 'fade-in-up': isVisible(category.id) }"
                 ref="categoryRefs"
                 @click="navigateToCategory(category)">
              <div class="category-content">
                <div class="image-wrapper">
                  <img 
                    :src="category.cate_image" 
                    :alt="category.cate_name"
                    loading="lazy"
                    class="category-image"
                    @error="handleImageError"
                  >
                </div>
                <h3 class="category-title">{{ category.cate_name }}</h3>
              </div>
            </div>
          </div>

          <!-- Load More -->
          <div v-if="hasMoreItems" 
               ref="loadMoreTrigger" 
               class="load-more">
            <div class="loader"></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { getCategories } from '../api/categories'
import type { Category } from '../types/category'
import { useIntersectionObserver } from '@vueuse/core'

interface Props {
  limit?: number
}

const props = withDefaults(defineProps<Props>(), {
  limit: undefined
})

const router = useRouter()
const categories = ref<Category[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const categoryRefs = ref<HTMLElement[]>([])
const visibleItems = ref(new Set<number>())
const loadMoreTrigger = ref<HTMLElement | null>(null)

// Virtual scrolling state
const itemsPerPage = 12
const currentPage = ref(1)

const visibleCategories = computed(() => {
  const start = 0
  const end = currentPage.value * itemsPerPage
  return props.limit 
    ? categories.value.slice(0, props.limit)
    : categories.value.slice(start, end)
})

const hasMoreItems = computed(() => {
  if (props.limit) return false
  return currentPage.value * itemsPerPage < categories.value.length
})

const loadMoreItems = () => {
  if (currentPage.value * itemsPerPage < categories.value.length) {
    currentPage.value++
  }
}

const loadCategories = async () => {
  try {
    loading.value = true
    error.value = null
    categories.value = await getCategories()
  } catch (err) {
    error.value = 'Failed to load categories. Please try again.'
    console.error('Error loading categories:', err)
  } finally {
    loading.value = false
  }
}

const navigateToCategory = (category: Category) => {
  router.push({
    name: 'category',
    query: { cate_id: category.id }
  })
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/placeholder-image.jpg'
}

const isVisible = (id: number) => visibleItems.value.has(id)

const setupObservers = () => {
  const observers: (() => void)[] = []

  categoryRefs.value.forEach((el, index) => {
    if (!el) return

    const { stop } = useIntersectionObserver(
      el,
      ([{ isIntersecting }]) => {
        if (isIntersecting && categories.value[index]) {
          visibleItems.value.add(categories.value[index].id)
        }
      },
      { threshold: 0.2 }
    )

    observers.push(stop)
  })

  if (loadMoreTrigger.value) {
    const { stop } = useIntersectionObserver(
      loadMoreTrigger.value,
      ([{ isIntersecting }]) => {
        if (isIntersecting && hasMoreItems.value) {
          loadMoreItems()
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '100px'
      }
    )

    observers.push(stop)
  }

  return observers
}

let observers: (() => void)[] = []

onMounted(async () => {
  await loadCategories()
  
  // Wait for DOM update before setting up observers
  await nextTick()
  observers = setupObservers()
})

onUnmounted(() => {
  observers.forEach(stop => stop())
})
</script>

<style scoped>
.categories-section {
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  background: #f8fafc;
  padding: 2rem 0;
  overflow-x: hidden;
}

.categories-container {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  width: 100%;
}

@media (min-width: 640px) {
  .categories-container {
    padding: 0 1.5rem;
  }
  .categories-grid {
    gap: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .categories-container {
    padding: 0 2rem;
  }
  .categories-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}

@media (min-width: 1280px) {
  .categories-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

.category-card {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease-out;
}

.category-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.image-wrapper {
  width: 100%;
  aspect-ratio: 1/1;
  border-radius: 50%;
  overflow: hidden;
  background-color: #f8fafc;
}

.category-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-title {
  font-size: 1rem;
  font-weight: bold;
  color: #333;
  text-align: center;
}

/* Loading Skeletons */
.category-skeleton {
  background-color: #fff;
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.image-skeleton {
  width: 100%;
  aspect-ratio: 1/1;
  border-radius: 50%;
  background-color: #f8fafc;
}

.text-skeleton {
  width: 50%;
  height: 1rem;
  background-color: #f8fafc;
}

/* Error State */
.error-container {
  text-align: center;
  padding: 2rem;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.error-text {
  color: #f44336;
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.retry-button {
  background-color: #4CAF50;
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-weight: bold;
  border-radius: 5px;
  cursor: pointer;
}

.retry-button:hover {
  background-color: #3e8e41;
}

/* Load More */
.load-more {
  padding: 2rem;
  text-align: center;
}

.loader {
  width: 2rem;
  height: 2rem;
  border: 4px solid #f8fafc;
  border-top: 4px solid #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.fade-in-up {
  animation: fadeInUp 0.5s ease-out forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
