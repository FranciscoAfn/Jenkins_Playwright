import { defineConfig } from 'Playwright-Test/@playwright/test';
import rpConfig from './reportportal.config.cjs';

export default defineConfig({
  testDir: './tests',
  reporter: [
    ['@reportportal/agent-js-playwright', rpConfig]
  ]
});
