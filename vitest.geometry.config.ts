import path from 'path';
import { defineConfig } from 'vitest/config';

// Runs ONLY the geometry baseline tests.
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    include: ['src/three/baselineGeometry.test.ts'],
    clearMocks: true,
  },
});
