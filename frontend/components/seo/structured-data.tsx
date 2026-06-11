'use client';

interface StructuredDataProps {
  data: Record<string, any> | Record<string, any>[];
}

export function StructuredData({ data }: StructuredDataProps) {
  const jsonData = Array.isArray(data) ? data : [data];
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonData.length === 1 ? jsonData[0] : jsonData),
      }}
    />
  );
}

// Predefined structured data components
export function WebsiteStructuredData() {
  const websiteData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'YouTube Summary',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://youtube-summary.com',
    description: 'Transform long YouTube videos into concise, intelligent summaries powered by AI.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${process.env.NEXT_PUBLIC_APP_URL || 'https://youtube-summary.com'}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return <StructuredData data={websiteData} />;
}

export function OrganizationStructuredData() {
  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'YouTube Summary',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://youtube-summary.com',
    logo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://youtube-summary.com'}/images/logo.png`,
    description: 'AI-powered YouTube video summarization service.',
    sameAs: [
      'https://twitter.com/YouTubeSummary',
      'https://github.com/youtubesummary',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'support@youtube-summary.com',
    },
  };

  return <StructuredData data={organizationData} />;
}

export function SoftwareApplicationStructuredData() {
  const softwareData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'YouTube Summary',
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Web Browser',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://youtube-summary.com',
    description: 'AI-powered tool for generating intelligent summaries from YouTube videos.',
    softwareVersion: '1.0',
    datePublished: '2024-01-01',
    author: {
      '@type': 'Organization',
      name: 'YouTube Summary Team',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      validFrom: '2024-01-01',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
      bestRating: '5',
      worstRating: '1',
    },
    featureList: [
      'AI-powered video summarization',
      'Multi-language support',
      'Various output formats',
      'Batch processing',
      'Export to multiple formats',
    ],
  };

  return <StructuredData data={softwareData} />;
}

export function BreadcrumbStructuredData({ items }: { items: Array<{ name: string; url: string }> }) {
  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${process.env.NEXT_PUBLIC_APP_URL || 'https://youtube-summary.com'}${item.url}`,
    })),
  };

  return <StructuredData data={breadcrumbData} />;
}

export function ArticleStructuredData({
  title,
  description,
  author,
  datePublished,
  dateModified,
  url,
  image,
}: {
  title: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  url: string;
  image?: string;
}) {
  const articleData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    author: {
      '@type': 'Person',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'YouTube Summary',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://youtube-summary.com'}/images/logo.png`,
      },
    },
    datePublished,
    dateModified: dateModified || datePublished,
    url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://youtube-summary.com'}${url}`,
    image: image ? `${process.env.NEXT_PUBLIC_APP_URL || 'https://youtube-summary.com'}${image}` : undefined,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${process.env.NEXT_PUBLIC_APP_URL || 'https://youtube-summary.com'}${url}`,
    },
  };

  return <StructuredData data={articleData} />;
}

export function FAQStructuredData({ faqs }: { faqs: Array<{ question: string; answer: string }> }) {
  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return <StructuredData data={faqData} />;
}

export function ProductStructuredData({
  name,
  description,
  image,
  price,
  currency = 'USD',
  availability = 'InStock',
  rating,
  reviewCount,
}: {
  name: string;
  description: string;
  image?: string;
  price: string;
  currency?: string;
  availability?: string;
  rating?: number;
  reviewCount?: number;
}) {
  const productData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: image ? `${process.env.NEXT_PUBLIC_APP_URL || 'https://youtube-summary.com'}${image}` : undefined,
    brand: {
      '@type': 'Brand',
      name: 'YouTube Summary',
    },
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: currency,
      availability: `https://schema.org/${availability}`,
      seller: {
        '@type': 'Organization',
        name: 'YouTube Summary',
      },
    },
    aggregateRating: rating && reviewCount ? {
      '@type': 'AggregateRating',
      ratingValue: rating.toString(),
      reviewCount: reviewCount.toString(),
    } : undefined,
  };

  return <StructuredData data={productData} />;
}