- 28 Suggestions for the UISU Archive Platform

Here are 28 actionable improvements organized by category, from quick wins to larger features.

---

## UX and Accessibility (1-5)

1. **Skeleton Loading States** - Replace the generic spinning loader fallback with page-specific skeleton screens (e.g., card grids for Leaders, text blocks for Inks Vault) for a smoother perceived loading experience.
2. **Keyboard Shortcuts** - Add global keyboard shortcuts: `/` to focus search, `Esc` to close modals, `Ctrl+K` for command palette (using the already-installed `cmdk` package).
3. **Responsive Image Optimization** - Use `srcSet` and lazy loading for images across the site (leader photos, club logos, Inks Vault cover images) to improve mobile performance.

---

## Content and Engagement (6-10)

6. **Estimated Read Time** - Display estimated read time on Inks Vault articles and tutorial cards (calculated from word count).
7. **Content Reactions Beyond Likes** - Expand the existing like button to include emoji reactions (insightful, fire, clap, love) on Inks Vault pieces and announcements.
8. **Related Content Suggestions** - On Inks Vault piece pages, show a "You might also enjoy" section based on matching tags or content type.

---

## Navigation and Discovery (11-15)

11. **Breadcrumb Improvements** - The Breadcrumbs component exists but ensure it's consistently used across all nested pages (Hall details, Committee details, Tutorial details, Form responses).
12. **Sitemap / Directory Page** - Create a visual site directory page listing all available pages and features, helpful for new users to discover the full platform.

---

## AI and Study Tools (16-20)

16. **StudyBuddy Chat History** - Persist past StudyBuddy sessions in the database so students can revisit previous explanations and study plans.
17. **Export Study Materials** - Let users export StudyBuddy responses, flashcards, and quiz results as PDF or share via link.
18. **Spaced Repetition for Flashcards** - Implement a basic spaced repetition algorithm (SM-2) so flashcards users got wrong appear more frequently in future sessions.
  &nbsp;

21. **User Activity Feed** - Show a feed of recent activity on the platform: new Inks Vault publications, upcoming events, new announcements -- displayed as a timeline widget on the homepage or profile.
22. **Share to WhatsApp/Twitter** - Add sharing buttons for Inks Vault articles, events, and announcements. The `SocialShare` component exists but ensure it's integrated everywhere relevant.
23. **Event Reminders** - After RSVP-ing to an event, let users opt into a reminder notification (email or push) 24 hours and 1 hour before the event.
24. **Anonymous Feedback Channel** - Add a simple anonymous suggestion box (separate from complaints) where students can submit quick feedback to the union without signing in.

---

## Admin and Operations (25-28)

25. **Admin Analytics Dashboard** - Show key metrics on the admin dashboard: total users, page views, most-read articles, event attendance rates, and active form submissions using charts (Recharts is already installed).
26. **Content Scheduling** - Allow admins to schedule announcements, Inks Vault publications, and events to go live at a future date/time rather than publishing immediately.
27. **Bulk Email from Newsletter** - Enhance the newsletter system to support audience segmentation (by faculty, year, hall) so announcements reach the right students.
28. **Audit Log Viewer** - The `AuditLogDetailsModal` component exists. Build a full audit log page in the admin dashboard showing a searchable, filterable timeline of all admin actions (content edits, user role changes, deletions).

---

## Summary


| Category                 | Items | Complexity Range |
| ------------------------ | ----- | ---------------- |
| UX and Accessibility     | 1-5   | Low to Medium    |
| Content and Engagement   | 6-10  | Low to Medium    |
| Navigation and Discovery | 11-15 | Low to Medium    |
| AI and Study Tools       | 16-20 | Medium to High   |
| Community and Social     | 21-24 | Medium           |
| Admin and Operations     | 25-28 | Medium to High   |


These suggestions build on the existing architecture (Zustand store, Lovable Cloud backend, Framer Motion, Recharts) and follow the project's patterns. Let me know which ones you'd like to prioritize and I'll create a detailed implementation plan.