# Prerendering Setup for UISU SPACE

This guide explains how to set up prerendering for proper OG meta tags on social media.

## Problem

Single Page Applications (SPAs) like UISU SPACE dynamically generate meta tags using JavaScript. However, social media crawlers (Facebook, Twitter, LinkedIn, etc.) don't execute JavaScript, so they only see the static tags in `index.html`.

## Solution: Prerendering

We've created a prerender edge function that serves static HTML with correct OG tags to crawlers.

## Dynamic Content Support

The prerender function now fetches real data from the database for:
- **Leader profiles** (`/current-leaders/:id`) - Name, role, bio, and photo
- **Ink pieces** (`/inks-vault/piece/:id`) - Title, author, summary, and cover image
- **Committees** (`/committee/:slug`) - Title and description
- **Halls** (`/governance/hall/:slug`) - Name, description, and image

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

1. **Create a Cloudflare Worker** with this code:

```javascript
// UISU SPACE Prerender Worker
const CRAWLER_PATTERNS = [
  'facebookexternalhit',
  'Facebot',
  'Twitterbot',
  'LinkedInBot',
  'WhatsApp',
  'Slackbot',
  'TelegramBot',
  'Discordbot',
  'Pinterest',
  'Googlebot',
  'bingbot'
];

const PRERENDER_URL = 'https://zdxmmwqjvkedddcgucyz.supabase.co/functions/v1/prerender';
const VERSION = 'v1.0.1'; // Update this when making changes

export default {
  async fetch(request) {
    const userAgent = request.headers.get('user-agent') || '';
    const url = new URL(request.url);
    
    // Skip static assets
    if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf)$/i)) {
      return fetch(request);
    }
    
    // Check if it's a crawler
    const isCrawler = CRAWLER_PATTERNS.some(pattern => 
      userAgent.toLowerCase().includes(pattern.toLowerCase())
    );
    
    console.log(`[${VERSION}] Path: ${url.pathname}, UA: ${userAgent.substring(0, 50)}, Crawler: ${isCrawler}`);
    
    if (isCrawler) {
      try {
        // Fetch from prerender function
        const prerenderUrl = `${PRERENDER_URL}?path=${encodeURIComponent(url.pathname)}`;
        console.log(`[${VERSION}] Fetching prerender: ${prerenderUrl}`);
        
        const response = await fetch(prerenderUrl, {
          headers: {
            'User-Agent': userAgent
          }
        });
        
        if (!response.ok) {
          console.error(`[${VERSION}] Prerender error: ${response.status}`);
          return fetch(request);
        }
        
        return response;
      } catch (error) {
        console.error(`[${VERSION}] Prerender failed:`, error);
        return fetch(request);
      }
    }
    
    // Normal request - pass through to origin
    return fetch(request);
  }
};
```

2. **Set up a Worker Route:**
   - Go to your domain in Cloudflare Dashboard
   - Navigate to Workers Routes
   - Add route: `uisu.space/*` → Your Worker
   - Add route: `www.uisu.space/*` → Your Worker (if using www)

3. **IMPORTANT: Custom Domain Configuration**
   - Make sure your Worker is deployed
   - The route must match your domain exactly
   - Test with the debugging steps below

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

### Step 1: Verify the Edge Function Works

Test directly with curl:
```bash
curl "https://zdxmmwqjvkedddcgucyz.supabase.co/functions/v1/prerender?path=/"
```

You should see HTML with proper OG tags. Check the `X-Prerender-Version` header to confirm deployment.

### Step 2: Test Cloudflare Worker

1. **Check Worker Logs:**
   - Go to Cloudflare Dashboard → Workers → Your Worker → Logs
   - Look for logs showing `[v1.0.1] Path:` entries
   
2. **Test Worker Route:**
   - Simulate a crawler request to your domain:
   ```bash
   curl -A "facebookexternalhit/1.1" "https://uisu.space/governance"
   ```
   - The response should contain proper OG tags

3. **Common Issues:**
   - **Worker not triggering**: Check if the route pattern matches your domain
   - **404 errors**: Verify the prerender function is deployed
   - **Old version showing**: Clear Cloudflare cache or wait for propagation

### Step 3: Test with Social Media Debuggers

After confirming the worker is working:

1. **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/
2. **Twitter Card Validator**: https://cards-dev.twitter.com/validator
3. **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/

Click "Scrape Again" or similar to clear their cache.

### OG tags not updating?
- Social platforms cache OG data aggressively (up to 7 days)
- Use their debug tools to force a re-scrape
- Check Cloudflare cache settings (consider purging cache)

### Prerender not working?
- Check the edge function logs in Cloud View
- Verify the path parameter is being passed correctly
- Test the prerender URL directly in your browser

### Images not loading?
- Ensure images are publicly accessible
- Use absolute URLs (starting with https://)
- Check image dimensions (recommended: 1200x630)
- Verify Storage bucket permissions allow public access
