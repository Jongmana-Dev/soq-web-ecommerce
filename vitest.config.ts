// vitest.config.ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test/setupTests.ts',
    coverage: {
      provider: 'v8',
    },
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
