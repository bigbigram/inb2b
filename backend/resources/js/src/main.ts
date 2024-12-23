import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// Styles
import './style.css'
import './assets/global.css'
import '@mdi/font/css/materialdesignicons.css'

// Core app imports
import App from './App.vue'
import router from './router'

// Stores
import { usePricingStore } from './stores/pricing'

const app = createApp(App)
const pinia = createPinia()

// Configure Pinia
pinia.use(piniaPluginPersistedstate)
app.use(pinia)
app.use(router)

// Initialize pricing store
const pricingStore = usePricingStore()
pricingStore.init().catch(error => {
  console.error('Failed to initialize pricing store:', error)
})

// Mount the app
app.mount('#app')