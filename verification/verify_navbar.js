
import { test, expect, chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log('Navigating to homepage...');
  // Assuming default Vite port 8080 or 5173, trying 8080 first based on common Vite setup or check package.json
  // Actually, I should check the port. I'll try 5173 which is Vite default.
  // Wait, I need to know the port. I'll check package.json or try to grep the output if I could.
  // I will try 8080 as it's common in these environments, or 5173.

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

  // 1. Desktop View Verification
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.waitForTimeout(2000); // Wait for animations/load
  await page.screenshot({ path: 'verification/desktop_navbar.png' });
  console.log('Desktop screenshot taken.');

  // 2. Mobile View Verification
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'verification/mobile_navbar.png' });
  console.log('Mobile screenshot taken.');

  // 3. Mobile Menu Open Verification
  // Click the menu button. It's the button with "Menu" text.
  await page.getByText('Menu', { exact: true }).click();
  await page.waitForTimeout(1000); // Wait for animation
  await page.screenshot({ path: 'verification/mobile_menu_open.png' });
  console.log('Mobile menu open screenshot taken.');

  await browser.close();
})();
