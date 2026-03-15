# Standalone AI Study Tools

Self-contained AI Quiz and Flashcard generators, extracted for use in any React + Vite project.

## Features

### AI Quiz
- Generate multiple-choice questions (up to 200) from text, files, or images
- Three difficulty modes: Standard, Strict, Rigid
- Timer, question map, auto-advance
- Review mode with explanations
- Export results as TXT, PDF, or DOCX

### AI Flashcards
- Generate flashcards from any topic or material
- SM-2 spaced repetition algorithm
- Flip-card interface with mastery tracking
- Difficulty filtering (Easy, Medium, Hard)
- Dedicated SR review mode
- Export as TXT, PDF, or DOCX

## Setup

### 1. Install Dependencies

```bash
npm install framer-motion jspdf docx file-saver lucide-react sonner
npm install -D @types/file-saver
```

### 2. Deploy Edge Functions

Deploy the two edge functions from `edge-functions/` to your Supabase project (or any Deno-compatible serverless platform):

```
edge-functions/ai-quiz/index.ts      → POST /api/ai-quiz
edge-functions/flashcard-gen/index.ts → POST /api/flashcard-gen
```

Each function requires a `LOVABLE_API_KEY` environment variable (or `QWEN_API_KEY` as fallback).

### 3. Configure API Endpoint

In both page components, the API calls use `fetch('/api/ai-quiz', ...)` and `fetch('/api/flashcard-gen', ...)`.

Update these URLs to match your deployment:

```typescript
// Example: if using Supabase Edge Functions
const response = await fetch('https://YOUR_PROJECT.supabase.co/functions/v1/ai-quiz', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer YOUR_ANON_KEY' },
  body: JSON.stringify({ material, rigidity, count }),
});
```

### 4. Add to Your Router

```tsx
import AIQuizPage from './standalone-ai-tools/pages/AIQuizPage';
import FlashcardPage from './standalone-ai-tools/pages/FlashcardPage';

// In your router config:
<Route path="/quiz" element={<AIQuizPage />} />
<Route path="/flashcards" element={<FlashcardPage />} />
```

### 5. Tailwind CSS

These components use standard Tailwind CSS utility classes. Ensure your `tailwind.config` includes the `standalone-ai-tools/` directory in its content paths:

```js
content: ['./standalone-ai-tools/**/*.{ts,tsx}'],
```

## File Structure

```
standalone-ai-tools/
├── README.md
├── components/
│   └── AIToolsHeader.tsx        # Minimal header component
├── pages/
│   ├── AIQuizPage.tsx           # Quiz page (no router/supabase deps)
│   └── FlashcardPage.tsx        # Flashcard page (no router/supabase deps)
└── edge-functions/
    ├── ai-quiz/
    │   └── index.ts             # Deno edge function for quiz generation
    └── flashcard-gen/
        └── index.ts             # Deno edge function for flashcard generation
```

## License

MIT — use freely in any project.
