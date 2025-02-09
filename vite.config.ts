import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react']
  },
  assetsInclude: ['**/*.html'],
  build: {
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),  // 🔹 Correction ici
    },
    outDir: 'dist', // 🔹 Vérifier que le build va bien dans `dist/`
  },
  publicDir: 'public', // 🔹 Permet d'inclure correctement les fichiers publics
  base: "./", // 🔹 Corrige les chemins relatifs pour Netlify
});