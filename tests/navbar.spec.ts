import { test, expect } from '@playwright/test';

test('verify navbar appearance', async ({ page }) => {
  await page.goto('http://localhost:8080/');

  // Wait for the desktop navbar (md:block) which is now md:flex
  // The class was changed from md:block to md:flex
  const navbar = page.locator('nav.md\\:flex').first();
  await navbar.waitFor();

  // Take screenshot of the page
  await page.screenshot({ path: 'public/navbar-verification-after.png', fullPage: false });
});
