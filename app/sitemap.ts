import { MetadataRoute } from 'next';
import { TOP_15_LANGUAGES } from '@/app/lib/findFirstIssue';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://pickssue.dev';

  const findFirstIssueUrls: MetadataRoute.Sitemap = TOP_15_LANGUAGES.map(lang => ({
    url: `${baseUrl}/find-your-first-issue?lang=${lang.toLowerCase()}`,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/find-your-first-issue`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...findFirstIssueUrls,
    {
      url: `${baseUrl}/about`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guide`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];
}
