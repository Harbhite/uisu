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

export const SEO = ({
  title,
  description,
  image,
  url,
  type = 'website',
  author,
  publishedTime
}: SEOProps) => {
  const siteTitle = 'UISU Archive';
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

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={truncatedDesc} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={truncatedDesc} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:site_name" content="UISU Archive" />

      {/* Article specific */}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@uisu_archive" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={truncatedDesc} />
      <meta name="twitter:image" content={imageUrl} />
    </Helmet>
  );
};
