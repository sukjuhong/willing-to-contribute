import type { Metadata } from 'next';
import { getWeeklyPicks, getIsoWeekAndYear } from '../lib/weeklyPicks';
import WeeklyPicksClient from './WeeklyPicksClient';

export const revalidate = 604800; // 1 week in seconds

export async function generateMetadata(): Promise<Metadata> {
  const { weekNumber, year } = getIsoWeekAndYear(new Date());

  const title = `Weekly Picks - Week ${weekNumber}, ${year}`;
  const description = `Top 10 beginner-friendly open source issues curated for Week ${weekNumber}, ${year}. Find your next contribution on Pickssue.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: '/weekly-picks',
      siteName: 'Pickssue',
      type: 'website',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Pickssue Weekly Picks',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png'],
    },
  };
}

export default async function WeeklyPicksPage() {
  const data = await getWeeklyPicks();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Pickssue Weekly Picks - Week ${data.weekNumber}, ${data.year}`,
    description: `Top 10 beginner-friendly open source issues curated for Week ${data.weekNumber}, ${data.year}.`,
    url: 'https://pickssue.dev/weekly-picks',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Pickssue',
      url: 'https://pickssue.dev',
    },
    datePublished: data.generatedAt,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: data.issues.length,
      itemListElement: data.issues.map((issue, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        item: {
          '@type': 'SoftwareSourceCode',
          name: issue.title,
          url: issue.url,
          codeRepository: issue.repository.url,
        },
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <WeeklyPicksClient data={data} />
    </>
  );
}
