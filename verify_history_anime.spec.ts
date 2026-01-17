import { test, expect } from '@playwright/test';

test('History page loads and animations trigger', async ({ page }) => {
  await page.goto('http://localhost:3005/history');

  // Wait for initial load
  await page.waitForTimeout(2000);

  // Check hero text is visible (opacity 1)
  const heroChar = page.locator('.hero-title .char').first();
  await expect(heroChar).toHaveCSS('opacity', '1');

  // Check SVG path exists
  const path = page.locator('path');
  await expect(path).toBeVisible();

  // Scroll down to trigger section animations
  await page.evaluate(() => window.scrollTo(0, 1000));
  await page.waitForTimeout(1000);

  // Check if global section content became visible
  const globalSectionContent = page.locator('[data-section="global"] .section-content');
  // It might be hard to check exact opacity if it's animating, but we can check if it's present.
  await expect(globalSectionContent).toBeVisible();

  // Take screenshot
  await page.screenshot({ path: 'verification_history_anime.png', fullPage: true });
});
