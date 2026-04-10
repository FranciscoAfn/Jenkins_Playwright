import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import fs from 'fs';

test.afterEach(async ({}, testInfo) => {
  // only do this when test failed
  if (testInfo.status === testInfo.expectedStatus) return;

  const webmPath = testInfo.video?.path();

  if (!webmPath || !fs.existsSync(webmPath)) {
    console.log('No webm video found.');
    return;
  }

  const mp4Path = webmPath.replace(/\.webm$/, '.mp4');

  console.log(`Converting ${webmPath} -> ${mp4Path}`);

  execSync(`ffmpeg -y -i "${webmPath}" "${mp4Path}"`, {
    stdio: 'inherit',
  });

  // Attach MP4 to testInfo so reporter can upload it
  testInfo.attachments.push({
    name: 'video-mp4',
    path: mp4Path,
    contentType: 'video/mp4',
  });
});

test('intentional failure (uploads png + mp4)', async ({ page }) => {
  await page.goto('https://example.com');

  // Intentional fail
  await expect(page.locator('h1')).toHaveText('WRONG TEXT');
});
