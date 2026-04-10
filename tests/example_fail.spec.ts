import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import fs from 'fs';

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status === testInfo.expectedStatus) return;

  // 1. Force the context to close to flush the WebM file completely.
  await page.context().close();

  const webmPath = testInfo.video?.path();

  if (!webmPath || !fs.existsSync(webmPath)) {
    console.log('Webm file missing or no video attached:', webmPath);
    return;
  }

  const mp4Path = webmPath.replace(/\.webm$/, '.mp4');
  console.log(`Converting: ${webmPath} -> ${mp4Path}`);

  try {
    execSync(
      `ffmpeg -y -i "${webmPath}" -c:v libx264 -pix_fmt yuv420p "${mp4Path}"`,
      { stdio: 'inherit' }
    );
    console.log('MP4 created successfully:', mp4Path);
  } catch (err) {
    console.error('FFmpeg conversion failed:', err);
    return; // Exit early so we don't attach a broken file
  }

  if (fs.existsSync(mp4Path)) {
    console.log('Reading MP4 into buffer and attaching...');
    const videoBuffer = fs.readFileSync(mp4Path);
    
    await testInfo.attach('video-mp4', {
      body: videoBuffer,
      contentType: 'video/mp4',
    });
  }
});

test('intentional failure (uploads png + mp4) @example_fail', async ({ page }) => {
  await page.goto('https://example.com');

  // Intentional fail
  await expect(page.locator('h1')).toHaveText('WRONG TEXT');
});
