import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    setupFiles: ['tests/unit/setup-chrome.ts'],
    // Restore spies to the throwing stubs (below) between tests so an
    // unmocked chrome.* call in one test can't leak into the next.
    restoreMocks: true,
  },
});
