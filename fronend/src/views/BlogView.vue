<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8 text-center text-gray-800">Our Blog</h1>
    
    <div class="grid md:grid-cols-3 gap-6">
      <article 
        v-for="post in blogPosts" 
        :key="post.id" 
        class="bg-white shadow-md rounded-lg overflow-hidden transition-transform hover:scale-105"
      >
        <img 
          :src="post.imageUrl" 
          :alt="post.title" 
          class="w-full h-48 object-cover"
        >
        <div class="p-6">
          <h2 class="text-xl font-semibold mb-3 text-gray-800">{{ post.title }}</h2>
          <p class="text-gray-600 mb-4">{{ post.excerpt }}</p>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-500">{{ post.date }}</span>
            <router-link 
              :to="`/blog/${post.id}`" 
              class="text-orange-500 hover:text-orange-600 font-medium"
            >
              Read More
            </router-link>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  imageUrl: string;
  date: string;
}

const blogPosts = ref<BlogPost[]>([
  {
    id: 1,
    title: 'Top E-commerce Trends in 2024',
    excerpt: 'Discover the latest trends shaping the e-commerce landscape this year.',
    imageUrl: 'https://via.placeholder.com/400x300?text=E-commerce+Trends',
    date: 'January 15, 2024'
  },
  {
    id: 2,
    title: 'Sustainable Shopping: Our Commitment',
    excerpt: 'Learn how we are making our business more environmentally friendly.',
    imageUrl: 'https://via.placeholder.com/400x300?text=Sustainable+Shopping',
    date: 'February 1, 2024'
  },
  {
    id: 3,
    title: 'Customer Success Stories',
    excerpt: 'Real stories from our customers and their amazing experiences.',
    imageUrl: 'https://via.placeholder.com/400x300?text=Customer+Stories',
    date: 'March 10, 2024'
  }
])

onMounted(() => {
  // Future: Fetch blog posts from an API
})
</script>

<style scoped>
article {
  transition: transform 0.3s ease;
}
</style>
