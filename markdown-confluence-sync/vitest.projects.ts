/* eslint-disable import/no-default-export, import/no-extraneous-dependencies */
import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: new URL('.', import.meta.url).pathname,
  test: {
    environment: 'node',
    include: ['src/**/*.unit.test.ts'],
  },
});
