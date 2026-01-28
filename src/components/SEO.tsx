import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  publishedTime?: string;
}

const SITE_URL = 'https://uisu.space';
const DEFAULT_IMAGE = `${SITE_URL}/uisu-logo.png`;

// Organization structured data
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "University of Ibadan Students' Union",
  "alternateName": "UISU",
  "url": SITE_URL,
  "logo": `${SITE_URL}/uisu-logo.png`,
  "description": "The official digital space of the University of Ibadan Students' Union - connecting students, preserving history, and empowering the community.",
  "foundingDate": "1948",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Ibadan",
    "addressRegion": "Oyo State",
    "addressCountry": "Nigeria"
  },
  "sameAs": [
    "https://twitter.com/uisu_archive"
  ]
};

// Website structured data
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "UISU SPACE",
  "alternateName": "University of Ibadan Students' Union Digital Space",
  "url": SITE_URL,
  "description": "The official digital space of the University of Ibadan Students' Union",
  "publisher": {
    "@type": "Organization",
    "name": "University of Ibadan Students' Union"
  },
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${SITE_URL}/search?q={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  }
};

export const SEO = ({
  title,
  description,
  image,
  url,
  type = 'website',
  author,
  publishedTime
}: SEOProps) => {
  const siteTitle = 'UISU SPACE';
  const fullTitle = title === siteTitle ? title : `${title} | ${siteTitle}`;

  // Ensure absolute URL for image - use production domain
  const imageUrl = image 
    ? (image.startsWith('http') ? image : `${SITE_URL}${image.startsWith('/') ? '' : '/'}${image}`)
    : DEFAULT_IMAGE;

  // Ensure absolute URL for page
  const pageUrl = url 
    ? (url.startsWith('http') ? url : `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`)
    : (typeof window !== 'undefined' ? `${SITE_URL}${window.location.pathname}` : SITE_URL);

  // Truncate description for meta tags
  const truncatedDesc = description.length > 160 ? description.slice(0, 157) + '...' : description;

  // Article structured data (for blog posts, inks, etc.)
  const articleSchema = type === 'article' ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": truncatedDesc,
    "image": imageUrl,
    "url": pageUrl,
    "datePublished": publishedTime,
    "author": author ? {
      "@type": "Person",
      "name": author
    } : undefined,
    "publisher": {
      "@type": "Organization",
      "name": "UISU SPACE",
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/uisu-logo.png`
      }
    }
  } : null;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={truncatedDesc} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={truncatedDesc} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:site_name" content="UISU SPACE" />

      {/* Article specific */}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}

      {/* X (Twitter) */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={pageUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={truncatedDesc} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:site" content="@uisu_archive" />

      {/* Structured Data - Organization (only on homepage) */}
      {(url === '/' || url === SITE_URL || !url) && (
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
      )}

      {/* Structured Data - Website (only on homepage) */}
      {(url === '/' || url === SITE_URL || !url) && (
        <script type="application/ld+json">
          {JSON.stringify(websiteSchema)}
        </script>
      )}

      {/* Structured Data - Article (for articles/inks) */}
      {articleSchema && (
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
      )}
    </Helmet>
  );
};
