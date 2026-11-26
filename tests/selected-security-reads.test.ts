import { expect, test } from 'bun:test';

const apiUrl = process.env['VITE_SUPABASE_URL'];
const apiKey = process.env['VITE_SUPABASE_PUBLISHABLE_KEY'];
const emptyUuid = '00000000-0000-0000-0000-000000000000';

if (!apiUrl || !apiKey) {
  throw new Error('The app database URL and publishable key must be available to run this test.');
}

const headers = {
  apikey: apiKey,
  authorization: `Bearer ${apiKey}`,
};

const read = (path: string) => fetch(`${apiUrl}/rest/v1/${path}`, { headers });
const call = (name: string, body: Record<string, unknown>) => fetch(`${apiUrl}/rest/v1/rpc/${name}`, {
  method: 'POST',
  headers: { ...headers, 'content-type': 'application/json' },
  body: JSON.stringify(body),
});

test('anonymous profile reads exclude emails and reaction reads return summaries', async () => {
  const profilesResponse = await read('public_profiles?select=*&limit=1');
  expect(profilesResponse.ok).toBe(true);
  const profiles = await profilesResponse.json() as Array<Record<string, unknown>>;
  for (const profile of profiles) {
    expect(profile).not.toHaveProperty('email');
    expect(profile).not.toHaveProperty('email_notifications');
  }

  const privateViewColumns = await Promise.all([
    read('public_profiles?select=email&limit=1'),
    read('public_tutors?select=user_id&limit=1'),
    read('public_tutorial_reviews?select=user_id&limit=1'),
  ]);
  for (const response of privateViewColumns) expect(response.status).toBe(400);

  const rawProfiles = await read('profiles?select=id,email&limit=1');
  expect([200, 401, 403]).toContain(rawProfiles.status);
  if (rawProfiles.ok) expect(await rawProfiles.json()).toEqual([]);

  const likeCount = await call('get_public_ink_like_count', { p_piece_id: emptyUuid });
  expect(likeCount.ok).toBe(true);
  expect(await likeCount.json()).toBe(0);

  const summaryCalls = await Promise.all([
    call('get_public_ink_reaction_counts', { p_piece_id: emptyUuid }),
    call('get_public_gazette_reaction_counts', { p_article_id: emptyUuid }),
    call('get_public_confession_reaction_counts', { p_confession_ids: [emptyUuid] }),
  ]);
  for (const response of summaryCalls) {
    expect(response.ok).toBe(true);
    const rows = await response.json() as Array<Record<string, unknown>>;
    expect(rows).toEqual([]);
    for (const row of rows) expect(row).not.toHaveProperty('user_id');
  }
});