import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/ai-job-search-tools',
    '/free-ats-resume-builder',
    '/free-ai-cover-letter-generator',
    '/free-linkedin-post-generator',
    '/ai-resume-builder-for-freshers',
    '/cover-letter-for-career-change',
    '/contact',
    '/privacy',
    '/terms',
    '/cookies',
    '/disclaimer',
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));
}
