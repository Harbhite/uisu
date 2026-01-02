import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
}

export const SEO = ({
  title,
  description,
  image = '/uisu-logo.png',
  url = window.location.href,
  type = 'website'
}: SEOProps) => {
  const siteTitle = 'UISU Archive';
  const fullTitle = title === siteTitle ? title : `${title} | ${siteTitle}`;

  // Ensure absolute URL for image
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const imageUrl = image.startsWith('http')
    ? image
    : `${origin}${image.startsWith('/') ? '' : '/'}${image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={url} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Helmet>
  );
};
