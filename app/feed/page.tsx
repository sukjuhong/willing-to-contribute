import type { Metadata } from 'next';
import { getPublicActivityFeed } from '@/app/lib/supabase/activityFeed';
import FeedList from './FeedList';
import FeedHeader from './FeedHeader';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Activity Feed',
  description:
    'See what the Pickssue community is working on right now — recent picks, contributions, and badges from public profiles.',
  alternates: {
    canonical: 'https://pickssue.dev/feed',
  },
  openGraph: {
    title: 'Activity Feed | Pickssue',
    description:
      'See what the Pickssue community is working on right now — recent picks, contributions, and badges from public profiles.',
    url: '/feed',
    siteName: 'Pickssue',
    type: 'website',
  },
};

export default async function FeedPage() {
  const items = await getPublicActivityFeed(50);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <FeedHeader />
        <FeedList items={items} />
      </div>
    </div>
  );
}
