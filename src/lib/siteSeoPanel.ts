import {
  SITE_URL,
  composePageDescription,
  composePageTitle,
  normalizePagePath,
  resolvePageMetadata,
  routeMetadata,
} from "../../supabase/functions/_shared/siteSeo";

export interface SeoPagePreview {
  path: string;
  url: string;
  title: string;
  description: string;
  image: string | null;
  titleLength: number;
  descriptionLength: number;
}

export interface SeoRouteAudit {
  checked: number;
  routesWithIssues: number;
  missingImages: number;
  missingTitles: number;
  missingDescriptions: number;
  titlesOutsideRange: number;
  descriptionsOutsideRange: number;
}

export type SeoRouteIssueCode =
  | "missing-title"
  | "title-too-short"
  | "title-too-long"
  | "missing-description"
  | "description-too-short"
  | "description-too-long"
  | "missing-image";

export interface SeoRouteIssue {
  code: SeoRouteIssueCode;
  message: string;
}

export const SEO_TITLE_LENGTH = { min: 30, max: 60 } as const;
export const SEO_DESCRIPTION_LENGTH = { min: 120, max: 160 } as const;
export const SEO_ROUTE_PATHS = Object.keys(routeMetadata).sort((a, b) => a.localeCompare(b));

export function buildSeoPagePreview(path: string, siteName: string, siteDescription: string): SeoPagePreview {
  const normalizedPath = normalizePagePath(path);
  const metadata = resolvePageMetadata(normalizedPath);
  const image = metadata.image ? absoluteImageUrl(metadata.image) : null;
  const title = composePageTitle(metadata.title, siteName);
  const description = composePageDescription(metadata.description, siteDescription, normalizedPath === "/");

  return {
    path: normalizedPath,
    url: `${SITE_URL}${normalizedPath}`,
    title,
    description,
    image,
    titleLength: title.length,
    descriptionLength: description.length,
  };
}

export function auditSeoRoutes(siteName: string, siteDescription: string): SeoRouteAudit {
  const rows = SEO_ROUTE_PATHS.map((path) => ({
    preview: buildSeoPagePreview(path, siteName, siteDescription),
    issues: getSeoRouteIssues(buildSeoPagePreview(path, siteName, siteDescription)),
  }));
  const count = (code: SeoRouteIssueCode) => rows.filter((row) => row.issues.some((issue) => issue.code === code)).length;

  return {
    checked: rows.length,
    routesWithIssues: rows.filter((row) => row.issues.length > 0).length,
    missingImages: count("missing-image"),
    missingTitles: count("missing-title"),
    missingDescriptions: count("missing-description"),
    titlesOutsideRange: count("title-too-short") + count("title-too-long"),
    descriptionsOutsideRange: count("description-too-short") + count("description-too-long"),
  };
}

export function getSeoRouteIssues(preview: SeoPagePreview): SeoRouteIssue[] {
  const issues: SeoRouteIssue[] = [];
  if (!preview.title.trim()) issues.push({ code: "missing-title", message: "Page title is missing" });
  else if (preview.titleLength < SEO_TITLE_LENGTH.min) issues.push({ code: "title-too-short", message: `Title is under ${SEO_TITLE_LENGTH.min} characters` });
  else if (preview.titleLength > SEO_TITLE_LENGTH.max) issues.push({ code: "title-too-long", message: `Title is over ${SEO_TITLE_LENGTH.max} characters` });

  if (!preview.description.trim()) issues.push({ code: "missing-description", message: "Description is missing" });
  else if (preview.descriptionLength < SEO_DESCRIPTION_LENGTH.min) issues.push({ code: "description-too-short", message: `Description is under ${SEO_DESCRIPTION_LENGTH.min} characters` });
  else if (preview.descriptionLength > SEO_DESCRIPTION_LENGTH.max) issues.push({ code: "description-too-long", message: `Description is over ${SEO_DESCRIPTION_LENGTH.max} characters` });

  if (!preview.image) issues.push({ code: "missing-image", message: "Social preview image is missing" });
  return issues;
}

export function buildSocialMetaTags(preview: SeoPagePreview): string {
  const tags = [
    `<title>${escapeHtml(preview.title)}</title>`,
    `<meta name="description" content="${escapeHtml(preview.description)}">`,
    `<link rel="canonical" href="${escapeHtml(preview.url)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:url" content="${escapeHtml(preview.url)}">`,
    `<meta property="og:title" content="${escapeHtml(preview.title)}">`,
    `<meta property="og:description" content="${escapeHtml(preview.description)}">`,
    `<meta name="twitter:card" content="${preview.image ? "summary_large_image" : "summary"}">`,
    `<meta name="twitter:title" content="${escapeHtml(preview.title)}">`,
    `<meta name="twitter:description" content="${escapeHtml(preview.description)}">`,
  ];

  if (preview.image) {
    const safeImage = escapeHtml(preview.image);
    tags.splice(5, 0, `<meta property="og:image" content="${safeImage}">`);
    tags.push(`<meta name="twitter:image" content="${safeImage}">`);
  }

  return tags.join("\n");
}

function absoluteImageUrl(image: string): string | null {
  try {
    const url = new URL(image, SITE_URL);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}