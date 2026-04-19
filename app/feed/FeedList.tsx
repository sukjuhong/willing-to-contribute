'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useLocaleSwitch } from '@/app/providers/IntlProvider';
import { Card } from '@/components/ui/card';
import { formatRelativeTime } from '@/app/utils/formatRelativeTime';
import type { ActivityFeedItem } from '@/app/lib/supabase/activityFeed';

interface FeedListProps {
  items: ActivityFeedItem[];
}

interface RepoLike {
  repository_owner?: unknown;
  repository_name?: unknown;
}

interface BadgePayload {
  badge_id?: unknown;
}

function repoLabel(payload: Record<string, unknown>): string | null {
  const p = payload as RepoLike;
  if (typeof p.repository_owner === 'string' && typeof p.repository_name === 'string') {
    return `${p.repository_owner}/${p.repository_name}`;
  }
  return null;
}

function badgeLabel(payload: Record<string, unknown>): string | null {
  const p = payload as BadgePayload;
  if (typeof p.badge_id === 'string' && p.badge_id.length > 0) {
    return p.badge_id;
  }
  return null;
}

function FeedRow({ item }: { item: ActivityFeedItem }) {
  const tCommon = useTranslations('common');
  const tFeed = useTranslations('feed');
  const { locale } = useLocaleSwitch();

  const repo = repoLabel(item.payload);
  const badge = badgeLabel(item.payload);

  let description: React.ReactNode;
  switch (item.eventType) {
    case 'issue_picked':
      description = repo
        ? tFeed('event.issuePickedRepo', { user: item.username, repo })
        : tFeed('event.issuePicked', { user: item.username });
      break;
    case 'contribution_completed':
      description = repo
        ? tFeed('event.contributionCompletedRepo', { user: item.username, repo })
        : tFeed('event.contributionCompleted', { user: item.username });
      break;
    case 'badge_earned':
      description = badge
        ? tFeed('event.badgeEarnedNamed', { user: item.username, badge })
        : tFeed('event.badgeEarned', { user: item.username });
      break;
    default:
      description = item.username;
  }

  return (
    <Card className="rounded-lg border-border p-4 hover:border-primary/30 transition-colors gap-0">
      <div className="flex items-start gap-3">
        <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
          <Image
            src={item.avatarUrl}
            alt={`${item.username}'s avatar`}
            width={40}
            height={40}
            className="rounded-full"
            unoptimized
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground leading-relaxed">{description}</p>
          <p className="text-xs text-muted-foreground/80 mt-1">
            {formatRelativeTime(item.createdAt, tCommon, locale)}
          </p>
        </div>
      </div>
    </Card>
  );
}

export default function FeedList({ items }: FeedListProps) {
  const tFeed = useTranslations('feed');

  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-base">{tFeed('empty')}</p>
        <p className="text-xs text-muted-foreground/60 mt-2">{tFeed('emptyHint')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map(item => (
        <FeedRow key={item.id} item={item} />
      ))}
    </div>
  );
}
