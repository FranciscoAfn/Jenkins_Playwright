import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import fs from 'fs';

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status === testInfo.expectedStatus) return;

  console.log('Test failed. Processing custom attachments...');

  // 1. MANUALLY TAKE SCREENSHOT FIRST
  // We must do this before closing the context, otherwise the page is lost.
  const screenshotPath = testInfo.outputPath('failure-screenshot.png');
  await page.screenshot({ path: screenshotPath, timeout: 5000 });
  await testInfo.attach('failure-screenshot', {
    path: screenshotPath,
    contentType: 'image/png',
  });

  const video = page.video();
  if (!video) {
    console.log('No video attached to the page.');
    return;
  }

  // 2. NOW WE CLOSE THE CONTEXT
  // This flushes the WebM file to disk completely.
  await page.context().close();

  const tempWebmPath = await video.path();

  if (!fs.existsSync(tempWebmPath)) {
    console.log('Temp Webm file not found:', tempWebmPath);
    return;
  }

  // 3. CONVERT TO MP4
  const mp4Path = testInfo.outputPath('video.mp4');
  console.log(`Converting temporary webm to final mp4...`);

  try {
    execSync(
      `ffmpeg -y -i "${tempWebmPath}" -c:v libx264 -pix_fmt yuv420p "${mp4Path}"`,
      { stdio: 'inherit' }
    );
    console.log('MP4 created successfully!');
  } catch (err) {
    console.error('FFmpeg conversion failed:', err.message);
    return;
  }

  // 4. ATTACH MP4 FOR REPORTPORTAL
  if (fs.existsSync(mp4Path)) {
    const videoBuffer = fs.readFileSync(mp4Path);
    await testInfo.attach('video-mp4', {
      body: videoBuffer,
      contentType: 'video/mp4',
    });
  }
});

test('intentional failure (uploads png + mp4) @example_fail', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page.locator('h1')).toHaveText('WRONG TEXT');
});
