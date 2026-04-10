import { defineConfig, devices } from '@playwright/test';
import rpConfig from './reportportal.config.cjs';

export default defineConfig({
  testDir: './tests',
  
  outputDir: 'test-results',
  
   projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  reporter: [
    ['@reportportal/agent-js-playwright', rpConfig]
  ],
    
  use: {
    screenshot: 'only-on-failure',   // PNG
    video: 'retain-on-failure',      // WEBM
    trace: 'retain-on-failure',
  },

  preserveOutput: 'failures-only',
});
