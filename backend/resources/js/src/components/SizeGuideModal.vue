<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen p-4">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="close"></div>

      <!-- Modal -->
      <div class="relative bg-white rounded-lg max-w-2xl w-full p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Size Guide</h2>
          <button @click="close" class="text-gray-500 hover:text-gray-700">
            <span class="sr-only">Close</span>
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th class="px-4 py-2 bg-gray-50 text-left text-sm font-medium text-gray-500">Size</th>
                <th v-if="hasField('bust')" class="px-4 py-2 bg-gray-50 text-left text-sm font-medium text-gray-500">Bust</th>
                <th v-if="hasField('waist')" class="px-4 py-2 bg-gray-50 text-left text-sm font-medium text-gray-500">Waist</th>
                <th v-if="hasField('hips')" class="px-4 py-2 bg-gray-50 text-left text-sm font-medium text-gray-500">Hips</th>
                <th v-if="hasField('length')" class="px-4 py-2 bg-gray-50 text-left text-sm font-medium text-gray-500">Length</th>
                <th v-if="hasField('shoulder')" class="px-4 py-2 bg-gray-50 text-left text-sm font-medium text-gray-500">Shoulder</th>
                <th v-if="hasField('sleeve')" class="px-4 py-2 bg-gray-50 text-left text-sm font-medium text-gray-500">Sleeve</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="guide in sizeGuide" :key="guide.size">
                <td class="px-4 py-2 text-sm text-gray-900">{{ guide.size }}</td>
                <td v-if="hasField('bust')" class="px-4 py-2 text-sm text-gray-500">{{ guide.bust }}</td>
                <td v-if="hasField('waist')" class="px-4 py-2 text-sm text-gray-500">{{ guide.waist }}</td>
                <td v-if="hasField('hips')" class="px-4 py-2 text-sm text-gray-500">{{ guide.hips }}</td>
                <td v-if="hasField('length')" class="px-4 py-2 text-sm text-gray-500">{{ guide.length }}</td>
                <td v-if="hasField('shoulder')" class="px-4 py-2 text-sm text-gray-500">{{ guide.shoulder }}</td>
                <td v-if="hasField('sleeve')" class="px-4 py-2 text-sm text-gray-500">{{ guide.sleeve }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-6 text-sm text-gray-500">
          <p>All measurements are in inches. For the best fit, measure yourself and compare with the size guide above.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { SizeGuide } from '../types/product';

const props = defineProps<{
  show: boolean;
  sizeGuide: SizeGuide[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const close = () => {
  emit('close');
};

const hasField = (field: keyof SizeGuide) => {
  return props.sizeGuide.some(guide => guide[field] !== undefined);
};
</script>
