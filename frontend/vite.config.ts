import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Force a single React instance (prevents "Invalid hook call" in devtools).
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
    dedupe: ['react', 'react-dom'],
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3007",
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
