// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/', // Root-relative paths for proper deployment
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  // Ensure proper handling of assets
  assetsInclude: ['**/*.jpg', '**/*.png', '**/*.mp3'],
});
