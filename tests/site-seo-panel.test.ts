import { expect, test } from "bun:test";
import {
  auditSeoRoutes,
  buildSeoPagePreview,
  buildSocialMetaTags,
  getSeoRouteIssues,
  SEO_ROUTE_PATHS,
} from "../src/lib/siteSeoPanel";

test("route previews normalize shared URLs and use page-specific metadata", () => {
  const preview = buildSeoPagePreview("/communities/?source=share", "UISU SPACE", "A student community platform.");

  expect(preview.path).toBe("/communities");
  expect(preview.url).toBe("https://uisu.space/communities");
  expect(preview.title).toBe("Student Clubs & Societies | UI Campus Communities | UISU SPACE");
  expect(preview.image).toBe("https://uisu.space/og/pages-screenshot/communities.png");
});

test("sitewide audit includes every registered route and reports absent social images", () => {
  const audit = auditSeoRoutes("UISU SPACE", "The official digital space of the Union.");
  const academicBank = buildSeoPagePreview("/resources/academic-bank", "UISU SPACE", "The official digital space of the Union.");

  expect(audit.checked).toBe(SEO_ROUTE_PATHS.length);
  expect(audit.routesWithIssues).toBeGreaterThan(0);
  expect(audit.missingImages).toBeGreaterThan(0);
  expect(getSeoRouteIssues(academicBank).map((issue) => issue.code)).toContain("missing-image");
});

test("generated tags include canonical, search, and social metadata with escaped values", () => {
  const preview = buildSeoPagePreview("/communities", "UISU SPACE", "A student community platform.");
  const tags = buildSocialMetaTags({
    ...preview,
    title: '<UISU & "Union">',
    description: "Research <stories> & share them.",
  });

  expect(tags).toContain('<title>&lt;UISU &amp; &quot;Union&quot;&gt;</title>');
  expect(tags).toContain('<meta name="description" content="Research &lt;stories&gt; &amp; share them.">');
  expect(tags).toContain('<link rel="canonical" href="https://uisu.space/communities">');
  expect(tags).toContain('<meta property="og:image" content="https://uisu.space/og/pages-screenshot/communities.png">');
  expect(tags).toContain('<meta name="twitter:card" content="summary_large_image">');
});