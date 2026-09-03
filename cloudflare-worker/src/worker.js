/**
 * UISU SPACE — social crawler prerender proxy
 *
 * Route: uisu.space/*  (and www.uisu.space/*)
 *
 * Real users  -> passed straight through to Lovable hosting (origin fetch).
 * Bots/crawlers -> served static HTML from the backend `prerender` function,
 *                  so per-page <title> / OG / Twitter tags are visible without JS.
 */

const PRERENDER_ENDPOINT =
  'https://zdxmmwqjvkedddcgucyz.supabase.co/functions/v1/prerender';

// User-agents that do not execute JavaScript and need prerendered HTML.
const BOT_UA = new RegExp(
  [
    'facebookexternalhit', 'facebookcatalog', 'facebot',
    'twitterbot', 'linkedinbot', 'slackbot', 'slack-imgproxy',
    'discordbot', 'telegrambot', 'whatsapp', 'skypeuripreview',
    'pinterest', 'redditbot', 'tumblr', 'vkshare', 'quora link preview',
    'embedly', 'iframely', 'outbrain', 'nuzzel', 'bitlybot',
    'applebot', 'bingbot', 'yandex', 'baiduspider', 'duckduckbot',
    'googlebot', 'google-inspectiontool', 'adsbot-google',
    'mastodon', 'bluesky', 'threadsbot', 'ahrefsbot', 'semrushbot',
    'petalbot', 'w3c_validator', 'prerender',
  ].join('|'),
  'i'
);

// Never prerender these — assets, API calls, files.
const SKIP_PATH = /\.(png|jpe?g|gif|webp|svg|ico|css|js|mjs|json|txt|xml|woff2?|ttf|map|pdf|mp4|webm)$/i;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const ua = request.headers.get('user-agent') || '';

    const isBot =
      BOT_UA.test(ua) ||
      url.searchParams.has('_escaped_fragment_') ||
      url.searchParams.get('prerender') === '1';

    const shouldPrerender =
      isBot &&
      request.method === 'GET' &&
      !SKIP_PATH.test(url.pathname) &&
      !url.pathname.startsWith('/functions/') &&
      !url.pathname.startsWith('/api/');

    if (!shouldPrerender) {
      // Normal visitor: transparent pass-through to the origin (Lovable hosting).
      return fetch(request);
    }

    // Cache prerendered HTML at the edge for 1 hour.
    const cache = caches.default;
    const cacheKey = new Request(
      `https://prerender.cache/${url.pathname}${url.search}`,
      { method: 'GET' }
    );

    const cached = await cache.match(cacheKey);
    if (cached) return cached;

    const target = new URL(PRERENDER_ENDPOINT);
    target.searchParams.set('path', url.pathname + url.search);

    try {
      const upstream = await fetch(target.toString(), {
        method: 'GET',
        headers: {
          'user-agent': ua,
          apikey: env.SUPABASE_ANON_KEY || '',
          authorization: env.SUPABASE_ANON_KEY
            ? `Bearer ${env.SUPABASE_ANON_KEY}`
            : '',
        },
        cf: { cacheTtl: 3600, cacheEverything: true },
      });

      if (!upstream.ok) return fetch(request); // fall back to the SPA

      const html = await upstream.text();
      const response = new Response(html, {
        status: 200,
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'cache-control': 'public, max-age=3600',
          'x-prerendered-by': 'uisu-cf-worker',
        },
      });

      ctx.waitUntil(cache.put(cacheKey, response.clone()));
      return response;
    } catch (_err) {
      // Any failure: never break the site, just serve the real app.
      return fetch(request);
    }
  },
};
