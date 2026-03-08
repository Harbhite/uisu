

# Replace Global Loading Spinner with Animated UISU Branded Loader

## What
Replace the plain `Loader2` spinning icon with a custom animated loading component that uses the UISU logo mark and smooth motion — applied globally across all loading states.

## Design
A pulsing/morphing UISU-branded loader:
- Three concentric rings that rotate at different speeds with the accent gold color
- A subtle scale pulse on the center dot
- "Loading..." text below with a typing/fade animation
- Keeps the same `size` prop API (`sm`, `md`, `lg`) for drop-in compatibility

## Changes

### 1. Rewrite `src/components/ui/LoadingSpinner.tsx`
Replace the `Loader2` icon with a custom SVG animation:
- Three concentric circles with staggered `rotate` animations via Framer Motion
- Center dot with a pulse effect
- Optional "Loading..." label for `md` and `lg` sizes
- Uses the existing accent color (`text-accent` / gold)
- Same interface: `size?: "sm" | "md" | "lg"`, `className?: string`

### 2. Update `LoadingFallback` in `src/App.tsx`
Replace the inline `border-4 border-primary border-t-transparent rounded-full animate-spin` spinner with `<LoadingSpinner size="lg" />`.

### 3. No changes needed to consumer files
Since `LoadingSpinner` keeps the same export name and props, all 4 consumer files (`CareerHubPage`, `ScholarshipPage`, `InksPiecePage`, `PendingSubmissions`) work automatically.

The ~50+ inline `Loader2 animate-spin` usages across the codebase are contextual button/section spinners and will remain as-is — this change targets full-page/section loading states only.

