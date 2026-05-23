import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Wait for localhost:3000 to be ready.
  // You might need to ensure Vite is running on port 3000 in a separate bash session.
  try {
    await page.goto('http://localhost:3000/resources/quizlets', { waitUntil: 'networkidle' });

    // Attempt to log in or mock the auth context to show the admin controls if possible,
    // or just capture the page. Since we need to show the UI working, let's take a screenshot
    // of the page.
    await page.screenshot({ path: 'public/quizlet-timing-edit.png', fullPage: true });
    console.log('Screenshot saved to public/quizlet-timing-edit.png');
  } catch (error) {
    console.error('Error taking screenshot:', error);
  } finally {
    await browser.close();
  }
})();
