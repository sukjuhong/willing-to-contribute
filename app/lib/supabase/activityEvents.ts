import { createClient } from '@/app/lib/supabase/client';
import { Database, Json } from '@/app/types/supabase';

export type ActivityEventType =
  | 'issue_picked'
  | 'issue_unpicked'
  | 'contribution_verified'
  | 'contribution_completed'
  | 'badge_earned';

type ActivityEventInsert = Database['public']['Tables']['user_activity_events']['Insert'];

export async function logActivityEvent(
  userId: string,
  eventType: ActivityEventType,
  payload: Json = {},
): Promise<void> {
  try {
    const supabase = createClient();
    const row: ActivityEventInsert = {
      user_id: userId,
      event_type: eventType,
      payload,
    };
    // `as never` is required because the hand-written Database type in
    // app/types/supabase.ts does not fully satisfy supabase-js's insert
    // overload generics (same pattern as pickedIssues.ts). Row is still
    // statically typed as ActivityEventInsert above.
    const { error } = await supabase.from('user_activity_events').insert(row as never);
    if (error) {
      console.error('[activityEvents] insert failed:', error);
    }
  } catch (err) {
    // Logging must never disrupt the main flow, but surface for debugging.
    console.error('[activityEvents] unexpected error:', err);
  }
}
