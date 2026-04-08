import { defineConfig } from '@playwright/tests';
import rpConfig from './reportportal.config.cjs';

export default defineConfig({
  testDir: './tests',
  reporter: [
    ['@reportportal/agent-js-playwright', rpConfig]
  ]
});
