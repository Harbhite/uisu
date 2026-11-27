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
  titlesOutsideRange: number;
  descriptionsOutsideRange: number;
}

export const SEO_TITLE_LENGTH = { min: 30, max: 60 } as const;
export const SEO_DESCRIPTION_LENGTH = { min: 120, max: 160 } as const;

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
  let routesWithIssues = 0;
  let missingImages = 0;
  let titlesOutsideRange = 0;
  let descriptionsOutsideRange = 0;

  for (const path of Object.keys(routeMetadata)) {
    const preview = buildSeoPagePreview(path, siteName, siteDescription);
    const titleOutsideRange = preview.titleLength < SEO_TITLE_LENGTH.min || preview.titleLength > SEO_TITLE_LENGTH.max;
    const descriptionOutsideRange = preview.descriptionLength < SEO_DESCRIPTION_LENGTH.min || preview.descriptionLength > SEO_DESCRIPTION_LENGTH.max;
    const hasIssue = !preview.title.trim() || !preview.description.trim() || !preview.image || titleOutsideRange || descriptionOutsideRange;

    if (hasIssue) routesWithIssues += 1;
    if (!preview.image) missingImages += 1;
    if (titleOutsideRange) titlesOutsideRange += 1;
    if (descriptionOutsideRange) descriptionsOutsideRange += 1;
  }

  return {
    checked: Object.keys(routeMetadata).length,
    routesWithIssues,
    missingImages,
    titlesOutsideRange,
    descriptionsOutsideRange,
  };
}

export function buildSocialMetaTags(preview: SeoPagePreview): string {
  const tags = [
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