import { Helmet } from 'react-helmet-async';

interface OrganizationSchemaProps {
  type: 'organization';
}

interface ArticleSchemaProps {
  type: 'article';
  title: string;
  description: string;
  author: string;
  publishedTime: string;
  modifiedTime?: string;
  image?: string;
  url: string;
}

interface EventSchemaProps {
  type: 'event';
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: string;
}

interface BreadcrumbSchemaProps {
  type: 'breadcrumb';
  items: { name: string; url: string }[];
}

interface WebPageSchemaProps {
  type: 'webpage';
  title: string;
  description: string;
  url: string;
}

type JsonLDProps = 
  | OrganizationSchemaProps 
  | ArticleSchemaProps 
  | EventSchemaProps 
  | BreadcrumbSchemaProps
  | WebPageSchemaProps;

const SITE_URL = 'https://uisu.space';
const ORG_NAME = 'UISU Archive';
const ORG_LOGO = `${SITE_URL}/uisu-logo.png`;

export const JsonLD = (props: JsonLDProps) => {
  const generateSchema = () => {
    switch (props.type) {
      case 'organization':
        return {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: ORG_NAME,
          url: SITE_URL,
          logo: ORG_LOGO,
          description: 'Digital archive preserving the legacy and governance of the University of Ibadan Students Union.',
          sameAs: [
            'https://twitter.com/uisu_archive'
          ]
        };

      case 'article':
        return {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: props.title,
          description: props.description,
          author: {
            '@type': 'Person',
            name: props.author
          },
          publisher: {
            '@type': 'Organization',
            name: ORG_NAME,
            logo: {
              '@type': 'ImageObject',
              url: ORG_LOGO
            }
          },
          datePublished: props.publishedTime,
          dateModified: props.modifiedTime || props.publishedTime,
          image: props.image || ORG_LOGO,
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': props.url
          }
        };

      case 'event':
        return {
          '@context': 'https://schema.org',
          '@type': 'Event',
          name: props.name,
          description: props.description,
          startDate: props.startDate,
          endDate: props.endDate || props.startDate,
          location: props.location ? {
            '@type': 'Place',
            name: props.location,
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Ibadan',
              addressCountry: 'NG'
            }
          } : undefined,
          organizer: {
            '@type': 'Organization',
            name: ORG_NAME,
            url: SITE_URL
          }
        };

      case 'breadcrumb':
        return {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: props.items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`
          }))
        };

      case 'webpage':
        return {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: props.title,
          description: props.description,
          url: props.url.startsWith('http') ? props.url : `${SITE_URL}${props.url}`,
          isPartOf: {
            '@type': 'WebSite',
            name: ORG_NAME,
            url: SITE_URL
          }
        };

      default:
        return null;
    }
  };

  const schema = generateSchema();
  if (!schema) return null;

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};
