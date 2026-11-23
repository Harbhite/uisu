import { expect, test } from '@playwright/test';

test('anonymous visitors use the safe Lost & Found listing, not raw item records', async ({ page }) => {
  const listingResponsePromise = page.waitForResponse((response) =>
    response.url().includes('/rpc/get_public_lost_found_items'),
  );

  await page.goto('http://localhost:8080/lost-found');
  await expect(page.getByRole('heading', { name: 'Lost & Found' })).toBeVisible();

  const listingResponse = await listingResponsePromise;
  expect(listingResponse.ok()).toBe(true);

  const listing = await listingResponse.json() as Array<Record<string, unknown>>;
  expect(Array.isArray(listing)).toBe(true);
  for (const item of listing) {
    expect(item.ai_attributes).toBeNull();
    if (item.item_type === 'found') {
      expect(item.contact_info).toBeNull();
      expect(item.user_id).toBeNull();
    }
  }

  const requestHeaders = await listingResponse.request().allHeaders();
  const rawUrl = new URL(listingResponse.url());
  rawUrl.pathname = rawUrl.pathname.replace('/rpc/get_public_lost_found_items', '/lost_found_items');
  rawUrl.search = '?select=id,contact_info,ai_attributes&limit=1';
  const rawResponse = await page.request.get(rawUrl.toString(), {
    headers: {
      apikey: requestHeaders.apikey,
      authorization: requestHeaders.authorization,
    },
  });

  expect(rawResponse.status()).toBeGreaterThanOrEqual(400);
});