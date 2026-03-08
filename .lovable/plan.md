

# Gazette System — Full Build Plan

A hybrid student newspaper and official notices platform with an editorial board, issue-based publishing, categories, PDF archives, and full reader engagement features.

---

## Database Schema (6 new tables)

### `gazette_issues`
Editions/volumes: `id`, `volume_number`, `issue_number`, `title`, `description`, `cover_image`, `published_at`, `status` (draft/published/archived), `created_by`, `created_at`, `updated_at`.

### `gazette_articles`
Individual articles: `id`, `issue_id` (nullable — standalone articles), `title`, `slug`, `content` (jsonb, EditorJS format), `summary`, `cover_image`, `category` (News/Opinion/Sports/Campus Life/Official Notice/Resolution/Minutes), `article_type` (editorial/notice), `author_id`, `author_name`, `is_published`, `is_featured`, `view_count`, `reading_time`, `tags[]`, `published_at`, `created_at`, `updated_at`.

### `gazette_comments`
`id`, `article_id`, `user_id`, `content`, `created_at`, `updated_at`. RLS: auth users insert own, everyone reads on published articles, users delete own or staff delete any.

### `gazette_reactions`
`id`, `article_id`, `user_id`, `reaction_type` (like/love/insightful/agree/disagree), `created_at`. Unique constraint on (article_id, user_id, reaction_type).

### `gazette_bookmarks`
`id`, `article_id`, `user_id`, `created_at`. Users manage own bookmarks.

### `editorial_board`
`id`, `user_id`, `role` (editor_in_chief/editor/contributor/columnist), `display_name`, `bio`, `avatar_url`, `is_active`, `created_at`. Staff manage; public read.

---

## Pages & Routes

| Route | Component | Purpose |
|---|---|---|
| `/gazette` | `GazetteLandingPage` | Hero with latest issue, featured articles, category grid, newsletter CTA |
| `/gazette/issues` | `GazetteIssuesPage` | Archive of all issues with covers, filterable by year |
| `/gazette/issues/:id` | `GazetteIssuePage` | Table of contents for a single issue |
| `/gazette/article/:slug` | `GazetteArticlePage` | Full article reader with comments, reactions, sharing, bookmarks |
| `/gazette/category/:cat` | `GazetteCategoryPage` | Articles filtered by category |
| `/gazette/editorial-board` | `EditorialBoardPage` | Meet the team |
| `/gazette/bookmarks` | `GazetteBookmarksPage` | User's saved articles (auth required) |
| `/gazette/editor/new` | `GazetteEditorPage` | Article composer (editorial board only) |
| `/gazette/editor/:id` | `GazetteEditorPage` | Edit existing article |

All routes nested under a `GazetteLayout` (like TutorialsLayout) with its own header, sidebar nav, and branding.

---

## Key Components

- **GazetteLayout** — Shared header with search, category nav, and gazette branding. Mirrors `TutorialsLayout` pattern.
- **GazetteArticleCard** — Card with cover image, category badge, reading time, author, date.
- **GazetteArticleReader** — Full article view reusing EditorJS block rendering from `InksPiecePage`. Includes `SocialShare`, `ReactionBar`, comments section, and bookmark toggle.
- **GazetteEditorPage** — Reuses the existing `EditorJS` component for rich content authoring. Issue assignment dropdown, category picker, featured toggle.
- **GazetteIssueCover** — Visual card showing issue cover, volume/issue number, date, article count.
- **GazettePDFUpload** — Upload/download PDF editions to the existing `documents` storage bucket with a `gazette-pdfs` prefix.

---

## Editorial Board Access Control

- New entries in `editorial_board` table linked to `user_id`.
- A `is_gazette_editor` security definer function checks if a user has an active editorial_board row.
- Article create/update RLS uses this function. Staff (admin/moderator) also have full access.
- Contributors submit as draft; editors can publish.

---

## Reader Features

1. **Comments** — Same pattern as `InkComments`, new `gazette_comments` table.
2. **Reactions** — Reuse `ReactionBar` component pattern from Inks Vault.
3. **Bookmarks** — Toggle button on articles, stored in `gazette_bookmarks`. Bookmarks page lists saved articles.
4. **Social Sharing** — Reuse existing `SocialShare` component with article title and URL.
5. **Newsletter Digest** — Weekly cron job via edge function that queries articles published in the last 7 days and sends a digest email to `newsletter_subscribers` using the existing Resend integration.
6. **PDF Archive** — Upload full PDF editions; displayed on the issues archive page with download links.

---

## Admin Dashboard Integration

Add a "Gazette" tab to the existing Admin Dashboard for:
- Managing issues (create, publish, archive)
- Reviewing submitted articles (approve/reject drafts from contributors)
- Managing editorial board members
- Viewing article analytics (views, reactions, comments)

---

## Implementation Order

1. **Database migration** — Create all 6 tables with RLS policies and the `is_gazette_editor` function
2. **GazetteLayout + Landing Page** — Shared layout and main entry point
3. **Article system** — Editor page, article reader, category pages
4. **Issues system** — Issue management, issue detail page, PDF upload
5. **Reader engagement** — Comments, reactions, bookmarks, social sharing
6. **Editorial board** — Board page, access control integration
7. **Admin integration** — Gazette tab in AdminDashboard
8. **Newsletter digest** — Edge function + cron schedule
9. **Route registration** — Add all routes to `App.tsx`

**Estimated scope**: ~12 new files, 1 migration, 1 edge function, modifications to `App.tsx` and `AdminDashboard.tsx`.

