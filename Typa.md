# UISU SPACE — Comprehensive Website Report

**Repository:** [`Harbhite/uisu`](https://github.com/Harbhite/uisu)  
**Assessed revision:** `64263cd` on `main`  
**Assessment date:** 11 August 2026  
**Prepared by:** Manus AI  
**Assessment method:** Repository and build audit; no authenticated production session was used.

> **Purpose.** This report documents the current UISU SPACE codebase as a product, technical system, and operational platform. It is grounded in the reviewed `main`-branch source code and its bundled build output. Where an observation depends on runtime services, it is identified as an implementation-level finding rather than a claim that the live service was exercised.

## Executive Summary

**UISU SPACE** is an unusually broad digital platform for the University of Ibadan Students' Union. Rather than operating as a conventional institutional website, it combines a heritage archive, student-services portal, governance information system, publication suite, peer-learning environment, engagement layer, and administrative back office. The homepage frames the product around union history, leadership, events, community, and the “Aluta” identity, while the rest of the application expands into more than ninety declared routes covering academic, social, welfare, editorial, and administrative use cases.[1]

The platform’s greatest strength is its **product ambition and feature coverage**. Its implementation includes a dedicated Gazette, a separately branded Tutorials experience, AI-assisted study tools, resource discovery, event workflows, newsletters, forms, elections, lost-and-found, feedback, academic planning, governance, and an administrator dashboard. The codebase is also architected as a modern React single-page application backed by Supabase, with lazy-loaded pages, role checks, error capture, PWA support, and a large migration history.

The principal maturity constraint is **operational quality rather than product scope**. The production build completes, but the checked-in npm lockfile is not reproducible with `npm ci`; linting fails with **304 errors and 50 warnings**; the repository contains only one narrow browser test, which is not self-contained; and the build outputs a very large initial JavaScript asset of approximately **4.22 MiB uncompressed / 2.12 MiB gzip**. Security hygiene also needs immediate attention: `.env` is tracked, while the Vite configuration explicitly maps `GEMINI_API_KEY` into client-side build-time definitions.[2] [3]

| Dimension | Assessment | Rationale |
|---|---|---|
| Product breadth | **Excellent** | A connected union ecosystem spans governance, resources, media, learning, engagement, and staff operations. |
| Experience design | **Strong** | A consistent navy/gold newsroom style, responsive layouts, motion, separate sub-product identities, and discovery tools are evident in source. |
| Architecture | **Strong, but complex** | React, Vite, code splitting, Supabase, TypeScript, and modular source structure provide a capable foundation. |
| Backend readiness | **Substantial** | 33 edge-function implementations, 67 migrations, and many data domains support feature depth; operational verification remains necessary. |
| Quality assurance | **Needs improvement** | The build succeeds, but lint and browser-test readiness are currently below release-grade expectations. |
| Security posture | **Priority remediation required** | Tracked environment configuration and potential client exposure of a Gemini key should be addressed before any public release. |

## 1. Product Definition and Intended Audience

The project describes itself as the official digital platform for the University of Ibadan Students' Union. Its stated purpose is to preserve union legacy while modernizing student access to leaders, services, publications, academic support, and community workflows.[4] In practical terms, UISU SPACE is designed for at least four audience groups: general students who need information and utilities; student leaders and staff who publish, coordinate, and moderate; student creators and journalists who contribute content; and alumni or interested visitors who explore history and leadership.

The product’s information architecture reflects that multi-audience model. Public visitors can move from the central landing page into governance, historical content, leaders, halls of residence, events, documents, resources, and publications. Signed-in students can engage with saved content, contributions, study tools, forms, and community features. Staff and moderators have a distinct administrative surface, with client-side role resolution based on an RPC that returns `admin`, `moderator`, or `user`.[5]

## 2. Website Scope and Route Architecture

The central React router declares **92 route elements** and **87 lazy-loaded page or layout modules**, which is a strong indication that this is a full application rather than a marketing site. Route-level lazy loading is correctly used to defer large feature areas until they are visited.[1]

| Domain | Representative journeys | Reported implementation shape |
|---|---|---|
| Home and discovery | `/`, `/search`, `/sitemap`, `/quicklinks`, `/feedback` | Branded homepage, global discovery, recently visited content, onboarding, notifications, and newsletter funnel. |
| Governance and identity | `/governance`, `/constitution`, `/current-leaders`, `/past-leaders`, `/documents`, `/history` | Leadership directories, committee detail, constitution variants, historical and institutional content. |
| Campus life | `/halls`, `/campus-map`, `/communities`, `/events`, `/academic-calendar`, `/budget` | Residence-hall lore, map exploration, clubs, events, calendar, and budget tracking. |
| Resources and productivity | `/resources/*`, `/planner`, `/resources/timetable`, `/resources/gpa-tracker` | Academic-bank, career, scholarship, wellness, freshers, alumni, marketplace, calculators, and planning tools. |
| AI-assisted study | `/resources/study-buddy`, `/ai-quiz`, `/flashcards`, `/essay-check`, `/study-aide`, `/past-questions` | Study output, quiz, flashcard, essay, and past-question flows backed by serverless integrations. |
| Community workflows | `/lost-found`, `/confessions`, `/complaints`, `/polls`, `/elections`, `/forms` | Public or authenticated submissions, moderation-oriented data models, polling, voting, and feedback pathways. |
| Tutorials | `/tutorials`, `/tutorials/catalog`, `/tutorials/:id`, `/tutorials/tutor/:id`, `/tutorials/upload` | A self-contained peer-learning area with its own sidebar, catalog, upload route, tutor profile, and search. |
| Gazette | `/gazette`, `/article/:slug`, `/issues`, `/category/:cat`, `/bookmarks`, `/editor/*` | An editorial product with navigation, issue archive, category pages, saved articles, editorial board, and editor. |
| Staff operations | `/admin`, editor routes, form responses, event check-in | Administrative operations, moderation and content publication, response review, and event management. |

The router is structured defensively. Most pages are rendered inside a shared `PageWrapper`, and the application root includes TanStack Query, tooltip and toast services, an error boundary, a command palette, and a PWA installation prompt.[1] The browser bootstrap also attaches global listeners for uncaught errors and unhandled promise rejections, applying throttling before passing errors to the reporting utility.[6]

## 3. Primary User Experience

### Homepage

The landing page acts as a layered product portal rather than a sparse introduction. It combines a branded marquee, announcements, notification prompt, navigation menu, animated hero, horizontal feature cards, history, union symbols, governance explanation, halls, statistics, trivia, examination countdown, event preview, campus culture, executive preview, newsletter, footer, and return-to-top control.[7] Its hero directs visitors toward six core entry points: leadership, Inks Vault, announcements, history, communities, and halls/campus exploration. Dynamic previews for executives and future events are retrieved from the `leaders` and `events` datasets.[7]

This is a strategically effective approach for a multi-purpose student platform: the homepage does not assume that every visitor arrives with the same task. Its risk is cognitive density. The page is highly feature-rich and motion-heavy, so it should be measured against real mobile-device performance and user-comprehension data before further expansion.

### Resources hub

The Resources hub is the principal utility gateway. It uses a searchable category grid and maps categories to individual pages for academic material, careers, scholarships, wellness, skills, marketplace, freshers’ guidance, alumni, health, calculators, GPA tools, AI study functions, timetables, and past-question support.[8] The layout is clear and task-oriented: a student can discover a service by browsing, typing a search term, or following a contextual prompt into Communities.

### Tutorials and Gazette as specialized experiences

UISU SPACE does not force every function into the same interaction pattern. The **Tutorials** area uses a dedicated desktop sidebar, mobile drawer, internal search, dashboard, catalog, upload, and profile destinations. Its purple-accented interface deliberately differentiates learning from the navy-and-gold main site while maintaining a route back to the parent platform.[9]

The **Gazette** is similarly treated as a distinct publication product. It has an editorial navigation layer for home, issues, board, saved articles, authoring, categories, and search; it supports responsive desktop and mobile menus; and it is explicitly positioned as “Campus news & official notices.”[10] This sub-branding is a notable UX strength because it establishes clear context for content-heavy experiences without fragmenting the overall application.

## 4. Design System and Accessibility Considerations

The visual system is coherent and intentionally institutional. Tailwind extends the platform with **UISU navy** (`#003366`) and **Nobel gold** (`#C5A059`), complemented by cream and slate tones. Playfair Display is designated for serif editorial typography, Inter for interface copy, and Syne for display use.[11] The primary page implementations consistently use these tokens with serif display headings, uppercase micro-labels, generous white space, card grids, and premium shadows.

The site also makes significant use of Framer Motion, animated keyframes, hover transitions, marquees, smooth navigation, and 3D-compatible dependencies. The source shows responsive breakpoints for desktop navigation, mobile drawers, grid adaptation, and mobile-specific controls in the main site, Tutorials, and Gazette.[7] [9] [10]

| Design attribute | Evidence | Assessment |
|---|---|---|
| Brand expression | Navy/gold palette and typography defined centrally in Tailwind. | Strong and easily recognizable. |
| Editorial hierarchy | Serif headers, labels, metadata strips, article-oriented Gazette layout. | Well suited to archive and news content. |
| Responsive navigation | Mobile menus and desktop alternatives in specialized layouts. | Source-level design is promising; device testing is still required. |
| Feedback states | Loading skeletons, toasts, error boundaries, form success/error states. | Good interaction foundation. |
| Potential accessibility work | Motion, 3D scenes, decorative marquee, dense pages, and hover-led affordances require empirical audit. | Add keyboard, screen-reader, reduced-motion, focus-order, and contrast checks. |

The implementation has several positive accessibility signals: semantic headings, form labels, `required` inputs, toasts, skeleton states, and explicit `aria-label` use on the marquee are present on the homepage.[7] However, no automated accessibility test suite or accessibility policy was identified in the reviewed configuration. The next QA phase should include keyboard-only flows and reduced-motion support across the most animated pages.

## 5. Technical Architecture

The application is a TypeScript React 18 single-page application built with Vite. Styling combines Tailwind CSS and a sizeable Radix/Shadcn component base. It uses React Router for client navigation, TanStack Query for data access, Supabase for authentication/data/storage/function invocation, Framer Motion and GSAP for motion, React Three Fiber/Drei for 3D, Editor.js for authoring, and Playwright packages for testing.[3] [4]

| Layer | Implementation | Operational implication |
|---|---|---|
| UI application | React 18, TypeScript, React Router, Vite | Fast local iteration and modular page-based development. |
| Component system | Tailwind, Radix UI, Shadcn-style primitives, Lucide | Consistent reusable UI building blocks across a broad route surface. |
| State and data | TanStack Query, local state, Supabase client, Zustand package | Supports server data and responsive client interactions; data conventions must remain consistent. |
| Rich and visual media | Editor.js, Three.js, React Three Fiber, GSAP, Framer Motion, Mermaid | Enables differentiated content experiences but increases client complexity. |
| Server capabilities | Supabase Postgres/Auth/Storage and edge functions | Allows content, moderation, notifications, AI, elections, and user data without a separate server repository. |
| Resilience | Error boundary, global error reporting, lazy pages, PWA prompt | Good engineering safeguards, though testing is insufficient to validate them fully. |

The application root uses a `QueryClientProvider`, global toasters, tooltip provider, error boundary, `Suspense`, command palette, and PWA-install prompt. Pages are loaded through `React.lazy`, with a central loading fallback.[1] Supabase authentication persists sessions in local storage and refreshes tokens automatically; `AuthContext` also guards against transient sign-out state during token-refresh turbulence.[12] [13]

## 6. Data Model, Serverless Functions, and Operational Workflows

The repository contains **67 database migrations** and **33 edge-function implementation directories**. The migration history includes 74 row-level-security enable statements and 309 policy declarations. This does not independently prove that every currently deployed table has the intended policy, but it demonstrates a serious attempt to apply database-level access controls across a broad set of user and content domains.

The frontend queries a diverse data surface. Among the domains found in source are leaders, events, announcements, academic resources, documents, tutorials, tutors, study progress, jobs, scholarships, marketplace listings, newsletters, forms, polls, elections, complaints, confessions, lost-and-found items, gazette articles, editorial board entries, user profiles, timetables, and quizzes. The platform therefore operates as an integrated student information and engagement system rather than a static archive.

| Operational capability | Supporting implementation | Expected workflow |
|---|---|---|
| Editorial publishing | Inks pieces, Gazette articles/issues/comments/reactions, editors | Students or staff author content; readers browse, search, react, comment, bookmark, or save. |
| Student support | Resources, academic bank, career hub, scholarships, wellness, timetable and GPA tools | Students discover academic and career material, then use calculators, planning, and support utilities. |
| AI study services | `study-buddy`, `ai-quiz`, `flashcard-gen`, `essay-check`, `past-questions-solve`, `study-aide` functions | Input is submitted to a serverless function and the study output is rendered or shared. |
| Community operations | Lost & Found, confessions, complaints, polls, events, forms, feedback | Students submit or participate; moderators and staff review selected workflows. |
| Communications | Newsletter subscription, contact submission, staff notices, form confirmation, tracking | Forms and campaigns are processed through dedicated functions and data models. |
| Elections and voting | Elections/candidates/votes plus blockchain-related functions | The codebase includes both conventional election records and on-chain voting/deployment/tally routes. |

The application calls serverless functions for contact messages, newsletter workflows, AI study features, lost-and-found analysis, document/past-question handling, form notifications, and blockchain voting.[14] The design is ambitious and extensible, but every function that handles personally identifiable information, user-generated content, email delivery, external AI, or electoral activity should be monitored with rate limits, audit trails, strict authorization, and failure telemetry.

## 7. Security and Privacy Assessment

The project contains several sound security-oriented mechanisms. The README declares DOMPurify for user-rendered HTML and row-level security across tables.[4] The Supabase client authenticates with a publishable key and retains sessions with automatic token refresh.[12] Role checks are centralized in a hook that calls `get_user_role` and exposes `isAdmin`, `isModerator`, and `isStaff` flags for frontend behavior.[13]

However, two high-priority configuration findings require remediation:

1. **The repository tracks `.env`.** The file is versioned, while `.gitignore` does not contain an `.env` exclusion. The contents were deliberately not read during this assessment. Any tracked environment file should be treated as potentially exposed, its credentials rotated where necessary, and it should be removed from Git history if it has ever held secrets.
2. **The Vite configuration injects `GEMINI_API_KEY` into `process.env` definitions.** Vite replaces defined values during bundling. If a real Gemini key is supplied in the build environment, that key can become discoverable in a client-delivered JavaScript asset. Direct third-party AI keys must not be exposed to browsers; route all privileged AI access through server-side/edge-function secrets instead.[2]

| Priority | Finding | Why it matters | Recommended action |
|---|---|---|---|
| P0 | Tracked `.env` | Environment files often contain credentials or endpoints that should not be versioned. | Add `.env` and `.env.*` to `.gitignore`, commit an `.env.example`, rotate relevant values, and remove the tracked file/history safely. |
| P0 | Client-side Gemini key definition | Build-time substitution can expose a privileged API key in public JavaScript. | Remove `GEMINI_API_KEY` from Vite `define`; use edge functions with server-side secrets. |
| P1 | Broad user-generated-content surface | Gazette, Inks, forms, confessions, complaints, marketplace, and lost-found need consistent abuse controls. | Review RLS by table, sanitize output, enforce moderation states, rate limits, storage rules, and audit logs. |
| P1 | AI, email, and elections | These flows can cause cost, privacy, fraud, or reputational risk. | Add per-user quotas, authorization checks, observability, idempotency, and incident alerts. |
| P2 | Client-side role flags | UI role checks improve UX but must never be the sole authority. | Verify every sensitive table/function enforces authorization server-side through RLS or validated JWT claims. |

## 8. Build, Quality, and Test Evidence

The site’s **production build succeeds**. After resolving dependencies locally without changing tracked files, `npm run build` completed in approximately 22 seconds and emitted the `dist` directory. This is a meaningful positive signal: the current source bundles successfully.

The rest of the validation picture requires improvement. The package lock is not synchronized with `package.json`, so `npm ci` fails before installation. A local fallback install using legacy peer-dependency resolution was needed for assessment, and it reported an engine warning for `@editorjs/embed`, which requires Node 24 while the assessment environment used Node 22.13.0. This impairs reproducibility across developer machines and continuous-integration environments.[3]

| Validation activity | Result | Interpretation |
|---|---|---|
| `npm ci` | **Failed** | `package-lock.json` is out of sync with `package.json`; clean, deterministic installation is not currently available. |
| `npm run build` | **Passed** | Vite produced a 28 MiB `dist` output and completed the production bundle. |
| `npm run lint` | **Failed: 304 errors, 50 warnings** | Main issue: 281 `@typescript-eslint/no-explicit-any` errors; additional React hook dependency and refresh warnings remain. |
| `npx playwright test` | **Not runnable in current setup** | The only test failed before execution because the required Playwright browser binary was not installed. |
| Test coverage configuration | **Insufficient** | One test file exists, no `test` script or Playwright configuration was found, and the test hard-codes `http://localhost:8080/`. |

The only browser test waits for the desktop navigation and writes a screenshot.[15] It does not assert feature behavior, authenticated workflows, error states, or page content. In addition, because it hard-codes a localhost address and no Playwright `webServer` configuration was found, it appears to require an externally running dev server even after a browser is installed. The test system should be upgraded before using it as a release gate.

### Performance observations

Route-level lazy loading is a good starting point, and it prevents every named page from being bundled directly with the route configuration.[1] Nonetheless, the production build warned about large chunks. The `dist` directory totals approximately 28 MiB; the largest JavaScript file is **4,422,241 bytes** uncompressed and approximately **2.22 MiB gzip**. Several feature chunks also exceed 300 KiB, including Mermaid-related functionality, the admin dashboard, Editor.js, PDF tooling, charts, and event check-in assets.

This is not a claim that user-perceived performance is unacceptable; network conditions, caching, compression, and route usage matter. It is, however, a clear prioritization signal. The team should inspect the initial chunk with a bundle visualizer, defer any homepage-imported heavy modules, apply manual chunking where it genuinely reduces duplication, and use route/feature boundaries for large libraries such as 3D, Mermaid, PDF, rich editor, and visualization packages.

## 9. Strengths to Preserve

The platform has a coherent mission: it turns the student union from a small informational web presence into a durable digital institution. It demonstrates uncommon domain coverage in one repository, with product-specific interfaces for learning and publishing rather than a single generic dashboard. The code’s central router, structured folders, Tailwind token system, shared UI primitives, lazy imports, Supabase client, onboarding, error reporting, command palette, and PWA consideration all show that the project is being developed as a serious application.[1] [6] [11]

The homepage also makes the mission legible. It surfaces history and governance alongside practical utilities, keeping institutional identity visible rather than treating the union merely as a service directory. The separate Gazette and Tutorials experiences are especially effective design decisions: they acknowledge that reading editorial content and undertaking peer learning demand different navigation, visual hierarchy, and pace.[9] [10]

## 10. Recommended Delivery Roadmap

The next milestones should favor **security and reliability before additional breadth**. The feature catalogue is already extensive; stabilizing it will create more student value than adding another large product area.

| Horizon | Outcome | Recommended work |
|---|---|---|
| Immediate: 0–7 days | Remove preventable exposure | Stop tracking `.env`, rotate any potentially exposed values, remove client-side Gemini key injection, and verify secrets are only available in protected server contexts. |
| Immediate: 0–7 days | Restore reproducible builds | Regenerate and commit the package lock using the supported Node/npm version, document the Node engine, and make `npm ci` pass. |
| Short term: 1–3 weeks | Establish a release-quality baseline | Reduce lint failures to zero, add a `test` script and Playwright configuration with a managed web server, install the supported browser in CI, and cover navigation, forms, auth, authorization, and key student flows. |
| Short term: 1–3 weeks | Improve front-end performance | Analyze the 4.22 MiB initial chunk, lazy-load heavy visual/editor/PDF modules, optimize images, and collect mobile Core Web Vitals. |
| Medium term: 1–2 months | Harden operational workflows | Audit RLS policies and storage rules; add rate limiting, logging, moderation controls, and alerting for AI, email, user-generated content, and elections. |
| Medium term: 1–2 months | Validate accessibility and usability | Run automated and manual accessibility audits; test keyboard flow, focus management, reduced motion, contrast, and responsive behavior on low-end mobile devices. |
| Ongoing | Make product priorities evidence-based | Add privacy-safe analytics and feedback loops that measure resource discovery, study-tool completion, publication engagement, and community-resolution outcomes. |

## Conclusion

UISU SPACE is a **high-potential, full-stack student-union platform** with strong institutional storytelling and a remarkable breadth of practical services. Its core product thesis is convincing: one trusted digital destination can preserve the union’s history while making leadership, learning, publishing, welfare, and student participation more accessible.

The repository is already beyond prototype scale. The correct next phase is not indiscriminate expansion; it is disciplined consolidation. By fixing secret handling and reproducible installation, reducing lint debt, building a meaningful automated test suite, and shrinking the critical client payload, the project can transform its broad feature set into a dependable, public-facing digital service worthy of the union it represents.

## References

[1]: https://github.com/Harbhite/uisu/blob/main/src/App.tsx "Application routes, lazy loading, and root providers"
[2]: https://github.com/Harbhite/uisu/blob/main/vite.config.ts "Vite configuration and environment variable definitions"
[3]: https://github.com/Harbhite/uisu/blob/main/package.json "Project scripts and dependency manifest"
[4]: https://github.com/Harbhite/uisu/blob/main/README.md "UISU SPACE project overview and declared technology stack"
[5]: https://github.com/Harbhite/uisu/blob/main/src/hooks/useAdminCheck.ts "Client-side role-checking hook"
[6]: https://github.com/Harbhite/uisu/blob/main/src/main.tsx "Application bootstrap and global error capture"
[7]: https://github.com/Harbhite/uisu/blob/main/src/pages/Index.tsx "Homepage implementation"
[8]: https://github.com/Harbhite/uisu/blob/main/src/pages/ResourcesPage.tsx "Resources hub implementation"
[9]: https://github.com/Harbhite/uisu/blob/main/src/components/tutorials/TutorialsLayout.tsx "Tutorials sub-product layout"
[10]: https://github.com/Harbhite/uisu/blob/main/src/components/gazette/GazetteLayout.tsx "Gazette sub-product layout"
[11]: https://github.com/Harbhite/uisu/blob/main/tailwind.config.ts "Design tokens, typography, colors, and animation configuration"
[12]: https://github.com/Harbhite/uisu/blob/main/src/integrations/supabase/client.ts "Supabase client configuration"
[13]: https://github.com/Harbhite/uisu/blob/main/src/contexts/AuthContext.tsx "Authentication context and session synchronization"
[14]: https://github.com/Harbhite/uisu/tree/main/supabase/functions "Supabase edge-function implementations"
[15]: https://github.com/Harbhite/uisu/blob/main/tests/navbar.spec.ts "Current Playwright browser test"
