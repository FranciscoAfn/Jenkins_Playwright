import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
  await page.goto('https://google.com');
  await expect(page).toHaveTitle(/Google/);
});
