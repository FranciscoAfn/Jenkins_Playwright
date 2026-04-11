// fixtures/base-test.ts
import { test as base, expect } from '@playwright/test';
import { ReportingApi } from '@reportportal/agent-js-playwright'; // <-- IMPORT RP API
import { execSync } from 'child_process';
import fs from 'fs';

export const test = base.extend<{ handleFailuresGlobally: void }>({
  
  handleFailuresGlobally: [async ({ page }, use, testInfo) => {
    
    await use();

    if (testInfo.status === testInfo.expectedStatus) return;

    console.log(`Test failed: ${testInfo.title}. Processing attachments...`);

    // STEP 1: TAKE THE SCREENSHOT FIRST
    try {
      const screenshotPath = testInfo.outputPath('failure-screenshot.png');
      await page.screenshot({ path: screenshotPath, timeout: 5000 });
      
      // 1. Attach to standard Playwright report
      await testInfo.attach('failure-screenshot', {
        path: screenshotPath,
        contentType: 'image/png',
      });

      // 2. FORCE ATTACH DIRECTLY TO REPORT PORTAL
      ReportingApi.info('Test Failure Screenshot', {
        name: 'failure-screenshot.png',
        type: 'image/png',
        content: fs.readFileSync(screenshotPath),
      });

      console.log(' Screenshot attached successfully.');
    } catch (e) {
      console.log(' Could not take screenshot:', e.message);
    }

    const video = page.video();
    if (!video) return;

    // STEP 2: FLUSH THE WEBM VIDEO
    await page.context().close();
    const tempWebmPath = await video.path();
    
    if (!fs.existsSync(tempWebmPath)) return;

    // STEP 3: CONVERT WEBM TO MP4
    const mp4Path = testInfo.outputPath('video.mp4');
    try {
      console.log('Converting WebM to MP4...');
      execSync(
        `ffmpeg -y -i "${tempWebmPath}" -c:v libx264 -pix_fmt yuv420p "${mp4Path}"`,
        { stdio: 'inherit' }
      );
    } catch (err) {
      console.error('❌ FFmpeg conversion failed:', err.message);
      return; 
    }

    // STEP 4: ATTACH MP4 TO REPORTPORTAL
    if (fs.existsSync(mp4Path)) {
      console.log('Attaching MP4 Buffer to results...');
      const videoBuffer = fs.readFileSync(mp4Path);
      
      // 1. Attach to standard Playwright report
      await testInfo.attach('video-mp4', {
        body: videoBuffer,
        contentType: 'video/mp4',
      });

      // 2. FORCE ATTACH DIRECTLY TO REPORT PORTAL
      ReportingApi.info('Test Failure Video Recording', {
        name: 'video.mp4',
        type: 'video/mp4',
        content: videoBuffer,
      });

      console.log(' MP4 successfully attached!');
    }
    
  }, { auto: true }],
});

export { expect };
