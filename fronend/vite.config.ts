import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5174,
    host: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost',
        changeOrigin: true,
        secure: false
      },
      '/sanctum/csrf-cookie': {
        target: 'http://localhost',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia']
        }
      }
    }
  },
  esbuild: {
    tsconfigRaw: {
      compilerOptions: {
        strict: false
      }
    }
  }
})