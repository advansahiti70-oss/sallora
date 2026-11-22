import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Later screens call the back end as /api/…; in development Vite forwards those calls to it.
    proxy: { '/api': 'http://localhost:3000' },
  },
})
