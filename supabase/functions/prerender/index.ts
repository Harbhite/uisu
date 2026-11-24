import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// Version for debugging deployments
const VERSION = "v1.0.1";
const DEPLOYED_AT = "2026-02-02T05:30:00Z";

const SITE_URL = "https://uisu.space";
const SITE_NAME = "UISU SPACE";
const DEFAULT_DESCRIPTION = "The Digital Space of University of Ibadan Students' Union - connecting students, preserving history, and empowering the community.";
const DEFAULT_IMAGE = `${SITE_URL}/og-home.png`;

type SocialProfile = { platform: string; url: string };
type SiteSettings = { siteName: string; siteDescription: string; socialLinks: SocialProfile[] };

const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: SITE_NAME,
  siteDescription: "The official digital space of the University of Ibadan Students’ Union — connecting students, preserving history, and empowering the community.",
  socialLinks: [{ platform: "X", url: "https://twitter.com/uisu_archive" }],
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchSiteSettings(): Promise<SiteSettings> {
  try {
    const { data, error } = await supabase
      .from("site_seo_settings")
      .select("site_name, site_description, social_links")
      .eq("id", true)
      .maybeSingle();
    if (error || !data) return DEFAULT_SITE_SETTINGS;

    const socialLinks = Array.isArray(data.social_links)
      ? data.social_links.flatMap((item) => {
          if (!item || typeof item !== "object") return [];
          const candidate = item as Record<string, unknown>;
          if (typeof candidate.platform !== "string" || typeof candidate.url !== "string") return [];
          try {
            const parsed = new URL(candidate.url);
            if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return [];
            return [{ platform: candidate.platform, url: parsed.href }];
          } catch {
            return [];
          }
        })
      : DEFAULT_SITE_SETTINGS.socialLinks;

    return {
      siteName: typeof data.site_name === "string" && data.site_name.trim()
        ? data.site_name.trim()
        : DEFAULT_SITE_SETTINGS.siteName,
      siteDescription: typeof data.site_description === "string" && data.site_description.trim()
        ? data.site_description.trim()
        : DEFAULT_SITE_SETTINGS.siteDescription,
      socialLinks,
    };
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}

function applySiteSettings(
  metadata: { title: string; description: string; image: string; type: string },
  settings: SiteSettings,
) {
  const title = metadata.title === SITE_NAME
    ? settings.siteName
    : metadata.title.replaceAll(SITE_NAME, settings.siteName);
  const pageDescription = metadata.description.trim();
  const siteDescription = settings.siteDescription.trim();
  const description = pageDescription === siteDescription
    ? siteDescription
    : `${pageDescription} — ${siteDescription}`;

  return {
    ...metadata,
    title,
    description: description.length > 320 ? `${description.slice(0, 317)}...` : description,
  };
}

// Route-specific OG data
const routeMetadata: Record<string, { title: string; description: string; image?: string; type?: string }> = {
  "/": {
    title: "UISU SPACE",
    description: DEFAULT_DESCRIPTION,
    image: `${SITE_URL}/og-home.png`,
  },
  "/governance": {
    title: "Governance",
    description: "Explore the governance structure of the University of Ibadan Students' Union - committees, leadership, and democratic processes.",
    image: `${SITE_URL}/og/og-governance.png`,
  },
  "/current-leaders": {
    title: "Current Leaders",
    description: "Meet the current executive and legislative leaders of the University of Ibadan Students' Union.",
    image: `${SITE_URL}/og/og-leaders.png`,
  },
  "/past-leaders": {
    title: "Past Leaders",
    description: "Honoring the legacy of past leaders who shaped the University of Ibadan Students' Union.",
    image: `${SITE_URL}/og/og-past-leaders.png`,
  },
  "/communities": {
    title: "Communities",
    description: "Discover clubs, societies, and organizations within the University of Ibadan campus community.",
    image: `${SITE_URL}/og/og-communities.png`,
  },
  "/events": {
    title: "Events",
    description: "Stay updated with upcoming events, meetings, and activities at the University of Ibadan.",
    image: `${SITE_URL}/og/og-events.png`,
  },
  "/announcements": {
    title: "Announcements",
    description: "Latest announcements and updates from the University of Ibadan Students' Union.",
    image: `${SITE_URL}/og/og-announcements.png`,
  },
  "/documents": {
    title: "Document Library",
    description: "Access official documents, constitution, and records of the University of Ibadan Students' Union.",
    image: `${SITE_URL}/og/og-documents.png`,
  },
  "/campus-map": {
    title: "Campus Map",
    description: "Interactive map of the University of Ibadan campus - find buildings, landmarks, and facilities.",
    image: `${SITE_URL}/og/og-campus-map.png`,
  },
  "/inks-vault": {
    title: "Inks Vault",
    description: "A collection of creative works, poetry, and literary pieces from University of Ibadan students.",
    image: `${SITE_URL}/og/og-inks-vault.png`,
  },
  "/auth": {
    title: "Sign In",
    description: "Sign in to your UISU SPACE account to access exclusive features and content.",
    image: `${SITE_URL}/og/og-auth.png`,
  },
  "/history": {
    title: "Our History",
    description: "Discover the rich history of the University of Ibadan Students' Union since 1948.",
  },
  "/constitution": {
    title: "Constitution",
    description: "The official constitution of the University of Ibadan Students' Union.",
  },
  "/resources": {
    title: "Student Resources",
    description: "Essential resources for University of Ibadan students - academic tools, career services, and more.",
  },
  "/tutorials": {
    title: "Tutorials",
    description: "Learn from peer tutors at the University of Ibadan - courses, guides, and educational content.",
  },
  "/halls": {
    title: "Halls of Residence",
    description: "Explore the halls of residence at the University of Ibadan - history, culture, and community.",
  },
  "/search": {
    title: "Search",
    description: "Search across UISU SPACE - find leaders, documents, events, and more.",
  },
  "/newsletter": {
    title: "Newsletter",
    description: "Subscribe to the UISU SPACE newsletter for updates on campus life and union activities.",
  },
};

// Crawler user agents to detect
const crawlerPatterns = [
  "facebookexternalhit",
  "Facebot",
  "Twitterbot",
  "LinkedInBot",
  "WhatsApp",
  "Slackbot",
  "TelegramBot",
  "Discordbot",
  "Pinterest",
  "Googlebot",
  "bingbot",
  "Baiduspider",
  "yandex",
  "Applebot",
  "Embedly",
  "outbrain",
  "quora link preview",
  "rogerbot",
  "showyoubot",
  "vkShare",
  "W3C_Validator",
  "redditbot",
  "Sogou",
  "exabot",
  "ia_archiver",
  "Mediapartners-Google",
  "AdsBot-Google",
];

function isCrawler(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return crawlerPatterns.some((pattern) => ua.includes(pattern.toLowerCase()));
}

// Fetch leader data from database
async function fetchLeaderData(leaderId: string) {
  try {
    const { data, error } = await supabase
      .from("leaders")
      .select("name, role, bio, image, category")
      .eq("id", leaderId)
      .single();
    
    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

// Fetch ink piece data from database
async function fetchInkPieceData(pieceId: string) {
  try {
    const { data, error } = await supabase
      .from("ink_pieces")
      .select("title, summary, author_name, cover_image, type")
      .eq("id", pieceId)
      .eq("is_published", true)
      .single();
    
    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

// Fetch committee data from database
async function fetchCommitteeData(slug: string) {
  try {
    const { data, error } = await supabase
      .from("committees")
      .select("title, description, chairperson")
      .eq("slug", slug)
      .single();
    
    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

// Fetch hall data from database
async function fetchHallData(slug: string) {
  try {
    const { data, error } = await supabase
      .from("halls")
      .select("name, description, motto, image_url")
      .eq("slug", slug)
      .single();
    
    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

async function getMetadataForPath(path: string): Promise<{ title: string; description: string; image: string; type: string }> {
  // Exact match for static routes
  if (routeMetadata[path]) {
    const meta = routeMetadata[path];
    return {
      title: meta.title === SITE_NAME ? meta.title : `${meta.title} | ${SITE_NAME}`,
      description: meta.description,
      image: meta.image || DEFAULT_IMAGE,
      type: meta.type || "website",
    };
  }

  // Dynamic route: Leader profile
  const leaderMatch = path.match(/^\/current-leaders\/([a-f0-9-]+)$/i);
  if (leaderMatch) {
    const leader = await fetchLeaderData(leaderMatch[1]);
    if (leader) {
      const description = leader.bio 
        ? leader.bio.slice(0, 155) + (leader.bio.length > 155 ? "..." : "")
        : `${leader.name} serves as ${leader.role} in the University of Ibadan Students' Union.`;
      return {
        title: `${leader.name} - ${leader.role} | ${SITE_NAME}`,
        description,
        image: leader.image || `${SITE_URL}/og/og-leaders.png`,
        type: "profile",
      };
    }
    return {
      title: `Leader Profile | ${SITE_NAME}`,
      description: "View the profile of a current leader of the University of Ibadan Students' Union.",
      image: `${SITE_URL}/og/og-leaders.png`,
      type: "profile",
    };
  }

  // Dynamic route: Ink piece
  const inkMatch = path.match(/^\/inks-vault\/piece\/([a-f0-9-]+)$/i);
  if (inkMatch) {
    const piece = await fetchInkPieceData(inkMatch[1]);
    if (piece) {
      const description = piece.summary 
        ? piece.summary.slice(0, 155) + (piece.summary.length > 155 ? "..." : "")
        : `"${piece.title}" - a ${piece.type.toLowerCase()} by ${piece.author_name} on UISU SPACE.`;
      return {
        title: `${piece.title} by ${piece.author_name} | ${SITE_NAME}`,
        description,
        image: piece.cover_image || `${SITE_URL}/og/og-inks-vault.png`,
        type: "article",
      };
    }
    return {
      title: `Literary Piece | ${SITE_NAME}`,
      description: "Read a creative work from the Inks Vault - poetry, prose, and literary pieces from UI students.",
      image: `${SITE_URL}/og/og-inks-vault.png`,
      type: "article",
    };
  }

  // Dynamic route: Committee
  const committeeMatch = path.match(/^\/committee\/([a-z0-9-]+)$/i);
  if (committeeMatch) {
    const committee = await fetchCommitteeData(committeeMatch[1]);
    if (committee) {
      const description = committee.description 
        ? committee.description.slice(0, 155) + (committee.description.length > 155 ? "..." : "")
        : `Learn about the ${committee.title} of the University of Ibadan Students' Union.`;
      return {
        title: `${committee.title} | ${SITE_NAME}`,
        description,
        image: `${SITE_URL}/og/og-governance.png`,
        type: "website",
      };
    }
    return {
      title: `Committee | ${SITE_NAME}`,
      description: "Learn about a committee of the University of Ibadan Students' Union.",
      image: `${SITE_URL}/og/og-governance.png`,
      type: "website",
    };
  }

  // Dynamic route: Hall
  const hallMatch = path.match(/^\/governance\/hall\/([a-z0-9-]+)$/i);
  if (hallMatch) {
    const hall = await fetchHallData(hallMatch[1]);
    if (hall) {
      const description = hall.description 
        ? hall.description.slice(0, 155) + (hall.description.length > 155 ? "..." : "")
        : hall.motto || `Explore ${hall.name} at the University of Ibadan.`;
      return {
        title: `${hall.name} | ${SITE_NAME}`,
        description,
        image: hall.image_url || DEFAULT_IMAGE,
        type: "website",
      };
    }
    return {
      title: `Hall of Residence | ${SITE_NAME}`,
      description: "Explore a hall of residence at the University of Ibadan.",
      image: DEFAULT_IMAGE,
      type: "website",
    };
  }

  if (path.startsWith("/profile/")) {
    return {
      title: `User Profile | ${SITE_NAME}`,
      description: "View a student profile on UISU SPACE.",
      image: DEFAULT_IMAGE,
      type: "profile",
    };
  }

  if (path.startsWith("/tutorials/")) {
    return {
      title: `Tutorial | ${SITE_NAME}`,
      description: "Learn from peer tutors at the University of Ibadan.",
      image: DEFAULT_IMAGE,
      type: "article",
    };
  }

  if (path.startsWith("/resources/")) {
    return {
      title: `Student Resource | ${SITE_NAME}`,
      description: "Access helpful resources for University of Ibadan students.",
      image: DEFAULT_IMAGE,
      type: "website",
    };
  }

  // Default fallback
  return {
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    image: DEFAULT_IMAGE,
    type: "website",
  };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function generateHtml(
  path: string,
  metadata: { title: string; description: string; image: string; type: string },
  settings: SiteSettings,
): string {
  const fullUrl = `${SITE_URL}${path}`;
  const safeFullUrl = escapeHtml(fullUrl);
  const safeTitle = escapeHtml(metadata.title);
  const safeDescription = escapeHtml(metadata.description);
  const safeImage = escapeHtml(metadata.image);
  const safeSiteName = escapeHtml(settings.siteName);
  const organizationSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.siteName,
    url: SITE_URL,
    description: settings.siteDescription,
    sameAs: settings.socialLinks.map((link) => link.url),
  }).replace(/</g, "\\u003c");
  const twitterLink = settings.socialLinks.find((link) => /^(x|twitter)$/i.test(link.platform));
  const twitterHandle = twitterLink ? new URL(twitterLink.url).pathname.split("/").filter(Boolean)[0] : "uisu_archive";
  const socialMeta = settings.socialLinks
    .map((link) => `<meta property="og:see_also" content="${escapeHtml(link.url)}">`)
    .join("\n  ");
  const redirectUrl = JSON.stringify(fullUrl).replace(/</g, "\\u003c");
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDescription}">
  <meta name="application-name" content="${safeSiteName}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="${metadata.type}">
  <meta property="og:url" content="${safeFullUrl}">
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${safeDescription}">
  <meta property="og:image" content="${safeImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="${safeSiteName}">
  ${socialMeta}
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${safeFullUrl}">
  <meta name="twitter:title" content="${safeTitle}">
  <meta name="twitter:description" content="${safeDescription}">
  <meta name="twitter:image" content="${safeImage}">
  <meta name="twitter:site" content="@${escapeHtml(twitterHandle)}">
  <script type="application/ld+json">${organizationSchema}</script>
  
  <!-- Canonical -->
  <link rel="canonical" href="${safeFullUrl}">
  
  <!-- Favicon -->
  <link rel="icon" type="image/png" href="${SITE_URL}/favicon.png">
  
  <!-- Prerender status -->
  <meta name="prerender-status-code" content="200">
</head>
<body>
  <h1>${safeTitle}</h1>
  <p>${safeDescription}</p>
  <a href="${safeFullUrl}">Visit ${safeSiteName}</a>
  
  <!-- Redirect for non-crawlers -->
  <script>
    if (!navigator.userAgent.match(/bot|crawl|slurp|spider|mediapartners/i)) {
      window.location.href = ${redirectUrl};
    }
  </script>
</body>
</html>`;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, user-agent",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

serve(async (req: Request) => {
  console.log(`[${VERSION}] Request received at ${new Date().toISOString()}`);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.searchParams.get("path") || "/";
    const userAgent = req.headers.get("user-agent") || "";
    
    console.log(`[${VERSION}] Processing path: ${path}, UA: ${userAgent.substring(0, 50)}...`);
    
    // Check if it's a crawler
    const crawler = isCrawler(userAgent);
    
    // Get metadata for the path (now async for dynamic routes)
    const [metadata, siteSettings] = await Promise.all([
      getMetadataForPath(path),
      fetchSiteSettings(),
    ]);
    const sharedMetadata = applySiteSettings(metadata, siteSettings);
    
    // Generate HTML response
    const html = generateHtml(path, sharedMetadata, siteSettings);
    
    console.log(`[${VERSION}] Successfully generated HTML for path: ${path}`);
    
    return new Response(html, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        "X-Prerender": crawler ? "true" : "false",
        "X-Prerender-Version": VERSION,
      },
    });
  } catch (error) {
    console.error(`[${VERSION}] Prerender error:`, error);
    return new Response(
      JSON.stringify({ error: "Internal server error", _version: VERSION }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
