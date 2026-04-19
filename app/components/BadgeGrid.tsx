'use client';

import { useTranslations } from 'next-intl';
import { Sparkles, GitMerge, Languages, Compass, Lock } from 'lucide-react';
import { BADGE_DEFINITIONS, type BadgeDefinition } from '@/app/lib/badges/definitions';
import useUserBadges, { type EarnedBadge } from '@/app/hooks/useUserBadges';

interface BadgeGridProps {
  userId?: string;
}

const ICON_MAP = {
  sparkles: Sparkles,
  'git-merge': GitMerge,
  languages: Languages,
  compass: Compass,
} as const;

function BadgeCard({
  badge,
  earned,
}: {
  badge: BadgeDefinition;
  earned: EarnedBadge | undefined;
}) {
  // Badge keys are dynamic strings derived from the catalog; next-intl's typed
  // useTranslations expects literal keys, so we widen the signature locally.
  const t = useTranslations() as unknown as (
    key: string,
    values?: Record<string, string | number>,
  ) => string;
  const Icon = ICON_MAP[badge.icon];
  const isUnlocked = Boolean(earned);

  return (
    <div
      className={`relative flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition ${
        isUnlocked
          ? 'border-border bg-card'
          : 'border-dashed border-border/60 bg-muted/30'
      }`}
      aria-label={
        isUnlocked ? t(badge.nameKey) : `${t(badge.nameKey)} - ${t('badge.locked')}`
      }
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full ${
          isUnlocked
            ? `bg-gradient-to-br ${badge.gradient} text-white shadow-sm`
            : 'bg-muted text-muted-foreground'
        }`}
      >
        {isUnlocked ? <Icon className="h-6 w-6" /> : <Lock className="h-5 w-5" />}
      </div>
      <div className="space-y-0.5">
        <p
          className={`text-xs font-semibold ${
            isUnlocked ? 'text-foreground' : 'text-muted-foreground'
          }`}
        >
          {t(badge.nameKey)}
        </p>
        <p className="text-[10px] leading-tight text-muted-foreground line-clamp-2">
          {t(badge.descriptionKey)}
        </p>
      </div>
    </div>
  );
}

export default function BadgeGrid({ userId }: BadgeGridProps) {
  const t = useTranslations();
  const { earned, loading } = useUserBadges(userId);

  const earnedById = new Map(earned.map(b => [b.badgeId, b]));
  const earnedCount = earned.length;
  const total = BADGE_DEFINITIONS.length;
  // Suppress the locked-grid flicker on the very first fetch — once we have any
  // badges (or a finished load), render the real grid even while refreshing.
  const showSkeleton = loading && earned.length === 0;

  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{t('badge.gridTitle')}</h3>
        <span className="text-xs text-muted-foreground">
          {showSkeleton ? '…' : t('badge.progress', { earned: earnedCount, total })}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {showSkeleton
          ? BADGE_DEFINITIONS.map(badge => (
              <div
                key={badge.id}
                className="h-[120px] rounded-lg border border-dashed border-border/40 bg-muted/20 animate-pulse"
                aria-hidden
              />
            ))
          : BADGE_DEFINITIONS.map(badge => (
              <BadgeCard key={badge.id} badge={badge} earned={earnedById.get(badge.id)} />
            ))}
      </div>
    </section>
  );
}
