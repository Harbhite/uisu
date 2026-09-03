# BakendUP — Backend Backup

Snapshot of the Lovable Cloud backend code for UISU SPACE.

## Contents

| Path | What it is |
|---|---|
| `live/supabase/` | The **live** backend as currently deployed: `config.toml`, all 32 edge functions, and the applied migrations |
| `live/supabase/functions/` | Edge functions (ai-quiz, study-buddy, send-newsletter, chain-*, lf-*, etc.) |
| `live/supabase/migrations/` | Database migrations |
| `supabase/` | Secondary/reference copy of functions + migrations (47 migration files) |
| `supabase-client-reference.ts` | The generated Supabase client config used by the frontend |

## What is NOT included (and how to get it)

- **Table data / full database dump** — use Cloud → Advanced settings → **Export data** in the Lovable UI (export-only, no import UI).
- **Secrets** (API keys, relayer key, etc.) — stored encrypted in the backend; not exportable.
- **Auth users** — included in the Cloud data export.

## Restoring

1. Recreate tables/policies by running the SQL in `live/supabase/migrations/` in order.
2. Redeploy each function in `live/supabase/functions/`.
3. Re-add secrets via the Lovable secrets UI.
