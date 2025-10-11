
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['components/**/__tests__/*.test.tsx']
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') }
  }
})
