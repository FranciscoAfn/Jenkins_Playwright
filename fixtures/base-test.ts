// fixtures/base-test.ts
import { test as base, expect } from '@playwright/test';
import { execSync } from 'child_process';
import fs from 'fs';

export const test = base.extend<{ handleFailuresGlobally: void }>({
  
  handleFailuresGlobally: [async ({ page }, use, testInfo) => {
    
    // 1. Run the actual test
    await use();

    // 2. If the test passed, do nothing
    if (testInfo.status === testInfo.expectedStatus) return;

    console.log(`Test failed: ${testInfo.title}. Processing attachments...`);

    // ==========================================
    // STEP 1: TAKE THE SCREENSHOT FIRST
    // ==========================================
    try {
      const screenshotPath = testInfo.outputPath('failure-screenshot.png');
      // We must take the screenshot before closing the page context
      await page.screenshot({ path: screenshotPath, timeout: 5000 });
      
      await testInfo.attach('failure-screenshot', {
        path: screenshotPath,
        contentType: 'image/png',
      });
      console.log('✅ Screenshot attached successfully.');
    } catch (e) {
      console.log('❌ Could not take screenshot:', e.message);
    }

    const video = page.video();
    if (!video) {
      console.log('No video object found on page.');
      return;
    }

    // ==========================================
    // STEP 2: FLUSH THE WEBM VIDEO
    // ==========================================
    // Closing the context forces Playwright to finish writing the WebM file
    await page.context().close();
    const tempWebmPath = await video.path();
    
    if (!fs.existsSync(tempWebmPath)) {
      console.log('❌ Temporary WebM file not found on disk.');
      return;
    }

    // ==========================================
    // STEP 3: CONVERT WEBM TO MP4
    // ==========================================
    const mp4Path = testInfo.outputPath('video.mp4');
    try {
      console.log('Converting WebM to MP4...');
      execSync(
        `ffmpeg -y -i "${tempWebmPath}" -c:v libx264 -pix_fmt yuv420p "${mp4Path}"`,
        { stdio: 'inherit' }
      );
    } catch (err) {
      console.error('❌ FFmpeg conversion failed:', err.message);
      return; // Exit if we have no MP4 to attach
    }

    // ==========================================
    // STEP 4: ATTACH MP4 TO REPORTPORTAL
    // ==========================================
    if (fs.existsSync(mp4Path)) {
      console.log('Attaching MP4 Buffer to results...');
      
      // Reading into a buffer ensures the ReportPortal agent catches it immediately
      const videoBuffer = fs.readFileSync(mp4Path);
      
      await testInfo.attach('video-mp4', {
        body: videoBuffer,
        contentType: 'video/mp4',
      });
      console.log('✅ MP4 successfully attached!');
    }
    
  }, { auto: true }], // { auto: true } ensures this runs for every test
});

export { expect };
