# 6 New Features for the Constitution Page

The current page has search, scroll spy, font sizing, print, citation links, and an amendments ledger. Here are 6 features that would meaningfully extend it:

---

## 1. Full Document Export (PDF, DOCX, TXT)

Add an export dropdown (matching the pattern already used in StudyBuddy/Flashcards) to the sidebar. Users can download the entire constitution or just the currently viewed article in PDF, DOCX, or TXT format using `jspdf`, `docx`, and `file-saver`.

**File:** `ConstitutionPage.tsx`

## 2. Dark Mode / Night Reading Toggle

Add a toggle in the sidebar that switches the page to a dark background with light text. Store preference in `localStorage`. This is a reading-heavy page, so a dark mode is practical.

**File:** `ConstitutionPage.tsx`

## 3. Article Bookmarks with LocalStorage

Let users bookmark specific articles. Show a small bookmark icon on each article header. Bookmarked articles appear in a collapsible "Bookmarks" section at the top of the sidebar for quick access. Persisted in `localStorage`.

**File:** `ConstitutionPage.tsx`

## 4. Collapsible / Accordion Article Sections

Allow users to collapse individual article sections to reduce visual clutter when reading a long document. Use the existing `Collapsible` component. Default to expanded; clicking the section title toggles it.

**File:** `ConstitutionPage.tsx`

## 5. Mobile Table of Contents Drawer

On mobile/tablet (below `xl`), add a floating "Table of Contents" button that opens a bottom sheet (using the existing `Drawer`/`Sheet` component) with the full article index, mirroring the desktop sidebar navigation.

**File:** `ConstitutionPage.tsx`

## 6. Search Result Highlighting

When a search query matches text inside an article, highlight the matching words in yellow within the article content (not just filter articles). This helps users quickly locate the exact clause they are looking for.

**File:** `ConstitutionPage.tsx`

---

## Implementation Notes

- All 6 features are contained within `ConstitutionPage.tsx` and require no database changes.
- Features 1 uses existing `jspdf`/`docx`/`file-saver` libraries already installed.
- Features 4-5 use existing UI primitives (`Collapsible`, `Drawer`).
- No new dependencies needed.