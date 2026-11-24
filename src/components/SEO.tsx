import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { DEFAULT_SITE_SEO_SETTINGS, useSiteSeoSettings } from '@/contexts/SiteSeoContext';
import { composePageTitle, composePageDescription, getTwitterHandle, normalizeSocialProfiles, normalizePagePath, resolvePageMetadata } from '../../supabase/functions/_shared/siteSeo';

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
  const { pathname } = useLocation();
  const siteName = settings.siteName.trim() || DEFAULT_SITE_SEO_SETTINGS.siteName;
  const siteDescription = settings.siteDescription.trim() || DEFAULT_SITE_SEO_SETTINGS.siteDescription;
  const socialLinks = normalizeSocialProfiles(settings.socialLinks);
  const fullTitle = composePageTitle(title, siteName);
  const selectedImage = image || resolvePageMetadata(pathname).image;

  const imageUrl = selectedImage
    ? (selectedImage.startsWith('http') ? selectedImage : `${SITE_URL}${selectedImage.startsWith('/') ? '' : '/'}${selectedImage}`)
    : DEFAULT_IMAGE;

  const pageUrl = url
    ? (url.startsWith('http') ? url : `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`)
    : `${SITE_URL}${pathname}`;
  const isHomePage = normalizePagePath(url || pathname) === '/';
  const truncatedDesc = composePageDescription(description, siteDescription, isHomePage);

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

  const twitterHandle = getTwitterHandle(socialLinks);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={truncatedDesc} />
      <meta name="application-name" content={siteName} />
      <meta name="author" content={author || siteName} />
      <link rel="canonical" href={pageUrl} />

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
      <meta name="twitter:site" content={twitterHandle ? `@${twitterHandle}` : ''} />

      <script type="application/ld+json">{toSafeJsonLd(organizationSchema)}</script>
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
