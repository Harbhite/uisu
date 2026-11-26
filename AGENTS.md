# Project Architecture Rules

- Public RSVP totals and the published top-ten quiz leaderboard use read-only, bounded security-definer functions while raw records stay owner/staff scoped, preserving public features without exposing private record details.
- Public Lost & Found reads use a safe listing function while full item records stay owner/staff scoped, keeping found-item contact details private.
- Public profile, tutor, and approved-review details use narrow views while raw records stay owner/staff scoped.
- Public reaction totals use read-only functions while raw reaction rows stay owner/staff scoped.
- Sitewide SEO settings live in the public-readable, administrator-writable `site_seo_settings` record and are consumed by the shared `SiteSeoProvider` and the prerender function so browser and crawler tags stay aligned.
- Browser and crawler metadata use the pure rules and route registry in `supabase/functions/_shared/siteSeo.ts`; route fallback SEO precedes page-specific SEO and static head tags are Helmet-owned to prevent stale duplicates.
