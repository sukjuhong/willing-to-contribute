import { createClient as createSupabaseJsClient } from '@supabase/supabase-js';
import { env } from '@/app/lib/env';
import { Database, Json } from '@/app/types/supabase';

export type FeedEventType = 'issue_picked' | 'contribution_completed' | 'badge_earned';

export interface ActivityFeedItem {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string;
  eventType: FeedEventType;
  payload: Record<string, unknown>;
  createdAt: string;
}

interface PublicActivityFeedRow {
  id: string;
  user_id: string;
  event_type: string;
  payload: Json;
  created_at: string;
  username: string;
}

const ALLOWED_TYPES: ReadonlySet<FeedEventType> = new Set([
  'issue_picked',
  'contribution_completed',
  'badge_earned',
]);

function isFeedEventType(value: string): value is FeedEventType {
  return ALLOWED_TYPES.has(value as FeedEventType);
}

function toAvatarUrl(githubId: string): string {
  // user_profiles.id stores the GitHub numeric ID; the static URL pattern is allowed
  // by next.config.ts remotePatterns (avatars.githubusercontent.com/u/**).
  return `https://avatars.githubusercontent.com/u/${githubId}?v=4`;
}

/**
 * Fetch the most recent public activity events.
 *
 * Backed by the `public_activity_feed` SQL view (see migration 010), which:
 * - joins user_profiles where is_public = true,
 * - restricts to the last 24 hours,
 * - applies anti-spam (max 5 events per user per hour),
 * - filters to the three MVP event types.
 *
 * The default `limit` of 50 matches the spec.
 */
export async function getPublicActivityFeed(
  limit: number = 50,
): Promise<ActivityFeedItem[]> {
  // Use a stateless anon client (no cookie binding) so the calling page can be
  // statically generated and revalidated via `export const revalidate = 60`.
  // The `public_activity_feed` view enforces all access control on its own.
  const supabase = createSupabaseJsClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const { data, error } = await supabase
    .from('public_activity_feed')
    .select('*')
    .limit(limit);

  if (error || !data) {
    if (error) {
      console.error('[activityFeed] query failed:', error);
    }
    return [];
  }

  return (data as unknown as PublicActivityFeedRow[])
    .filter(row => isFeedEventType(row.event_type))
    .map(row => ({
      id: row.id,
      userId: row.user_id,
      username: row.username,
      avatarUrl: toAvatarUrl(row.user_id),
      eventType: row.event_type as FeedEventType,
      payload: (row.payload as Record<string, unknown>) ?? {},
      createdAt: row.created_at,
    }));
}
