

# Five New Feature Suggestions + Standalone AI Tools Export

---

## Part 1: Five New Feature Suggestions

1. **Campus Marketplace with Escrow** — Extend `StudentMartPage` into a full peer-to-peer marketplace where students can list items for sale, negotiate via in-app chat, and mark items as sold. Add a "verified seller" badge for authenticated users with a profile.

2. **Academic Planner / Timetable Builder** — A drag-and-drop weekly timetable builder where students input their courses, lecture halls, and times. Export to iCal (.ics). Persisted per-user in the database.

3. **Anonymous Confessions / Whisper Board** — A moderated anonymous posting wall where students can share thoughts. Posts go through an AI content moderation filter before appearing. Reactions and threaded replies supported.

4. **Student Elections / Voting System** — A secure voting module for SUG elections. Candidates register, students vote once (verified by auth), results tallied in real-time with live charts. Integrates with the existing Governance section.

5. **Campus Transit / Shuttle Tracker** — A real-time shuttle/bus schedule page showing routes, estimated arrival times, and a simple map view. Students can set alerts for their preferred routes.

---

## Part 2: Clone AI Quiz + Flashcards for Standalone Use

Create a `standalone-ai-tools/` folder at the project root containing self-contained copies of the AI Quiz and Flashcard features, stripped of project-specific dependencies (UISU branding, router, SEO component) and ready to be dropped into any React + Vite project.

### Folder Structure

```text
standalone-ai-tools/
├── README.md                    # Setup instructions
├── components/
│   └── AIToolsHeader.tsx        # Simplified header (no router nav)
├── pages/
│   ├── AIQuizPage.tsx           # Standalone quiz page
│   └── FlashcardPage.tsx        # Standalone flashcard page
└── edge-functions/
    ├── ai-quiz/
    │   └── index.ts             # Copy of supabase/functions/ai-quiz
    └── flashcard-gen/
        └── index.ts             # Copy of supabase/functions/flashcard-gen
```

### What changes in the cloned files

- **Remove** imports of `SEO`, `useNavigate`, `supabase` client, and `AIToolsHeader` (replaced with a minimal local header or removed).
- **Replace** `supabase.functions.invoke('ai-quiz', ...)` with a generic `fetch('/api/ai-quiz', ...)` pattern so the consumer can wire their own backend.
- **Strip** UISU-specific color classes and replace with neutral Tailwind defaults.
- **Keep** all core logic intact: SM-2 algorithm, quiz state machine, export (PDF/DOCX/TXT), timer, review mode, spaced repetition.
- **Edge functions** copied as-is (they are already standalone Deno functions).
- **README.md** documents: required dependencies (`framer-motion`, `jspdf`, `docx`, `file-saver`, `lucide-react`), how to deploy the edge functions, and how to integrate the pages into any React router.

### Files to create (7 files)

| File | Source | Notes |
|---|---|---|
| `standalone-ai-tools/README.md` | New | Setup guide |
| `standalone-ai-tools/pages/AIQuizPage.tsx` | From `src/pages/resources/AIQuizPage.tsx` | De-coupled from project |
| `standalone-ai-tools/pages/FlashcardPage.tsx` | From `src/pages/resources/FlashcardPage.tsx` | De-coupled from project |
| `standalone-ai-tools/components/AIToolsHeader.tsx` | From `src/components/resources/AIToolsHeader.tsx` | Simplified, no router |
| `standalone-ai-tools/edge-functions/ai-quiz/index.ts` | From `supabase/functions/ai-quiz/index.ts` | Direct copy |
| `standalone-ai-tools/edge-functions/flashcard-gen/index.ts` | From `supabase/functions/flashcard-gen/index.ts` | Direct copy |

No database changes required. No modifications to existing project files.

