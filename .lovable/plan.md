

# Redesign: Confessions + Elections Pages

Rebuild both pages to match the modern rounded aesthetic (rounded-2xl cards, rounded-full buttons/pills, rounded-xl inputs, stat pills in hero header).

---

## 1. Confessions Page

**Hero header redesign**
- Add stat pills: total confessions count, pending moderation count, total reactions count
- Change back button from `rounded-sm` to `rounded-full`
- Add a subtle icon/illustration

**Submit box**
- Card: `rounded-2xl` (currently `rounded-lg`)
- Textarea: `rounded-xl`
- Submit button: `rounded-full`
- Character counter as a pill badge

**Confession cards**
- Cards: `rounded-2xl` with hover shadow transition (currently `rounded-lg`)
- Reaction buttons already `rounded-full` — keep
- Admin action buttons: `rounded-full`
- Reply thread container: `rounded-xl` with softer border
- Pending badge: `rounded-full` pill style

**Empty state**
- Rounded illustration container

---

## 2. Elections Page

**Hero header redesign**
- Add stat pills: total elections, active elections, total votes cast
- Back button: `rounded-full`

**Elections list cards**
- Already `rounded-2xl` — keep
- Status badges: ensure `rounded-full`
- Add subtle gradient or accent border on active elections

**Election detail view**
- Candidate cards: already `rounded-2xl` — keep
- Vote button: `rounded-full`
- Vote progress bar: already `rounded-full` — keep
- "Add Candidate" and admin buttons: `rounded-full`

**Dialogs**
- Already `rounded-2xl` — keep
- All inputs inside dialogs: `rounded-xl`
- Dialog buttons: `rounded-full`

---

## Files Modified

| File | Change |
|---|---|
| `src/pages/ConfessionsPage.tsx` | Full UI refresh with rounded tokens and stat pills |
| `src/pages/ElectionsPage.tsx` | Rounded buttons/inputs, stat pills in hero |

No database or backend changes needed.

