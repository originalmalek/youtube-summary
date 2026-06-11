import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://youtube-summary.com';
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date('2025-10-29'),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/features`,
      lastModified: new Date('2025-10-15'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date('2025-08-01'),
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date('2025-08-01'),
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/forgot-password`,
      lastModified: new Date('2025-08-01'),
      changeFrequency: 'yearly' as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/legal/privacy`,
      lastModified: new Date('2025-08-08'),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/legal/terms`,
      lastModified: new Date('2025-08-08'),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/legal/cookies`,
      lastModified: new Date('2025-08-08'),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ];

  // Note: /share/[shareId] pages are dynamic and indexed via robots.txt
  // Payment result pages are intentionally excluded (temporary pages)
  // Dynamic shared summaries can be added here if you want to pre-generate sitemap

  return staticPages;
}