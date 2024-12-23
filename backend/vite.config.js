import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/js/src/style.css', 
                'resources/js/src/main.ts'
            ],
            refresh: true,
        }),
        vue({
            template: {
                transformAssetUrls: {
                    base: null,
                    includeAbsolute: false,
                }
            }
        })
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'resources/js/src'),
            '~': path.resolve(__dirname, 'node_modules')
        }
    },
    server: {
        port: 5174,
        strictPort: true,
        hmr: {
            host: 'localhost'
        }
    },
    build: {
        outDir: 'public/build',
        emptyOutDir: true,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        return 'vendor';
                    }
                }
            }
        }
    }
});
