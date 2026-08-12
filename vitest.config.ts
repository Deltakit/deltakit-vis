import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
    // Exclude the geometry baseline test from regular test runs
    exclude: ['src/three/baselineGeometry.test.ts'],
    clearMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['cobertura', 'text'],
      reportsDirectory: './coverage',
    },
  },
});
