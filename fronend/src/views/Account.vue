<template>
  <div class="min-h-screen bg-gray-50 px-0 sm:px-4 py-4">
    <!-- Profile Header -->
    <div class="bg-white shadow rounded-lg mb-6 overflow-hidden">
      <div class="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div class="flex items-center mb-4 sm:mb-0">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold mr-4">
            {{ profile.name.charAt(0).toUpperCase() }}
          </div>
          <div>
            <h1 class="text-xl sm:text-2xl font-bold text-gray-900">{{ profile.name }}</h1>
            <p class="text-gray-600">{{ profile.email }}</p>
          </div>
        </div>
        <button 
          v-if="!isEditing"
          @click="isEditing = true" 
          class="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Profile
        </button>
      </div>

      <!-- Edit Form -->
      <div v-if="isEditing" class="border-t border-gray-200 p-4 sm:p-6">
        <form @submit.prevent="saveProfile" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input 
              v-model="editedProfile.name" 
              type="text" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              v-model="editedProfile.email" 
              type="email" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input 
              v-model="editedProfile.phone" 
              type="tel"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
          </div>
          <div class="flex space-x-3">
            <button 
              type="submit"
              class="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Save Changes
            </button>
            <button 
              type="button"
              @click="cancelEdit"
              class="flex-1 sm:flex-none px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Addresses Section -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div class="p-4 sm:p-6 border-b border-gray-200">
        <h2 class="text-xl font-bold text-gray-900">Shipping Addresses</h2>
      </div>
      <div class="p-4 sm:p-6">
        <div class="grid gap-4 sm:gap-6 sm:grid-cols-2">
          <div 
            v-for="address in addresses" 
            :key="address.id" 
            class="bg-gray-50 p-4 rounded-lg border border-gray-200 relative group"
          >
            <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button class="p-1 hover:bg-gray-200 rounded-full">
                <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            <div class="font-medium text-gray-900 mb-1">{{ address.label }}</div>
            <div class="text-gray-600 text-sm">
              {{ address.street }}<br>
              {{ address.city }}, {{ address.state }} {{ address.zip }}
            </div>
          </div>

          <!-- Add New Address Button -->
          <button 
            @click="addNewAddress"
            class="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors duration-200"
          >
            <svg class="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span class="text-gray-600">Add New Address</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const isEditing = ref(false)

const profile = reactive({
  name: 'Bigram Gurung',
  email: 'big@gmail.com',
  phone: '12345678'
})

const editedProfile = reactive({ ...profile })

const addresses = ref([
  {
    id: 1,
    label: 'Home',
    street: 'Paro',
    city: 'Paro',
    state: 'Paro',
    zip: '11001'
  }
])

const saveProfile = () => {
  Object.assign(profile, editedProfile)
  isEditing.value = false
  // TODO: Implement API call to save profile changes
}

const cancelEdit = () => {
  Object.assign(editedProfile, profile)
  isEditing.value = false
}

const addNewAddress = () => {
  // TODO: Implement add address functionality
}
</script>

<style scoped>
.min-h-screen {
  min-height: 100vh;
}

.bg-gray-50 {
  background-color: #f9fafb;
}

.px-0 {
  padding-left: 0;
  padding-right: 0;
}

.sm\:px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.py-4 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.bg-white {
  background-color: #ffffff;
}

.shadow {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.rounded-lg {
  border-radius: 0.5rem;
}

.overflow-hidden {
  overflow: hidden;
}

.mb-6 {
  margin-bottom: 1.5rem;
}

.p-4 {
  padding: 1rem;
}

.sm\:p-6 {
  padding: 1.5rem;
}

.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.sm\:flex-row {
  flex-direction: row;
}

.items-start {
  align-items: flex-start;
}

.sm\:items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.w-16 {
  width: 4rem;
}

.h-16 {
  height: 4rem;
}

.bg-blue-100 {
  background-color: #dbeafe;
}

.rounded-full {
  border-radius: 50%;
}

.text-blue-600 {
  color: #2563eb;
}

.text-2xl {
  font-size: 1.5rem;
}

.font-bold {
  font-weight: 700;
}

.mr-4 {
  margin-right: 1rem;
}

.text-xl {
  font-size: 1.25rem;
}

.sm\:text-2xl {
  font-size: 1.5rem;
}

.text-gray-900 {
  color: #1a1d23;
}

.text-gray-600 {
  color: #6b7280;
}

.w-full {
  width: 100%;
}

.sm\:w-auto {
  width: auto;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.bg-blue-600 {
  background-color: #2563eb;
}

.text-white {
  color: #ffffff;
}

.hover\:bg-blue-700 {
  background-color: #1d4ed8;
}

.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.duration-200 {
  transition-duration: 200ms;
}

.space-y-4 {
  gap: 1rem;
}

.border-t {
  border-top-width: 1px;
}

.border-gray-200 {
  border-color: #e5e7eb;
}

.form-group {
  margin-bottom: 1rem;
}

.block {
  display: block;
}

.text-sm {
  font-size: 0.875rem;
}

.font-medium {
  font-weight: 500;
}

.mb-1 {
  margin-bottom: 0.25rem;
}

.w-full {
  width: 100%;
}

.px-3 {
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.border {
  border-width: 1px;
}

.border-gray-300 {
  border-color: #d1d5db;
}

.focus\:ring-2 {
  outline-offset: 2px;
}

.focus\:ring-blue-500 {
  --ring-color: #3b82f6;
}

.focus\:border-blue-500 {
  border-color: #3b82f6;
}

.flex-1 {
  flex: 1;
}

.sm\:flex-none {
  flex: none;
}

.bg-gray-200 {
  background-color: #e5e7eb;
}

.text-gray-800 {
  color: #2f373d;
}

.hover\:bg-gray-300 {
  background-color: #d1d5db;
}

.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.duration-200 {
  transition-duration: 200ms;
}

.grid {
  display: grid;
}

.gap-4 {
  gap: 1rem;
}

.sm\:gap-6 {
  gap: 1.5rem;
}

.sm\:grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.bg-gray-50 {
  background-color: #f9fafb;
}

.p-4 {
  padding: 1rem;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.border {
  border-width: 1px;
}

.border-gray-200 {
  border-color: #e5e7eb;
}

.relative {
  position: relative;
}

.group {
  display: inline-block;
}

.absolute {
  position: absolute;
}

.top-2 {
  top: 0.5rem;
}

.right-2 {
  right: 0.5rem;
}

.opacity-0 {
  opacity: 0;
}

.group-hover\:opacity-100 {
  opacity: 1;
}

.transition-opacity {
  transition-property: opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.duration-200 {
  transition-duration: 200ms;
}

.font-medium {
  font-weight: 500;
}

.mb-1 {
  margin-bottom: 0.25rem;
}

.text-gray-600 {
  color: #6b7280;
}

.text-sm {
  font-size: 0.875rem;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.p-4 {
  padding: 1rem;
}

.border-2 {
  border-width: 2px;
}

.border-dashed {
  border-style: dashed;
}

.border-gray-300 {
  border-color: #d1d5db;
}

.hover\:border-blue-500 {
  border-color: #3b82f6;
}

.hover\:bg-blue-50 {
  background-color: #eff6ff;
}

.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.duration-200 {
  transition-duration: 200ms;
}

.w-5 {
  width: 1.25rem;
}

.h-5 {
  height: 1.25rem;
}

.text-gray-400 {
  color: #9ca3af;
}

.mr-2 {
  margin-right: 0.5rem;
}

.text-gray-600 {
  color: #6b7280;
}
</style>
