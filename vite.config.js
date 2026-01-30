import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Organize JS files inside assets/js
        entryFileNames: 'assets/js/[name]-[hash].js',
        chunkFileNames: 'assets/js/[name]-[hash].js',
        // Organize assets by type inside assets folder
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || '';
          // CSS files
          if (name.endsWith('.css')) {
            return 'assets/css/[name]-[hash][extname]';
          }
          // Font files
          if (/\.(woff2?|eot|ttf|otf)$/.test(name)) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          // All image files (png, svg, jpeg, jpg, gif, webp, ico)
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(name)) {
            return 'assets/images/[name]-[hash][extname]';
          }
          // Other assets
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  },
  server: {
    fs: {
      // Allow serving files from the wisibles folder (outside project root)
      allow: [
        '.',
        '/Users/saketh/Desktop/conversion/wisibles_30_12_2025'
      ]
    }
  },
  preview: {
    // Enable history API fallback for SPA routing
    // This ensures all routes are served by index.html
  }
})
