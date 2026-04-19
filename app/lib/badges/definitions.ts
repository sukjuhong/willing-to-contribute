// Badge catalog (#61).
// IDs are persisted in Supabase `user_badges.badge_id` and emitted in
// `badge_earned` activity event payloads. Keep in sync with
// supabase/migrations/011_create_user_badges.sql.

export type BadgeId = 'first_pick' | 'first_merge' | 'polyglot' | 'explorer';

export interface BadgeDefinition {
  id: BadgeId;
  /** i18n key under `badge.<id>.name` */
  nameKey: string;
  /** i18n key under `badge.<id>.description` */
  descriptionKey: string;
  /** Lucide icon name — caller imports the matching component */
  icon: 'sparkles' | 'git-merge' | 'languages' | 'compass';
  /** Tailwind gradient classes for the unlocked state */
  gradient: string;
}

export const BADGE_DEFINITIONS: readonly BadgeDefinition[] = [
  {
    id: 'first_pick',
    nameKey: 'badge.first_pick.name',
    descriptionKey: 'badge.first_pick.description',
    icon: 'sparkles',
    gradient: 'from-amber-400 to-orange-500',
  },
  {
    id: 'first_merge',
    nameKey: 'badge.first_merge.name',
    descriptionKey: 'badge.first_merge.description',
    icon: 'git-merge',
    gradient: 'from-emerald-400 to-teal-500',
  },
  {
    id: 'polyglot',
    nameKey: 'badge.polyglot.name',
    descriptionKey: 'badge.polyglot.description',
    icon: 'languages',
    gradient: 'from-fuchsia-400 to-purple-500',
  },
  {
    id: 'explorer',
    nameKey: 'badge.explorer.name',
    descriptionKey: 'badge.explorer.description',
    icon: 'compass',
    gradient: 'from-sky-400 to-blue-500',
  },
] as const;

export function getBadgeDefinition(id: string): BadgeDefinition | undefined {
  return BADGE_DEFINITIONS.find(b => b.id === id);
}
