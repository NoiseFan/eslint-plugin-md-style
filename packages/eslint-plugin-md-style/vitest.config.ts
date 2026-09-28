import { fileURLToPath } from 'node:url'
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  root: fileURLToPath(new URL('./', import.meta.url)),
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
      '@tests': fileURLToPath(new URL('./tests', import.meta.url)),
    },
  },
  test: {
    globals: true,
    server: {
      deps: {
        inline: ['eslint-vitest-rule-tester'],
      },
    },
    include: ['**/*.test.ts'],
    exclude: [
      ...configDefaults.exclude,
      '**/*/example',
    ],
  },
})
