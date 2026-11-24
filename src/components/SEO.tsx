import { Helmet } from 'react-helmet-async';
import { DEFAULT_SITE_SEO_SETTINGS, useSiteSeoSettings, type SiteSeoSocialLink } from '@/contexts/SiteSeoContext';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  publishedTime?: string;
  breadcrumbs?: BreadcrumbItem[];
  faq?: FAQItem[];
}

const SITE_URL = 'https://uisu.space';
const DEFAULT_IMAGE = `${SITE_URL}/uisu-logo.png`;

const normalizeSocialLinks = (links: SiteSeoSocialLink[]) => links.flatMap((link) => {
  try {
    const parsed = new URL(link.url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? [{ ...link, url: parsed.href }] : [];
  } catch {
    return [];
  }
});

const toSafeJsonLd = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');

export const SEO = ({
  title,
  description,
  image,
  url,
  type = 'website',
  author,
  publishedTime,
  breadcrumbs,
  faq
}: SEOProps) => {
  const { settings } = useSiteSeoSettings();
  const siteName = settings.siteName.trim() || DEFAULT_SITE_SEO_SETTINGS.siteName;
  const siteDescription = settings.siteDescription.trim() || DEFAULT_SITE_SEO_SETTINGS.siteDescription;
  const socialLinks = normalizeSocialLinks(settings.socialLinks);
  const fullTitle = title === DEFAULT_SITE_SEO_SETTINGS.siteName || title === siteName
    ? siteName
    : `${title} | ${siteName}`;

  const imageUrl = image
    ? (image.startsWith('http') ? image : `${SITE_URL}${image.startsWith('/') ? '' : '/'}${image}`)
    : DEFAULT_IMAGE;

  const pageUrl = url
    ? (url.startsWith('http') ? url : `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`)
    : (typeof window !== 'undefined' ? `${SITE_URL}${window.location.pathname}` : SITE_URL);

  const pageDescription = description.trim() || siteDescription;
  const descriptionLimit = 320;
  const availablePageLength = Math.max(0, descriptionLimit - siteDescription.length - 3);
  const combinedDescription = pageDescription === siteDescription
    ? siteDescription
    : `${pageDescription.slice(0, availablePageLength).trimEnd()} — ${siteDescription}`;
  const truncatedDesc = combinedDescription.length > descriptionLimit
    ? `${combinedDescription.slice(0, descriptionLimit - 3)}...`
    : combinedDescription;

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": siteName,
    "alternateName": "UISU",
    "url": SITE_URL,
    "logo": `${SITE_URL}/uisu-logo.png`,
    "description": siteDescription,
    "foundingDate": "1948",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Ibadan",
      "addressRegion": "Oyo State",
      "addressCountry": "Nigeria"
    },
    "sameAs": socialLinks.map((link) => link.url)
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": siteName,
    "alternateName": "University of Ibadan Students' Union Digital Space",
    "url": SITE_URL,
    "description": siteDescription,
    "publisher": {
      "@type": "Organization",
      "name": siteName
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
      "name": siteName,
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/uisu-logo.png`
      }
    }
  } : null;

  const breadcrumbSchema = breadcrumbs && breadcrumbs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`
    }))
  } : null;

  const faqSchema = faq && faq.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faq.map((item) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  } : null;

  const twitterLink = socialLinks.find((link) => /^(x|twitter)$/i.test(link.platform));
  const twitterHandle = twitterLink ? new URL(twitterLink.url).pathname.split('/').filter(Boolean)[0] : null;
  const isHomePage = url === '/' || url === SITE_URL || !url;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={truncatedDesc} />
      <meta name="application-name" content={siteName} />

      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={truncatedDesc} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:site_name" content={siteName} />
      {socialLinks.map((link) => (
        <meta key={`${link.platform}-${link.url}`} property="og:see_also" content={link.url} />
      ))}

      {type === 'article' && author && <meta property="article:author" content={author} />}
      {type === 'article' && publishedTime && <meta property="article:published_time" content={publishedTime} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={pageUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={truncatedDesc} />
      <meta name="twitter:image" content={imageUrl} />
      {twitterHandle && <meta name="twitter:site" content={`@${twitterHandle}`} />}

      {isHomePage && (
        <script type="application/ld+json">{toSafeJsonLd(organizationSchema)}</script>
      )}
      {isHomePage && (
        <script type="application/ld+json">{toSafeJsonLd(websiteSchema)}</script>
      )}
      {articleSchema && (
        <script type="application/ld+json">{toSafeJsonLd(articleSchema)}</script>
      )}
      {breadcrumbSchema && (
        <script type="application/ld+json">{toSafeJsonLd(breadcrumbSchema)}</script>
      )}
      {faqSchema && (
        <script type="application/ld+json">{toSafeJsonLd(faqSchema)}</script>
      )}
    </Helmet>
  );
};
