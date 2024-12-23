<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" class="relative z-50" @close="emit('close')">
      <!-- Background backdrop -->
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
      </TransitionChild>

      <!-- Full-screen container to center the panel -->
      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel 
              class="w-full transform overflow-hidden rounded-xl bg-white text-left align-middle shadow-xl transition-all sm:my-8 relative max-w-[98%] md:max-w-5xl lg:max-w-7xl max-h-[85vh] flex flex-col"
            >
              <!-- Close button -->
              <button 
                @click="emit('close')" 
                class="absolute top-4 right-4 text-red-900 hover:text-red-600 transition-colors duration-200 z-20 p-2 rounded-full hover:bg-red-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <!-- Modal content -->
              <div class="p-6 overflow-y-auto flex-1">
                <!-- Product content grid -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <!-- Left Column: Images -->
                  <div class="space-y-4">
                    <div class="aspect-w-1 aspect-h-1 bg-gray-50 rounded-2xl overflow-hidden max-h-[500px] shadow-sm hover:shadow-md transition-shadow duration-300">
                      <img 
                        :src="displayImages[selectedImageIndex]" 
                        :alt="product.title"
                        class="object-contain w-full h-full"
                      />
                    </div>
                    
                    <!-- Thumbnails -->
                    <div class="grid grid-cols-4 gap-4">
                      <button
                        v-for="(image, index) in displayImages"
                        :key="index"
                        @click="selectedImageIndex = index"
                        class="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden bg-gray-50 hover:ring-2 hover:ring-primary-500 transition-all duration-200"
                        :class="{ 'ring-2 ring-primary-500': selectedImageIndex === index }"
                      >
                        <img
                          :src="image"
                          :alt="`${product.title} - View ${index + 1}`"
                          class="object-contain w-full h-full"
                        />
                      </button>
                    </div>
                  </div>

                  <!-- Right Column: Product Details -->
                  <div class="space-y-6">
                    <div class="border-b pb-4">
                      <h4 class="text-1xl font-bold text-gray-900 mb-2">{{ product.title }}</h4>
                      <p class="text-sm text-gray-500">{{ product.description }}</p>
                    </div>

                    <div class="space-y-4">
                      <div class="flex items-baseline justify-between">
                        <p class="text-3xl font-bold text-orange-600">{{ formattedPrice }}</p>
                      </div>

                      <!-- Display rates -->
                      <div class="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div class="flex justify-between text-sm">
                          <span class="text-gray-600">Tax Rate (As per DRC):</span>
                          <span class="font-medium">{{ product.taxRate }}%</span>
                        </div>
                        <div class="flex justify-between text-sm">
                          <span class="text-gray-600">Logistics:</span>
                          <span class="font-medium">Nu. {{ product.logistic }}/kg</span>
                        </div>
                        <div class="flex justify-between text-sm">
                          <span class="text-gray-600">Weight:</span>
                          <span class="font-medium">{{ product.unit_weight }} kg</span>
                        </div>
                      </div>

                      <!-- View Product Button -->
                      <button
                        @click="goToProduct"
                        class="w-full py-4 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors duration-200 flex items-center justify-center space-x-2"
                      >
                        <i class="fas fa-eye"></i>
                        <span>View Product</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue';
import { usePricingStore } from '../stores/pricing';
import { useRouter } from 'vue-router';

interface ExtendedCategoryProduct extends CategoryProduct {
  video_url?: string;
  main_imgs: string[];
  title: string;
  price: string | number;
  tax_rate?: string | number;
  logistic_rate?: string | number;
  unit_weight?: string | number;
}

const props = defineProps<{
  show: boolean;
  product: ExtendedCategoryProduct;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const router = useRouter();
const pricingStore = usePricingStore();
const selectedImageIndex = ref(0);

// Make sure exchange rate is loaded
onMounted(async () => {
  if (pricingStore.needsUpdate) {
    await pricingStore.updateExchangeRate();
  }
});

const isOpen = computed(() => props.show);

const displayImages = computed(() => {
  if (!props.product?.main_imgs?.length) {
    return ['/placeholder-product.jpg'];
  }
  return props.product.main_imgs;
});

const productPricing = computed(() => {
  if (!props.product) return null;
  
  const price = Number(props.product.price_max) || 0;
  const taxRate = Number(props.product.taxRate) || 0;
  const logisticRate = Number(props.product.logistic) || 0;
  const unitWeight = Number(props.product.unit_weight) || 0;

  return pricingStore.calculatePricing(price, taxRate, logisticRate, unitWeight, 1);
});

const formattedPrice = computed(() => {
  if (!productPricing.value) return 'N/A';
  return pricingStore.formatPrice(productPricing.value.totalPrice);
});

const goToProduct = () => {
  if (props.product?.item_id) {
    router.push(`/product/${props.product.item_id}`);
    emit('close');
  }
};
</script>

<style scoped>
.aspect-w-1 {
  position: relative;
  padding-bottom: 100%;
}

.aspect-w-1 > * {
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
</style>
