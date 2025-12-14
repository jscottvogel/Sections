/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/setupTests.ts',
        'amplify/**', // Exclude backend config
        'src/main.tsx', // Exclude entry point
        'src/types/**', // Exclude types
        'dist/**',
        '**/*.d.ts',
        '**/*.config.*',
        'src/lib/amplify.ts', // Exclude pure config
        'src/App.tsx' // Hard to test Auth wrapper in unit
      ]
    }
  },
})
