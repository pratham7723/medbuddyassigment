import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// Vite Configuration
export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  build: {
    outDir: 'dist',  // This ensures the output directory is 'dist'
  },
})
