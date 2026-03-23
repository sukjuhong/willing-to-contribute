import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://willing-to-contribute.vercel.app';
  const staticPageDate = '2026-03-23';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
      alternates: {
        languages: {
          en: baseUrl,
          ko: `${baseUrl}?lang=ko`,
        },
      },
    },
    {
      url: `${baseUrl}/issues`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
      alternates: {
        languages: {
          en: `${baseUrl}/issues`,
          ko: `${baseUrl}/issues?lang=ko`,
        },
      },
    },
    {
      url: `${baseUrl}/repositories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
      alternates: {
        languages: {
          en: `${baseUrl}/repositories`,
          ko: `${baseUrl}/repositories?lang=ko`,
        },
      },
    },
    {
      url: `${baseUrl}/settings`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
      alternates: {
        languages: {
          en: `${baseUrl}/settings`,
          ko: `${baseUrl}/settings?lang=ko`,
        },
      },
    },
    {
      url: `${baseUrl}/about`,
      lastModified: staticPageDate,
      changeFrequency: 'monthly',
      priority: 0.6,
      alternates: {
        languages: {
          en: `${baseUrl}/about`,
          ko: `${baseUrl}/about?lang=ko`,
        },
      },
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: staticPageDate,
      changeFrequency: 'monthly',
      priority: 0.4,
      alternates: {
        languages: {
          en: `${baseUrl}/privacy`,
          ko: `${baseUrl}/privacy?lang=ko`,
        },
      },
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: staticPageDate,
      changeFrequency: 'monthly',
      priority: 0.4,
      alternates: {
        languages: {
          en: `${baseUrl}/terms`,
          ko: `${baseUrl}/terms?lang=ko`,
        },
      },
    },
    {
      url: `${baseUrl}/guide`,
      lastModified: staticPageDate,
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: {
        languages: {
          en: `${baseUrl}/guide`,
          ko: `${baseUrl}/guide?lang=ko`,
        },
      },
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: staticPageDate,
      changeFrequency: 'monthly',
      priority: 0.5,
      alternates: {
        languages: {
          en: `${baseUrl}/faq`,
          ko: `${baseUrl}/faq?lang=ko`,
        },
      },
    },
  ];
}
