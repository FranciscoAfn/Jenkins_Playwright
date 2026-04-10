import { test, expect } from '@playwright/test';

test('example test @example_fail', async ({ page }) => {
  await page.goto('https://google.com');
  await expect(page).toHaveTitle(/Apple/);
});
