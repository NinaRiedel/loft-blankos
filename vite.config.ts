import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/loft-blankos/',
  plugins: [react()],
  define: {
    'global': 'globalThis',
  },
})

