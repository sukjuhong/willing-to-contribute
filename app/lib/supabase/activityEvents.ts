import { createClient } from '@/app/lib/supabase/client';
import { Database, Json } from '@/app/types/supabase';

export type ActivityEventType =
  | 'issue_picked'
  | 'issue_unpicked'
  | 'contribution_verified'
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
    await supabase.from('user_activity_events').insert(row as never);
  } catch {
    // Logging must never disrupt the main flow.
  }
}
