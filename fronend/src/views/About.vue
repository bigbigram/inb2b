<template>
  <div class="bg-white pb-16 md:pb-0">
    <!-- Hero Section -->
    <div class="relative bg-gradient-to-r from-orange-600 to-purple-600 text-white">
      <div class="absolute inset-0 bg-black opacity-50"></div>
      <div class="relative container mx-auto px-4 py-24">
        <div class="max-w-3xl mx-auto text-center">
          <h1 class="text-4xl md:text-5xl font-bold mb-6">About IndoB2B</h1>
          <p class="text-xl text-gray-200">Connecting Businesses Across Borders</p>
        </div>
      </div>
    </div>

    <!-- Our Story Section -->
    <div class="py-16 bg-gray-50">
      <div class="container mx-auto px-4">
        <div class="max-w-3xl mx-auto">
          <h2 class="text-3xl font-bold text-center mb-8">Our Story</h2>
          <div class="prose prose-lg mx-auto text-gray-600">
            <p class="mb-6">
              Founded in 2023, IndoB2B emerged from a vision to revolutionize cross-border trade between India and Bhutan. 
              We recognized the untapped potential in connecting businesses across these two vibrant economies.
            </p>
            <p class="mb-6">
              Today, we’re proud to serve as a bridge between thousands of businesses, facilitating seamless trade 
              and fostering economic growth in both nations.
            </p>
            <p>
              Our platform leverages cutting-edge technology to provide:
            </p>
            <ul class="list-disc pl-6 mb-6">
              <li>Secure and efficient B2B transactions</li>
              <li>Real-time inventory management</li>
              <li>Automated customs documentation</li>
              <li>Integrated logistics solutions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Mission & Values -->
    <div class="py-16">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div>
            <h3 class="text-2xl font-bold mb-6">Our Mission</h3>
            <p class="text-gray-600 mb-4">
              To create a seamless digital marketplace that empowers businesses in India and Bhutan to grow, 
              connect, and thrive in the global economy.
            </p>
            <ul class="space-y-4">
              <li v-for="(mission, index) in missions" :key="index" class="flex items-start">
                <svg class="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-gray-600">{{ mission }}</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 class="text-2xl font-bold mb-6">Our Values</h3>
            <div class="grid grid-cols-2 gap-6">
              <div v-for="(value, index) in values" :key="index" 
                   class="p-6 bg-gray-50 rounded-lg transform hover:scale-105 transition-transform duration-300">
                <h4 class="font-semibold mb-2">{{ value.title }}</h4>
                <p class="text-gray-600">{{ value.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="bg-orange-600 text-white py-16">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto text-center">
          <div v-for="(stat, index) in stats" :key="index" 
               class="transform hover:scale-110 transition-transform duration-300">
            <div class="text-4xl font-bold mb-2">{{ stat.value }}</div>
            <div class="text-orange-200">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Team Section -->
    <div class="py-16">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12">Our Leadership Team</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div v-for="(member, index) in team" :key="index" 
               class="text-center group">
            <div class="relative mb-4 mx-auto w-48 h-48 rounded-full overflow-hidden transform group-hover:scale-105 transition-transform duration-300">
              <img :src="member.image" :alt="member.name" class="w-full h-full object-cover">
              <div class="absolute inset-0 bg-orange-600 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
            </div>
            <h3 class="text-xl font-semibold mb-2">{{ member.name }}</h3>
            <p class="text-gray-600 mb-2">{{ member.position }}</p>
            <div class="flex justify-center space-x-4">
              <a v-for="(social, sIndex) in member.socials" :key="sIndex"
                 :href="social.link" 
                 class="text-gray-400 hover:text-orange-600 transition-colors duration-300"
                 target="_blank"
                 rel="noopener noreferrer">
                <i :class="social.icon" class="fab"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const missions = [
  'Facilitating cross-border trade',
  'Supporting small and medium enterprises',
  'Promoting digital innovation',
  'Ensuring sustainable business practices'
]

const values = [
  { title: 'Trust', description: 'Building reliable partnerships through transparency' },
  { title: 'Innovation', description: 'Embracing technology to solve challenges' },
  { title: 'Quality', description: 'Maintaining high standards in all operations' },
  { title: 'Community', description: 'Supporting local business growth' }
]

const stats = [
  { value: '5000+', label: 'Active Users' },
  { value: '2', label: 'Countries' },
  { value: '10K+', label: 'Products' },
  { value: '₹100M+', label: 'Monthly GMV' }
]

const team = [
  {
    name: 'Rajesh Kumar',
    position: 'Chief Executive Officer',
    image: 'https://images.unsplash.com/photo-1556157382-97eda2f9e2bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    socials: [
      { icon: 'fa-linkedin', link: '#' },
      { icon: 'fa-twitter', link: '#' }
    ]
  },
  {
    name: 'Tshering Dorji',
    position: 'Chief Operations Officer',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    socials: [
      { icon: 'fa-linkedin', link: '#' },
      { icon: 'fa-twitter', link: '#' }
    ]
  },
  {
    name: 'Priya Sharma',
    position: 'Chief Technology Officer',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    socials: [
      { icon: 'fa-linkedin', link: '#' },
      { icon: 'fa-github', link: '#' }
    ]
  }
]
</script>

<style scoped>
.prose {
  max-width: 65ch;
}
</style>