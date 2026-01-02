import { test, expect, chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log('Navigating to homepage...');
  try {
      await page.goto('http://localhost:8080', { timeout: 5000 });
  } catch (e) {
      try {
          await page.goto('http://localhost:5173', { timeout: 5000 });
      } catch (e2) {
          console.error("Could not connect to localhost on 8080 or 5173");
          process.exit(1);
      }
  }

  // 1. Footer Desktop View
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000); // Wait for scroll/load
  await page.screenshot({ path: 'verification/footer_desktop.png' });
  console.log('Desktop footer screenshot taken.');

  // 2. Footer Mobile View
  await page.setViewportSize({ width: 375, height: 800 });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'verification/footer_mobile.png' });
  console.log('Mobile footer screenshot taken.');

  await browser.close();
})();
