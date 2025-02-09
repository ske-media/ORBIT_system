import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react']
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,  // 🔹 Nettoie `dist/` avant chaque build
    rollupOptions: {
      input: 'index.html',  // 🔹 Assure que Vite utilise bien `index.html` comme point d’entrée
    }
  },
  server: {
    open: true
  },
  base: './'  // 🔹 Fixe les chemins relatifs pour Netlify
});