import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import './style.css'
import './assets/global.css'
import '@mdi/font/css/materialdesignicons.css'
import App from './App.vue'
import router from './router'
import { usePricingStore } from './stores/pricing'
import { useAuthStore } from './stores/auth'
import { setupGlobalErrorHandling } from '@/utils/errorHandler'

// Enable passive touch events globally
const originalAddEventListener = EventTarget.prototype.addEventListener;
EventTarget.prototype.addEventListener = function(type, listener, options) {
  let newOptions = options;
  if (type.startsWith('touch')) {
    newOptions = typeof options === 'boolean' ? { passive: true } : { ...options, passive: true };
  }
  return originalAddEventListener.call(this, type, listener, newOptions);
};

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

// Initialize pricing store
const pricingStore = usePricingStore()
pricingStore.init().catch(error => {
  console.error('Failed to initialize pricing store:', error)
})

// Set up global error handling
setupGlobalErrorHandling()

app.use(router)

// Initialize auth state before mounting the app
const authStore = useAuthStore(pinia);
authStore.checkAuth().finally(() => {
  app.mount('#app');
});

export default app;