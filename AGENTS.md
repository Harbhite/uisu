# Project Architecture Rules

- Public RSVP totals and the published top-ten quiz leaderboard use read-only, bounded security-definer functions while raw records stay owner/staff scoped, preserving public features without exposing private record details.