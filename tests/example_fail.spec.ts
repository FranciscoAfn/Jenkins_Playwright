import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import fs from 'fs';

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status === testInfo.expectedStatus) return;

  const video = page.video();
  if (!video) {
    console.log('No video attached to the page.');
    return;
  }

  // 1. Force context to close so the temporary WebM file is fully written
  await page.context().close();

  // 2. Get the TEMPORARY system path of the WebM file
  const tempWebmPath = await video.path();

  if (!fs.existsSync(tempWebmPath)) {
    console.log('Temp Webm file not found:', tempWebmPath);
    return;
  }

  // 3. THE FIX: Generate the MP4 path directly inside the final test-results directory
  const mp4Path = testInfo.outputPath('video.mp4');

  console.log(`Converting temporary webm to final mp4...`);
  console.log(`Temp Webm: ${tempWebmPath}`);
  console.log(`Final MP4: ${mp4Path}`);

  try {
    execSync(
      `ffmpeg -y -i "${tempWebmPath}" -c:v libx264 -pix_fmt yuv420p "${mp4Path}"`,
      { stdio: 'inherit' }
    );
    console.log('MP4 created successfully in test-results folder!');
  } catch (err) {
    // If you see this error, FFmpeg might not be installed on your machine/CI pipeline
    console.error('FFmpeg conversion failed:', err.message);
    return;
  }

  // 4. Attach the MP4. 
  // Because it is already in the correct output path, Playwright will register it perfectly.
  if (fs.existsSync(mp4Path)) {
    await testInfo.attach('video-mp4', {
      path: mp4Path,
      contentType: 'video/mp4',
    });
  }
});

test('intentional failure (uploads png + mp4) @example_fail', async ({ page }) => {
  await page.goto('https://example.com');

  // Intentional fail
  await expect(page.locator('h1')).toHaveText('WRONG TEXT');
});
