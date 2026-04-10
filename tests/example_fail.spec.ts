import { test, expect } from '../fixtures/base-test';

test('intentional failure (uploads png + mp4) @example_fail', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page.locator('h1')).toHaveText('WRONG TEXT');
});
