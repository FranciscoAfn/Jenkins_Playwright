// fixtures/base-test.ts
import { test as base, expect } from '@playwright/test';
import { execSync } from 'child_process';
import fs from 'fs';

export const test = base.extend<{ handleFailuresGlobally: void }>({
  handleFailuresGlobally: [async ({ page }, use, testInfo) => {
    
    await use();

    if (testInfo.status === testInfo.expectedStatus) return;

    console.log(`Test failed: ${testInfo.title}. Processing attachments...`);

    // 1. SAFE SCREENSHOT LOGIC
    try {
      const screenshotPath = testInfo.outputPath('failure-screenshot.png');
      await page.screenshot({ path: screenshotPath, timeout: 5000 });
      await testInfo.attach('failure-screenshot', {
        path: screenshotPath,
        contentType: 'image/png',
      });
      console.log('Screenshot attached.');
    } catch (e) {
      console.log('Could not take screenshot:', e.message);
    }

    const video = page.video();
    if (!video) return;

    // 2. FLUSH WEBM LOGIC
    await page.context().close();
    const tempWebmPath = await video.path();
    
    if (!fs.existsSync(tempWebmPath)) return;

    // 3. FFMPEG MP4 CONVERSION LOGIC
    const mp4Path = testInfo.outputPath('video.mp4');
    try {
      console.log('Converting to MP4...');
      execSync(
        `ffmpeg -y -i "${tempWebmPath}" -c:v libx264 -pix_fmt yuv420p "${mp4Path}"`,
        { stdio: 'inherit' }
      );
    } catch (err) {
      console.error('FFmpeg conversion failed:', err.message);
      return;
    }

    // 4. ATTACH MP4 TO REPORTPORTAL
    if (fs.existsSync(mp4Path)) {
      console.log('Attaching MP4 Buffer...');
      const videoBuffer = fs.readFileSync(mp4Path);
      await testInfo.attach('video-mp4', {
        body: videoBuffer,
        contentType: 'video/mp4',
      });
      console.log('MP4 successfully attached!');
    }
  }, { auto: true }],
});

export { expect };
