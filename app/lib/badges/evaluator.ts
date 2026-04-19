import { createClient } from '@/app/lib/supabase/client';

/**
 * Manually trigger badge re-evaluation for a user.
 *
 * The Supabase trigger on user_activity_events normally handles this in-band,
 * but this helper exists as a fallback for backfill scripts or if the trigger
 * is disabled. Safe to call repeatedly — the underlying SQL uses
 * `on conflict do nothing`.
 */
export async function reevaluateUserBadges(userId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.rpc(
    'evaluate_user_badges' as never,
    {
      p_user_id: userId,
    } as never,
  );
  if (error) {
    console.error('[badges] evaluate_user_badges rpc failed:', error);
  }
}
