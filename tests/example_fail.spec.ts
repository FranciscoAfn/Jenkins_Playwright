import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import fs from 'fs';

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status === testInfo.expectedStatus) return;

  // 1. Get the video object from the PAGE, not testInfo
  const video = page.video();
  if (!video) {
    console.log('No video object attached to the page.');
    return;
  }

  // 2. Force the context to close to fully flush the WebM file to disk.
  await page.context().close();

  // 3. AWAIT the video path (Playwright requires await here)
  const webmPath = await video.path();

  if (!webmPath || !fs.existsSync(webmPath)) {
    console.log('Webm file missing on disk:', webmPath);
    return;
  }

  // Create the mp4 path in the exact same directory
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
    return; // Exit early if ffmpeg fails
  }

  // 4. Attach the MP4 using the Buffer fallback directly to ReportPortal
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
