import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: 30000,
    hookTimeout: 60000,
    setupFiles: ['src/test-setup.ts'],
    coverage: {
      exclude: [
        'src/**/*.html',
        'src/**/*.scss',
        'src/**/*.css',
        'src/**/*.svg',
        'src/**/*.png',
        'src/test-setup.ts',
        'src/main.ts',
      ],
    },
  },
});
