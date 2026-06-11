import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://youtube-summary.com';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/features',
          '/login',
          '/register',
          '/legal/*',
          '/share/*',
        ],
        disallow: [
          '/api/*',
          '/_next/*',
          '/private/*',
          '/admin/*',
          '/(auth)/',
          '/create-summary',
          '/summaries',
          '/settings',
          '/archived',
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
      {
        userAgent: 'ChatGPT-User',
        disallow: '/',
      },
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
      {
        userAgent: 'anthropic-ai',
        disallow: '/',
      },
      {
        userAgent: 'Claude-Web',
        disallow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}