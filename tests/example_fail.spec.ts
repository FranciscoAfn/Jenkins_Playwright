import { test, expect } from '@playwright/test';

test('intentional failure (uploads png + webm)', async ({ page }) => {
  await page.goto('https://example.com');

  // Intentional fail
  await expect(page.locator('h1')).toHaveText('WRONG TEXT');
});
