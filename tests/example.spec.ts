import { test, expect } from '../fixtures/base-test';

test('example test @test', async ({ page }) => {
  await page.goto('https://google.com');
  await expect(page).toHaveTitle(/Google/);
});
