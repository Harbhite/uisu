# Prerender Setup for UISU SPACE

This guide explains how to set up prerendering for proper OG meta tags on social media.

## Problem

Single Page Applications (SPAs) like UISU SPACE dynamically generate meta tags using JavaScript. However, social media crawlers (Facebook, Twitter, LinkedIn, etc.) don't execute JavaScript, so they only see the static tags in `index.html`.

## Solution: Prerendering

We've created a prerender edge function that serves static HTML with correct OG tags to crawlers.

### Edge Function Endpoint

```
https://zdxmmwqjvkedddcgucyz.supabase.co/functions/v1/prerender?path=/your-page
```

### How It Works

1. When a crawler requests a page, it's redirected to the prerender function
2. The function generates static HTML with correct OG tags for that specific page
3. Crawlers receive proper metadata for social sharing

## Setup Options

### Option 1: Cloudflare Workers (Recommended)

If you use a custom domain with Cloudflare:

1. Create a Cloudflare Worker with this code:

```javascript
const CRAWLER_PATTERNS = [
  'facebookexternalhit', 'Twitterbot', 'LinkedInBot', 'WhatsApp',
  'Slackbot', 'TelegramBot', 'Discordbot', 'Pinterest'
];

const PRERENDER_URL = 'https://zdxmmwqjvkedddcgucyz.supabase.co/functions/v1/prerender';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const userAgent = request.headers.get('user-agent') || '';
  const url = new URL(request.url);
  
  // Check if it's a crawler
  const isCrawler = CRAWLER_PATTERNS.some(pattern => 
    userAgent.toLowerCase().includes(pattern.toLowerCase())
  );
  
  if (isCrawler) {
    // Redirect to prerender function
    const prerenderUrl = `${PRERENDER_URL}?path=${encodeURIComponent(url.pathname)}`;
    return fetch(prerenderUrl);
  }
  
  // Normal request - pass through
  return fetch(request);
}
```

2. Set up a Worker Route for your domain

### Option 2: Prerender.io Integration

1. Sign up at [prerender.io](https://prerender.io)
2. Add your domain: `uisu.space`
3. Configure the middleware in your hosting provider
4. Prerender.io will automatically cache and serve prerendered pages

### Option 3: Vercel/Netlify Edge Functions

If hosting on Vercel or Netlify, use their edge middleware:

**Vercel (middleware.ts):**
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const crawlerPatterns = ['facebookexternalhit', 'Twitterbot', 'LinkedInBot'];
const prerenderUrl = 'https://zdxmmwqjvkedddcgucyz.supabase.co/functions/v1/prerender';

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  const isCrawler = crawlerPatterns.some(p => userAgent.includes(p));
  
  if (isCrawler) {
    return NextResponse.rewrite(
      `${prerenderUrl}?path=${encodeURIComponent(request.nextUrl.pathname)}`
    );
  }
  
  return NextResponse.next();
}
```

## Testing

### Test with curl (simulating Facebook crawler):

```bash
curl -A "facebookexternalhit/1.1" \
  "https://zdxmmwqjvkedddcgucyz.supabase.co/functions/v1/prerender?path=/governance"
```

### Facebook Sharing Debugger:

1. Go to [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
2. Enter your URL
3. Click "Scrape Again" to refresh cached data

### Twitter Card Validator:

1. Go to [Twitter Card Validator](https://cards-dev.twitter.com/validator)
2. Enter your URL
3. Check the preview

### LinkedIn Post Inspector:

1. Go to [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
2. Enter your URL
3. Verify the preview

## Supported Routes

The prerender function supports all main routes:

- `/` - Homepage
- `/governance` - Governance structure
- `/current-leaders` - Current leaders
- `/current-leaders/:id` - Leader profiles (dynamic)
- `/past-leaders` - Past leaders archive
- `/communities` - Clubs and societies
- `/events` - Events calendar
- `/announcements` - Union announcements
- `/documents` - Document library
- `/campus-map` - Interactive campus map
- `/inks-vault` - Literary works
- `/inks-vault/piece/:id` - Individual pieces (dynamic)
- `/history` - Union history
- `/constitution` - Official constitution
- `/resources/*` - Student resources
- `/tutorials/*` - Learning platform
- `/halls` - Halls of residence
- `/newsletter` - Newsletter subscription

## Troubleshooting

### OG tags not updating?
- Social platforms cache OG data aggressively
- Use their debug tools to force a re-scrape
- Allow up to 24 hours for cache to clear

### Prerender not working?
- Check the edge function logs in Supabase
- Verify the path parameter is being passed correctly
- Test with curl using a crawler user agent

### Images not loading?
- Ensure images are publicly accessible
- Use absolute URLs (starting with https://)
- Check image dimensions (recommended: 1200x630)
