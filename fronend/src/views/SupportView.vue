<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 text-gray-800">Customer Support</h1>
    
    <div class="grid md:grid-cols-2 gap-8">
      <div class="bg-white shadow-md rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4">Contact Us</h2>
        <p class="text-gray-600 mb-4">We're here to help! Reach out to us through any of the following methods:</p>
        
        <div class="space-y-4">
          <div>
            <h3 class="font-medium text-gray-700">Email Support</h3>
            <p class="text-gray-500">support@indob2c.com</p>
          </div>
          
          <div>
            <h3 class="font-medium text-gray-700">Phone Support</h3>
            <p class="text-gray-500">+880 1234-567890</p>
          </div>
          
          <div>
            <h3 class="font-medium text-gray-700">Live Chat</h3>
            <p class="text-gray-500">Available Monday-Friday, 9am-5pm</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white shadow-md rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
        <ul class="space-y-3">
          <li>
            <details class="border-b pb-2">
              <summary class="cursor-pointer font-medium text-gray-700">How do I track my order?</summary>
              <p class="text-gray-500 mt-2">You can track your order by logging into your account and visiting the Orders section.</p>
            </details>
          </li>
          <li>
            <details class="border-b pb-2">
              <summary class="cursor-pointer font-medium text-gray-700">What is your return policy?</summary>
              <p class="text-gray-500 mt-2">We offer a 30-day return policy for most items. Please check our Returns page for detailed information.</p>
            </details>
          </li>
          <li>
            <details class="border-b pb-2">
              <summary class="cursor-pointer font-medium text-gray-700">How can I change my order?</summary>
              <p class="text-gray-500 mt-2">Contact our support team within 2 hours of placing the order to make changes.</p>
            </details>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Future support logic can be added here
</script>

<style scoped>
details summary::-webkit-details-marker {
  display: none;
}
details summary::marker {
  display: none;
}
details summary {
  list-style: none;
}
</style>
