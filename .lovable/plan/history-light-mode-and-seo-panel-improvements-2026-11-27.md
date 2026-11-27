# History Light Mode and SEO Panel Improvements

## What will change
- Add a light/dark switch to the University History page and remember the visitor’s choice on that device.
- Expand the administrator SEO panel with at least four practical tools:
  1. Select a registered page and preview its final title and description using the same rules as browser and crawler metadata.
  2. Preview the Google search snippet and show title/description length guidance.
  3. Preview the page’s social share card with its actual registered image.
  4. Audit registered pages for missing metadata and out-of-range title/description lengths.
  5. Copy the selected page’s Open Graph and Twitter metadata tags.

## Technical details
- Keep SEO previews derived from `routeMetadata` and shared title/description rules; do not change saved settings, permissions, database schema, or unrelated scan findings.
- Keep the History theme state local to the History page and persist only its light/dark selection in local storage.
- Use existing design-system controls and add focused checks for the new preview/audit behavior.

## Verification
- Exercise the History toggle in both modes and confirm the saved choice survives a reload.
- Select multiple SEO routes, compare generated preview data with shared metadata rules, and verify the copy action.
- Check the 360px viewport and review the latest preview diagnostics.