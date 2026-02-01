import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const SITE_URL = "https://uisu.space";
const SITE_NAME = "UISU SPACE";
const DEFAULT_DESCRIPTION = "The Digital Space of University of Ibadan Students' Union - connecting students, preserving history, and empowering the community.";
const DEFAULT_IMAGE = `${SITE_URL}/og-home.png`;

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

function getMetadataForPath(path: string): { title: string; description: string; image: string; type: string } {
  // Exact match
  if (routeMetadata[path]) {
    const meta = routeMetadata[path];
    return {
      title: meta.title === SITE_NAME ? meta.title : `${meta.title} | ${SITE_NAME}`,
      description: meta.description,
      image: meta.image || DEFAULT_IMAGE,
      type: meta.type || "website",
    };
  }

  // Dynamic route matching
  if (path.startsWith("/current-leaders/")) {
    return {
      title: `Leader Profile | ${SITE_NAME}`,
      description: "View the profile of a current leader of the University of Ibadan Students' Union.",
      image: `${SITE_URL}/og/og-leaders.png`,
      type: "profile",
    };
  }

  if (path.startsWith("/inks-vault/piece/")) {
    return {
      title: `Literary Piece | ${SITE_NAME}`,
      description: "Read a creative work from the Inks Vault - poetry, prose, and literary pieces from UI students.",
      image: `${SITE_URL}/og/og-inks-vault.png`,
      type: "article",
    };
  }

  if (path.startsWith("/committee/")) {
    return {
      title: `Committee | ${SITE_NAME}`,
      description: "Learn about a committee of the University of Ibadan Students' Union.",
      image: `${SITE_URL}/og/og-governance.png`,
      type: "website",
    };
  }

  if (path.startsWith("/governance/hall/")) {
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

function generateHtml(path: string, metadata: ReturnType<typeof getMetadataForPath>): string {
  const fullUrl = `${SITE_URL}${path}`;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${metadata.title}</title>
  <meta name="description" content="${metadata.description}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="${metadata.type}">
  <meta property="og:url" content="${fullUrl}">
  <meta property="og:title" content="${metadata.title}">
  <meta property="og:description" content="${metadata.description}">
  <meta property="og:image" content="${metadata.image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="${SITE_NAME}">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${fullUrl}">
  <meta name="twitter:title" content="${metadata.title}">
  <meta name="twitter:description" content="${metadata.description}">
  <meta name="twitter:image" content="${metadata.image}">
  <meta name="twitter:site" content="@uisu_archive">
  
  <!-- Canonical -->
  <link rel="canonical" href="${fullUrl}">
  
  <!-- Favicon -->
  <link rel="icon" type="image/png" href="${SITE_URL}/favicon.png">
  
  <!-- Prerender status -->
  <meta name="prerender-status-code" content="200">
</head>
<body>
  <h1>${metadata.title}</h1>
  <p>${metadata.description}</p>
  <a href="${fullUrl}">Visit ${SITE_NAME}</a>
  
  <!-- Redirect for non-crawlers -->
  <script>
    if (!navigator.userAgent.match(/bot|crawl|slurp|spider|mediapartners/i)) {
      window.location.href = "${fullUrl}";
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.searchParams.get("path") || "/";
    const userAgent = req.headers.get("user-agent") || "";
    
    // Check if it's a crawler
    const crawler = isCrawler(userAgent);
    
    // Get metadata for the path
    const metadata = getMetadataForPath(path);
    
    // Generate HTML response
    const html = generateHtml(path, metadata);
    
    return new Response(html, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        "X-Prerender": crawler ? "true" : "false",
      },
    });
  } catch (error) {
    console.error("Prerender error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
