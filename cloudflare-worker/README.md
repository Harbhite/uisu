# UISU SPACE — Cloudflare Worker (social preview proxy)

Makes link previews work on Facebook, WhatsApp, X, LinkedIn, Slack, Discord, etc.

## What it does

- A real person visits `uisu.space/...` → nothing changes, the normal site loads.
- A link-preview robot visits the same address → it gets a small ready-made page
  containing that page's own title, description and preview image (produced by the
  site's `prerender` backend function), cached at the edge for 1 hour.
- If anything fails, it silently falls back to the normal site.

## Deploy (one time, ~5 minutes)

Requirements: the `uisu.space` domain must be on a Cloudflare account you control
(the domain's nameservers pointing to Cloudflare), and Node installed locally.

```bash
cd cloudflare-worker
npx wrangler login          # opens the browser, sign in to Cloudflare
npx wrangler deploy         # publishes to uisu.space/* and www.uisu.space/*
```

## Verify

```bash
curl -s -A "facebookexternalhit/1.1" https://uisu.space/communities | grep -i "og:"
curl -sI -A "twitterbot" https://uisu.space/events | grep -i x-prerendered-by
```

You should see the Communities-specific `og:title` / `og:image`, and the
`x-prerendered-by: uisu-cf-worker` header. A normal `curl` (no bot user-agent)
should still return the regular app shell.

After deploying, re-scrape existing links in the Facebook Sharing Debugger,
X Card Validator and LinkedIn Post Inspector so cached old previews refresh.

## Files

- `src/worker.js` — the worker
- `wrangler.toml` — routes + public key config
