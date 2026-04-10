import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import fs from 'fs';

test.afterEach(async ({}, testInfo) => {
  if (testInfo.status === testInfo.expectedStatus) return;

  const webmPath = testInfo.video?.path();

  if (!webmPath) {
    console.log('No video attached.');
    return;
  }

  // wait until file exists and is not changing anymore
  await new Promise((r) => setTimeout(r, 1000));

  if (!fs.existsSync(webmPath)) {
    console.log('Webm file missing:', webmPath);
    return;
  }

  const mp4Path = webmPath.replace(/\.webm$/, '.mp4');

  console.log(`Converting: ${webmPath} -> ${mp4Path}`);

  try {
    execSync(
      `ffmpeg -y -i "${webmPath}" -c:v libx264 -pix_fmt yuv420p "${mp4Path}"`,
      {
        stdio: 'inherit',
      }
    );

    console.log('MP4 created successfully:', mp4Path);
  } catch (err) {
    console.error('FFmpeg conversion failed:', err);
  }

  if (fs.existsSync(mp4Path)) {
    testInfo.attachments.push({
      name: 'video-mp4',
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
