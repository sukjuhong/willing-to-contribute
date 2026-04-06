import { createClient } from '@/app/lib/supabase/client';
import { UserSettings } from '@/app/types';
import { Database } from '@/app/types/supabase';

type UserSettingsRow = Database['public']['Tables']['user_settings']['Row'];
type UserSettingsInsert = Database['public']['Tables']['user_settings']['Insert'];

export async function loadUserSettings(userId: string): Promise<UserSettings | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single<UserSettingsRow>();

  if (error || !data) return null;

  return {
    repositories: (data.repositories as unknown as UserSettings['repositories']) ?? [],
    customLabels: (data.custom_labels as unknown as string[]) ?? [],
    notificationFrequency:
      (data.notification_frequency as UserSettings['notificationFrequency']) ?? 'daily',
    hideClosedIssues: data.hide_closed_issues ?? true,
  };
}

export async function saveUserSettings(
  userId: string,
  settings: UserSettings,
): Promise<void> {
  const supabase = createClient();
  const row: UserSettingsInsert = {
    user_id: userId,
    repositories: settings.repositories as unknown as UserSettingsInsert['repositories'],
    custom_labels:
      settings.customLabels as unknown as UserSettingsInsert['custom_labels'],
    notification_frequency: settings.notificationFrequency,
    hide_closed_issues: settings.hideClosedIssues,
    updated_at: new Date().toISOString(),
  };
  // @supabase/ssr upsert() overload resolution fails with custom Database types
  await supabase.from('user_settings').upsert(row as never);
}
