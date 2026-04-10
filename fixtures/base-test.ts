// tests/fixtures/base-test.ts
import { test as base, expect } from '@playwright/test';
import { execSync } from 'child_process';
import fs from 'fs';

// Extend the base test with our custom automatic fixture
export const test = base.extend<{ handleFailuresGlobally: void }>({
  
  // By passing { auto: true }, Playwright knows to run this for EVERY test automatically
  handleFailuresGlobally: [async ({ page }, use, testInfo) => {
    
    // 1. Execute the actual test first
    await use();

    // 2. TEARDOWN: Everything below this runs AFTER the test finishes
    if (testInfo.status === testInfo.expectedStatus) return;

    console.log(`Test failed: ${testInfo.title}. Processing attachments...`);

    // --- SCREENSHOT LOGIC ---
    const screenshotPath = testInfo.outputPath('failure-screenshot.png');
    await page.screenshot({ path: screenshotPath, timeout: 5000 });
    await testInfo.attach('failure-screenshot', {
      path: screenshotPath,
      contentType: 'image/png',
    });

    const video = page.video();
    if (!video) return;

    // --- FLUSH WEBM LOGIC ---
    await page.context().close();
    const tempWebmPath = await video.path();
    
    if (!fs.existsSync(tempWebmPath)) return;

    // --- FFMPEG MP4 CONVERSION LOGIC ---
    const mp4Path = testInfo.outputPath('video.mp4');
    try {
      execSync(
        `ffmpeg -y -i "${tempWebmPath}" -c:v libx264 -pix_fmt yuv420p "${mp4Path}"`,
        { stdio: 'inherit' }
      );
    } catch (err) {
      console.error('FFmpeg conversion failed:', err.message);
      return;
    }

    // --- ATTACH MP4 TO REPORTPORTAL ---
    if (fs.existsSync(mp4Path)) {
      const videoBuffer = fs.readFileSync(mp4Path);
      await testInfo.attach('video-mp4', {
        body: videoBuffer,
        contentType: 'video/mp4',
      });
    }
  }, { auto: true }], // <-- This is the magic flag that makes it global
});

// Export 'expect' so you can import both from this single file
export { expect };
