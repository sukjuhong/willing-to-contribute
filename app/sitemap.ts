import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://willing-to-contribute.vercel.app';
  const staticPageDate = '2026-03-23';

  const locales = ['en', 'ko'];
  const pages = [
    {
      path: '',
      changeFrequency: 'daily' as const,
      priority: 1,
      lastModified: new Date(),
    },
    {
      path: '/issues',
      changeFrequency: 'daily' as const,
      priority: 0.8,
      lastModified: new Date(),
    },
    {
      path: '/repositories',
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      lastModified: new Date(),
    },
    {
      path: '/settings',
      changeFrequency: 'monthly' as const,
      priority: 0.5,
      lastModified: new Date(),
    },
    {
      path: '/about',
      changeFrequency: 'monthly' as const,
      priority: 0.6,
      lastModified: staticPageDate,
    },
    {
      path: '/privacy',
      changeFrequency: 'monthly' as const,
      priority: 0.4,
      lastModified: staticPageDate,
    },
    {
      path: '/terms',
      changeFrequency: 'monthly' as const,
      priority: 0.4,
      lastModified: staticPageDate,
    },
    {
      path: '/guide',
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      lastModified: staticPageDate,
    },
    {
      path: '/faq',
      changeFrequency: 'monthly' as const,
      priority: 0.5,
      lastModified: staticPageDate,
    },
  ];

  return pages.flatMap(page =>
    locales.map(locale => ({
      url: `${baseUrl}/${locale}${page.path}`,
      lastModified: page.lastModified,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: {
        languages: Object.fromEntries(
          locales.map(l => [l, `${baseUrl}/${l}${page.path}`]),
        ),
      },
    })),
  );
}
