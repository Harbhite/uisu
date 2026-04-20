# 15 Innovations & Fixes Across UISU Space

A mix of new features, UX polish, and technical fixes spanning AI tools, community, governance, and infrastructure.

## New Features

**1. Quizlet Leaderboards & Streaks**
Add a leaderboard per quizlet showing top scorers (by attempt time + accuracy), plus a personal streak counter for daily quiz attempts. Drives engagement on `/resources/quizlets`.

**2. Flashcard Study Groups**
Let users create shared flashcard decks that classmates can join via invite link. Real-time sync of new cards using Supabase Realtime on a new `flashcard_decks` + `deck_members` table.

**3. AI Essay/Assignment Checker**  
New resource tool at `/resources/essay-check`. Upload an essay, pick criteria (grammar, structure, citations, argument strength), get structured feedback with highlighted excerpts. Reuses the Gemini edge function pattern.

**7. Exam Countdown Widget**
Homepage widget showing days until next registered exam (pulled from Academic Planner). Nudges student to open study tools.

## Fixes & Polish

**8. Quizlets Delete/Archive for Authors**
Currently staff can edit, but quiz authors can't remove their own quizlets. Add delete button (with confirmation) for `created_by = auth.uid()` + staff.

**9. Multi-file Upload Progress per File**
`multi-file-utils.ts` processes files sequentially but shows a single global spinner. Show per-file status (pending/processing/done/error) so users know which PDF is slow.

&nbsp;

**14. Image Compression Before Upload**
Lost & Found, Student Mart, and AI tool image uploads send raw images (often 5MB+ from phones). Add client-side compression (browser-image-compression) to cap at ~800KB.

**15. Global Error Reporting Hook**  
`ErrorBoundary` logs to console only. Add a lightweight Supabase `error_logs` table + edge function to capture runtime errors with route, user, and stack for staff triage