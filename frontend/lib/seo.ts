import type { Metadata } from 'next';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  siteName?: string;
  locale?: string;
}

const defaultSEO = {
  siteName: 'Summar.me',
  locale: 'en-US',
  domain: process.env.NEXT_PUBLIC_APP_URL || 'https://summar.me',
  defaultTitle: 'Summar.me - AI-Powered Video Summaries',
  defaultDescription: 'Transform long YouTube videos into concise, intelligent summaries powered by AI. Save time and get key insights instantly from any video.',
  defaultKeywords: [
    'YouTube summarizer',
    'AI video summary',
    'YouTube summary tool',
    'video to text',
    'YouTube transcript',
    'AI content extraction',
    'video analysis',
    'YouTube automation',
    'content summarization',
    'AI productivity tool'
  ],
  defaultImage: '/images/og-image.svg',
  twitterHandle: '@summar_me',
};

export function generateSEOMetadata(props: SEOProps = {}): Metadata {
  const {
    title,
    description = defaultSEO.defaultDescription,
    keywords = defaultSEO.defaultKeywords,
    image = defaultSEO.defaultImage,
    url,
    type = 'website',
    publishedTime,
    modifiedTime,
    author,
    siteName = defaultSEO.siteName,
    locale = defaultSEO.locale,
  } = props;

  const fullTitle = title 
    ? `${title} | ${defaultSEO.siteName}`
    : defaultSEO.defaultTitle;

  const fullUrl = url 
    ? `${defaultSEO.domain}${url}`
    : defaultSEO.domain;

  const fullImage = image.startsWith('http') 
    ? image 
    : `${defaultSEO.domain}${image}`;

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    authors: author ? [{ name: author }] : undefined,
    
    // Open Graph
    openGraph: {
      title: fullTitle,
      description,
      url: fullUrl,
      siteName,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        }
      ],
      locale,
      type: type === 'article' ? 'article' : 'website',
      publishedTime,
      modifiedTime,
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [fullImage],
      creator: defaultSEO.twitterHandle,
      site: defaultSEO.twitterHandle,
    },

    // Additional metadata
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Verification and analytics
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },

    // Language alternatives
    alternates: {
      canonical: fullUrl,
      languages: {
        'en-US': fullUrl,
        'ru-RU': fullUrl.replace('/en/', '/ru/'),
      },
    },

    // App metadata for mobile
    applicationName: siteName,
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: siteName,
    },

    // Additional tags
    other: {
      'msapplication-TileColor': '#2563eb',
      'theme-color': '#2563eb',
    },
  };
}

// Predefined SEO configurations for common pages
export const pageSEOConfigs = {
  home: {
    title: 'YouTube Summary - AI-Powered Video Summaries',
    description: 'Transform long YouTube videos into concise, intelligent summaries powered by AI. Save time and get key insights instantly from any video.',
    keywords: ['YouTube summarizer', 'AI video summary', 'YouTube summary tool', 'video to text'],
    url: '/',
  },
  
  features: {
    title: 'Features - YouTube Summary Tool',
    description: 'Discover powerful features of our AI-powered YouTube summarizer. Multi-language support, various formats, and smart content extraction.',
    keywords: ['YouTube features', 'AI summarizer capabilities', 'video analysis tools'],
    url: '/features',
  },


  login: {
    title: 'Sign In - YouTube Summary',
    description: 'Sign in to your YouTube Summary account to access AI-powered video summarization tools.',
    keywords: ['login', 'sign in', 'YouTube summary account'],
    url: '/login',
  },

  register: {
    title: 'Create Account - YouTube Summary',
    description: 'Create your free YouTube Summary account and start generating AI-powered video summaries today.',
    keywords: ['register', 'create account', 'free YouTube summarizer'],
    url: '/register',
  },

  resetPassword: {
    title: 'Reset Password - YouTube Summary',
    description: 'Reset your YouTube Summary account password. Secure password recovery process.',
    keywords: ['reset password', 'password recovery', 'forgot password'],
    url: '/reset-password',
  },

  verifyEmail: {
    title: 'Verify Email - YouTube Summary',
    description: 'Verify your email address to complete your YouTube Summary account registration.',
    keywords: ['verify email', 'email confirmation', 'activate account'],
    url: '/verify-email',
  },

  forgotPassword: {
    title: 'Forgot Password - YouTube Summary',
    description: 'Request a password reset link for your YouTube Summary account.',
    keywords: ['forgot password', 'password reset request'],
    url: '/forgot-password',
  },

  termsOfService: {
    title: 'Terms of Service - YouTube Summary',
    description: 'Read our terms of service and user agreement for using YouTube Summary platform.',
    keywords: ['terms of service', 'user agreement', 'legal terms'],
    url: '/legal/terms',
  },

  privacyPolicy: {
    title: 'Privacy Policy - YouTube Summary',
    description: 'Learn how we protect your privacy and handle your data at YouTube Summary.',
    keywords: ['privacy policy', 'data protection', 'user privacy'],
    url: '/legal/privacy',
  },

  cookiePolicy: {
    title: 'Cookie Policy - YouTube Summary',
    description: 'Understand how we use cookies to improve your experience on YouTube Summary.',
    keywords: ['cookie policy', 'cookies', 'tracking'],
    url: '/legal/cookies',
  },

} as const;

// Helper function for dynamic content SEO
export function generateDynamicSEO(
  pageType: keyof typeof pageSEOConfigs,
  overrides: Partial<SEOProps> = {}
): Metadata {
  const baseConfig = pageSEOConfigs[pageType];
  return generateSEOMetadata({ ...baseConfig, ...overrides });
}

// Schema.org structured data generators
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: defaultSEO.siteName,
    url: defaultSEO.domain,
    description: defaultSEO.defaultDescription,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${defaultSEO.domain}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: defaultSEO.siteName,
    url: defaultSEO.domain,
    logo: `${defaultSEO.domain}/images/logo.png`,
    description: defaultSEO.defaultDescription,
    sameAs: [
      'https://twitter.com/YouTubeSummary',
      'https://github.com/youtubesummary',
    ],
  };
}

export function generateSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: defaultSEO.siteName,
    applicationCategory: 'Productivity',
    operatingSystem: 'Web Browser',
    url: defaultSEO.domain,
    description: defaultSEO.defaultDescription,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
      bestRating: '5',
      worstRating: '1',
    },
  };
}