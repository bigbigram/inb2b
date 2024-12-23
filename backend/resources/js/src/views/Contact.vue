<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <LoadingBar :show="isLoading" />
    <Toast v-if="toast" :message="toast.message" :type="toast.type" />
    <div class="bg-gradient-to-b from-orange-50 to-white py-12 pb-16 md:pb-12">
      <div class="max-w-4xl mx-auto px-4">
        <!-- Hero Section -->
        <div class="text-center mb-12">
          <h1 class="text-4xl font-extrabold text-orange-600">Contact Us</h1>
          <p class="text-lg text-gray-600 mt-4">We're here to help and answer any question you might have. We look forward to hearing from you.</p>
        </div>
        <!-- Contact Content -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <!-- Contact Information -->
          <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-2xl font-semibold mb-6">Contact Information</h2>
            <div class="space-y-6">
              <div class="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-orange-600 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <h3 class="font-medium text-lg">Address</h3>
                  <p class="text-gray-600">Indo Venture Pvt. Ltd.<br>Wangchang, Paro, Bhutan</p>
                </div>
              </div>
              <div class="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-orange-600 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <h3 class="font-medium text-lg">Email</h3>
                  <p class="text-gray-600">indob2bt@gmail.com</p>
                </div>
              </div>
              <div class="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-orange-600 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <h3 class="font-medium text-lg">Phone</h3>
                  <p class="text-gray-600">+975-17914444</p>
                </div>
              </div>
              <div class="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-orange-600 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6.5 12a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-5.197-5.197" />
                </svg>
                <div>
                  <h3 class="font-medium text-lg">Social Media</h3>
                  <div class="flex space-x-3 mt-1">
                    <a href="#" class="text-orange-600 hover:text-orange-800">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22.675 0h-21.35c-.733 0-1.325.592-1.325 1.325v21.351c0 .732.592 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.312h3.587l-.467 3.622h-3.12v9.293h6.116c.732 0 1.324-.592 1.324-1.324v-21.35c0-.733-.592-1.325-1.324-1.325z" />
                      </svg>
                    </a>
                    <a href="#" class="text-orange-600 hover:text-orange-800">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.723-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-2.72 0-4.924 2.204-4.924 4.924 0 .386.043.762.127 1.124-4.092-.205-7.719-2.165-10.148-5.144-.424.729-.667 1.577-.667 2.482 0 1.71.87 3.213 2.192 4.096-.807-.026-1.566-.248-2.228-.616v.062c0 2.388 1.698 4.384 3.946 4.835-.414.112-.849.172-1.296.172-.318 0-.626-.031-.928-.088.627 1.956 2.444 3.379 4.597 3.419-1.684 1.32-3.809 2.107-6.115 2.107-.397 0-.788-.023-1.175-.068 2.179 1.397 4.768 2.211 7.548 2.211 9.055 0 14.009-7.503 14.009-14.009 0-.213-.005-.426-.015-.637.961-.694 1.797-1.56 2.457-2.548l-.047-.02z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact Form -->
          <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-2xl font-semibold mb-6">Send us a Message</h2>
            <form @submit.prevent="handleSubmit" class="space-y-4">
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  id="name"
                  v-model="formData.name"
                  :class="{'border-red-500': errors.name}"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  required
                />
                <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
              </div>

              <div>
                <label for="email" class="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  id="email"
                  v-model="formData.email"
                  :class="{'border-red-500': errors.email}"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  required
                />
                <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
              </div>

              <div>
                <label for="subject" class="block text-sm font-medium text-gray-700">Subject</label>
                <input
                  type="text"
                  id="subject"
                  v-model="formData.subject"
                  :class="{'border-red-500': errors.subject}"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  required
                />
                <p v-if="errors.subject" class="mt-1 text-sm text-red-600">{{ errors.subject }}</p>
              </div>

              <div>
                <label for="message" class="block text-sm font-medium text-gray-700">Message</label>
                <textarea
                  id="message"
                  v-model="formData.message"
                  :class="{'border-red-500': errors.message}"
                  rows="4"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  required
                ></textarea>
                <p v-if="errors.message" class="mt-1 text-sm text-red-600">{{ errors.message }}</p>
              </div>

              <div class="flex items-center justify-end">
                <button
                  type="submit"
                  :disabled="isLoading"
                  class="inline-flex justify-center rounded-md border border-transparent bg-orange-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {{ isLoading ? 'Sending...' : 'Send Message' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import LoadingBar from '../components/LoadingBar.vue'
import Toast from '../components/Toast.vue'
import emailjs from '@emailjs/browser'

// Your EmailJS configuration - Make sure these values match exactly what's in your EmailJS dashboard
const EMAILJS_SERVICE_ID = 'service_zjoon4z'  // Verify this ID in your EmailJS dashboard
const EMAILJS_TEMPLATE_ID = 'template_bq3wlbs'
const EMAILJS_PUBLIC_KEY = '8tMx0xQV4yr3epj-a'

// Initialize EmailJS
onMounted(() => {
  try {
    emailjs.init(EMAILJS_PUBLIC_KEY)
    console.log('EmailJS initialized successfully')
  } catch (error) {
    console.error('EmailJS initialization error:', error)
  }
})

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const isLoading = ref(false)
const toast = ref<{ message: string; type: 'success' | 'error' } | null>(null)

const showToast = (message: string, type: 'success' | 'error') => {
  toast.value = { message, type }
  setTimeout(() => {
    toast.value = null
  }, 3000)
}

const formData = ref<FormData>({
  name: '',
  email: '',
  subject: '',
  message: ''
})

const errors = ref<FormErrors>({})

const validateForm = (): boolean => {
  errors.value = {}
  let isValid = true

  if (!formData.value.name) {
    errors.value.name = 'Name is required'
    isValid = false
  }

  if (!formData.value.email) {
    errors.value.email = 'Email is required'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    errors.value.email = 'Please enter a valid email address'
    isValid = false
  }

  if (!formData.value.subject) {
    errors.value.subject = 'Subject is required'
    isValid = false
  }

  if (!formData.value.message) {
    errors.value.message = 'Message is required'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isLoading.value = true
  
  try {
    // Log the configuration being used
    console.log('Attempting to send email with:', {
      serviceId: EMAILJS_SERVICE_ID,
      templateId: EMAILJS_TEMPLATE_ID,
      publicKey: EMAILJS_PUBLIC_KEY.substring(0, 5) + '...' // Log only part of the key for security
    })

    const templateParams = {
      from_name: formData.value.name,
      from_email: formData.value.email,
      subject: formData.value.subject,
      message: formData.value.message,
      to_name: 'Indo Venture',
      reply_to: formData.value.email
    }

    console.log('Sending email with parameters:', templateParams)

    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    )

    console.log('Email sent successfully:', result)
    showToast('Message sent successfully!', 'success')
    // Reset form
    formData.value = {
      name: '',
      email: '',
      subject: '',
      message: ''
    }
  } catch (error: any) {
    console.error('Email error details:', {
      message: error.message,
      status: error.status,
      text: error.text
    })
    showToast(error.text || 'Failed to send message. Please try again.', 'error')
  } finally {
    isLoading.value = false
  }
}
</script>