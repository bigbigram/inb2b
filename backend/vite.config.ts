import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    laravel({
      input: [
        'resources/js/src/style.css', 
        'resources/js/src/main.ts',
        'resources/js/src/App.vue'
      ],
      refresh: true,
    }),
    vue({
      template: {
        transformAssetUrls: {
          base: null,
          includeAbsolute: false,
        },
      },
    }),
  ],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './resources/js/src'),
    },
  },
  server: {
    port: 8000,  // Match Laravel's default port
    host: true,
    cors: true,
    hmr: {
      host: 'localhost',
    },
  },
  build: {
    outDir: 'public/build',
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