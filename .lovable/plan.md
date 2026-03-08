

# Tutorials System: 20 Fixes & Features

After reviewing the entire tutorials codebase, here are 10 fixes and 10 features organized by priority.

---

## Fixes (10)

### 1. Upload form is fake (no backend)
The `UploadTutorialPage` uses a `setTimeout` mock instead of actually inserting into the `tutorials` table. Form field values are not even captured in state. Wire it to the database with proper auth.

### 2. Module index formatting breaks past 9 modules
`CoursePlayer` uses `0${index + 1}` which renders "010", "011" etc. for modules 10+. Use proper zero-padding.

### 3. Category links don't filter the catalog
Each category card on the landing page links to `/tutorials/catalog` without passing any filter param. Should pass a query param like `?tag=Academic` and the catalog page should read it.

### 4. Progress bar in TutorialReader uses `window.scrollY` but content is in a scrollable div
The reader is inside the `CoursePlayer` which uses `overflow-y-auto` on a flex child, not `window` scroll. The progress calculation will always be 0 or wrong.

### 5. Bookmark and Share buttons in TutorialReader are non-functional
Both are rendered but have no `onClick` handlers.

### 6. `controlsTimeout` in CustomMediaPlayer is a local variable, not a ref
It gets re-created each render, so `clearTimeout` never actually clears the previous timeout. Should use `useRef`.

### 7. "Last updated" in TutorialReader is hardcoded to "Oct 24, 2024"
Should derive from actual data or be hidden.

### 8. Search bar in TutorialsLayout header is non-functional
The search input in the top header bar has no state or handler wired up.

### 9. "My Profile" sidebar link goes to `/tutorials/profile` but no route exists for it
The route is `/tutorials/tutor/:id`, so this link leads to a 404 or empty page for non-tutors.

### 10. Empty state when no modules exist causes crash
`CoursePlayer` does `tutorial.modules[0]?.id` for initial state, but if modules is empty, `activeModule` is undefined and the "Select a module" fallback shows. However, there is no guard preventing the "Next" button from being rendered in contexts where it would error.

---

## Features (10)

### 11. Tutorial progress tracking
Track which modules a user has completed using a `tutorial_progress` table. Show a progress bar on each `TutorialCard` and the course player sidebar.

### 12. Tutorial reviews and ratings
Allow authenticated users to leave a star rating and text review on tutorials. Create a `tutorial_reviews` table and display reviews below the course player.

### 13. Tutorial notes / annotations
Let users take notes while watching/reading a module. Store per-module notes in a `tutorial_notes` table. Show a collapsible notes panel in the course player.

### 14. Certificate of completion
When a user completes all modules, generate a downloadable PDF certificate with their name, tutorial title, and date.

### 15. Tutorial search in the layout header
Wire the search input in `TutorialsLayout` header to navigate to `/tutorials/catalog?q=<query>` and auto-populate the catalog search field.

### 16. Sort options for catalog
Add sort-by dropdown (Newest, Highest Rated, Most Students) to the catalog page.

### 17. Related tutorials section
On the tutorial detail page, show 3 related tutorials based on matching tags or same tutor below the course player.

### 18. Module completion checkmarks
Show a check icon next to completed modules in the sidebar. Persist completion state in the progress tracking table.

### 19. "Continue where you left off" on landing page
If a user has in-progress tutorials, show a "Continue Learning" section at the top of the dashboard with the last accessed tutorial and module.

### 20. Tutorial export (PDF/DOCX)
For text and essay modules, allow users to export module content as PDF or DOCX using the same export pattern already built for Quiz/StudyBuddy/Flashcards.

---

## Implementation Approach

**Database migrations needed** for fixes #1 and features #11-13:
- Fix upload form: insert into existing `tutorials` table
- `tutorial_progress` table (user_id, tutorial_id, module_id, completed_at)
- `tutorial_reviews` table (user_id, tutorial_id, rating, comment, created_at)
- `tutorial_notes` table (user_id, module_id, content, updated_at)

**Files to modify:**
- `UploadTutorialPage.tsx` — wire to real DB
- `CoursePlayer.tsx` — fix index formatting, progress tracking, module checkmarks
- `TutorialReader.tsx` — fix scroll progress, share/bookmark, hardcoded date
- `CustomMediaPlayer.tsx` — fix timeout ref
- `TutorialsLandingPage.tsx` — category filter params, continue learning
- `TutorialCatalogPage.tsx` — read query params, add sort
- `TutorialDetailPage.tsx` — related tutorials, reviews section
- `TutorialsLayout.tsx` — wire search, fix profile link
- New: certificate generation utility

All 20 items can be implemented incrementally. Shall I proceed?

