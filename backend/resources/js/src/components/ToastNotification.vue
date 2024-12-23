&lt;template>
  &lt;div v-if="toast" class="fixed top-4 right-4 z-50">
    &lt;div 
      class="rounded-lg px-4 py-3 shadow-lg transition-all duration-300"
      :class="{
        'bg-green-500 text-white': toast.type === 'success',
        'bg-red-500 text-white': toast.type === 'error'
      }"
    >
      {{ toast.message }}
    &lt;/div>
  &lt;/div>
&lt;/template>

&lt;script setup lang="ts">
import { useToast } from '../composables/useToast';

const { toast } = useToast();
&lt;/script>
