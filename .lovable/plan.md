# 30 Suggestions for UISU Archive Platform

## 10 Changes (Improvements to existing features)

1. **Fix missing useEffect dependency** -- `Index.tsx` line 295: `fetchUpcomingEvents` is missing from the dependency array of the useEffect that calls it, causing potential stale closures.
2. **Add AbortController to Index.tsx fetches** -- The console shows `AbortError: signal is aborted without reason` for announcements, executives, and events fetches. Add AbortControllers to `fetchExecutives` and `fetchUpcomingEvents` so unmount cancels in-flight requests cleanly instead of logging errors.
3. **Replace social media placeholder hrefs** -- Footer social icons (`Facebook`, `Twitter`, `Instagram`, `LinkedIn`) all link to `href="#"`. Replace with actual UISU social media URLs or remove the dead links.
4. **Improve mobile navbar search access** -- The mobile navbar has no search button (desktop has one). Add a search icon next to the menu toggle on mobile for parity.
5. **Add loading state to contact form submit button** -- The contact form shows "Sending..." text but no spinner. Add a `Loader2` icon for visual consistency with other loading states across the app.
6. **Consolidate auth state listeners** -- `Index.tsx` has both `onAuthStateChange` and `getSession` for auth. Several other pages repeat this pattern. Extract into a shared `useAuth` hook to reduce duplication.
7. **Make admin link role-aware on mobile** -- The "Admin" link in the navbar is `hidden xl:block` and only checks `user` existence, not `isStaff`. Non-admin authenticated users see the link on desktop. This should check the actual role.
8. **Add SEO breadcrumbs to more pages** -- Only `CommunitiesPage` has breadcrumb structured data. Add `breadcrumbs` prop to SEO on Events, Documents, Inks Vault, Halls, and Tutorial pages for better search engine indexing.
9. **Truncate long parallax card subtitles on small screens** -- The parallax card section scrolls horizontally with fixed 256px cards. On very small screens the text can overflow. Add `truncate` to the subtitle `<p>` element.
10. **Persist newsletter email input across footer/newsletter section** -- Both the Footer and `NewsletterSection` have separate email subscription forms. Unify state or deduplicate so users don't encounter two different subscribe experiences.

---

## 10 Corrections (Bugs and issues to fix)

1. **AbortError console spam on homepage** -- Fetches for announcements, executives, and events throw `AbortError` on component unmount. Wrap Supabase calls with `AbortController` and ignore abort errors in catch blocks.
2. **Missing dependency in useEffect** -- `fetchUpcomingEvents` is called inside a `useEffect` that only lists `fetchExecutives` in its dependency array.
3. **Social share URLs may be wrong for relative paths** -- `SocialShare.tsx` constructs share URLs using `window.location.href`. If the component is rendered in a modal rather than on the target page's route, the shared URL will be incorrect. Pass explicit `url` prop instead.
4. **Admin link visible to all authenticated users** -- Line 186 of `Navbar.tsx` shows `{user && <Link to="/admin">}`. Any logged-in user sees the Admin link, even non-staff. Should check `isStaff` from `useAdminCheck`.
5. **OG image paths point to non-existent directories** -- SEO components reference `/og/pages-screenshot/events.png` but the actual files are at `/og/og-events.png`. This causes broken social preview images.
6. **Footer copyright says "UISU Archive"** -- The platform has been rebranded to "UISU SPACE" (as seen in SEO component), but the footer still says "UISU Archive".
7. **Marquee text not accessible** -- The scrolling marquee has no `aria-label` or `role` attribute, making it invisible/confusing to screen readers. Add `role="marquee"` and `aria-label`.
8. **Event date timezone inconsistency** -- `fetchUpcomingEvents` splits ISO date with `split('T')[0]` for comparison, which can miss events on the current day depending on timezone offset. Use `date-fns` `startOfDay` for consistent handling.
9. **No error boundary around lazy-loaded routes** -- If a lazy-loaded page chunk fails to load (network issue), the app crashes with no recovery. Add a React error boundary with a retry button around `Suspense`.
10. **Profile page missing null checks** -- `ProfilePage.tsx` interface declares most fields as nullable but the UI may not gracefully handle all-null profiles for new users who haven't completed onboarding.

---

## 10 New Features

1. **Recently Visited Pages Widget** -- Track the last 5 visited routes in `useAppStore` (currently only stores `lastVisitedRoute`). Show a "Recent Pages" dropdown or chips on the homepage.
2. **Content Scheduling UI** -- The `scheduled_at` column was added to announcements and ink_pieces. Build admin UI: a date/time picker on the create/edit forms, and filter logic so scheduled content doesn't appear publicly until the scheduled time.
3. **Audit Log Viewer Page** -- Build a full `/admin/audit-log` page with a searchable, filterable table of admin actions. The `AuditLogDetailsModal` already exists; wire it into a dedicated tab or page.
4. **Export Study Materials as PDF** -- Upgrade the StudyBuddy and Flashcard export to generate styled PDFs using `jspdf` (already installed) alongside plain text files.
5. **PWA Install Prompt** -- The project already has `sw.js`. Add a "Install App" banner or button that triggers the browser's `beforeinstallprompt` event, letting users add UISU SPACE to their home screen.
6. **Onboarding Tour for New Users** -- After first sign-up, show a brief 4-5 step guided tour (tooltip-based) highlighting key features: Search, Command Palette (Ctrl+K), Resources, and Profile setup. Track completion in the user's profile or `appData` store.

---

## Summary


| Category               | Count | Complexity     |
| ---------------------- | ----- | -------------- |
| Changes (improvements) | 10    | Low to Medium  |
| Corrections (bugs)     | 10    | Low            |
| New Features           | 6     | Medium to High |
