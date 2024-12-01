import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['react', 'react-dom', 'axios'], // Pre-bundle common dependencies
  },
  build: {
    minify: 'terser', // More efficient minification
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
        drop_debugger: true, // Remove debugger statements
      },
    },
    sourcemap: false, // Disable sourcemaps in production
  },
  server: {
    port: 3000, // Consistent port
    strictPort: true, // Fail if port is already in use
    hmr: {
      overlay: false, // Disable error overlay
    },
    warmup: {
      clientFiles: ['./src/main.tsx', './src/App.tsx'], // Warm up critical files
    },
  },
  resolve: {
    alias: {
      '@': '/src', // Easier imports
    },
  },
});
