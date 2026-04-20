'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { FaGithub, FaBookmark } from 'react-icons/fa';
import { LuShield, LuLightbulb, LuExternalLink } from 'react-icons/lu';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/app/utils/formatRelativeTime';
import { useLocaleSwitch } from '@/app/providers/IntlProvider';
import type { RepoIssue, RepoTip, MaintainerScoreData } from './page';

interface RepoLandingClientProps {
  owner: string;
  name: string;
  issues: RepoIssue[];
  tips: RepoTip[];
  maintainerScore: MaintainerScoreData | null;
}

const maintainerGradeStyles = {
  A: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  B: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  C: 'bg-muted text-muted-foreground border-border',
};

type TipSort = 'popular' | 'recent';

export default function RepoLandingClient({
  owner,
  name,
  issues,
  tips,
  maintainerScore,
}: RepoLandingClientProps) {
  const t = useTranslations('repoLanding');
  const tMaintainer = useTranslations('maintainer');
  const tCommon = useTranslations('common');
  const { locale } = useLocaleSwitch();
  const [tipSort, setTipSort] = useState<TipSort>('popular');

  const sortedTips = useMemo(
    () =>
      tipSort === 'popular'
        ? [...tips].sort((a, b) => b.likeCount - a.likeCount)
        : [...tips].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [tips, tipSort],
  );

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/issues" className="hover:text-foreground transition-colors">
            {tCommon('issues')}
          </Link>
          <span>/</span>
          <span>{owner}</span>
          <span>/</span>
          <span className="text-foreground font-medium">{name}</span>
        </div>

        <h1 className="text-2xl font-bold text-foreground">
          {t('heading', { owner, name })}
        </h1>

        <div className="flex items-center gap-3 flex-wrap">
          <a
            href={`https://github.com/${owner}/${name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <FaGithub className="size-4" />
            {owner}/{name}
            <LuExternalLink className="size-3" />
          </a>

          {maintainerScore && (
            <Badge
              variant="outline"
              className={cn(
                'inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded',
                maintainerGradeStyles[maintainerScore.grade],
              )}
              title={`${tMaintainer(`grade${maintainerScore.grade}`)} · ${tMaintainer('responseTime', { hours: Math.round(maintainerScore.avgResponseTimeHours) })} · ${tMaintainer('mergeRate', { rate: Math.round(maintainerScore.mergeRate * 100) })}`}
            >
              <LuShield className="size-3.5 shrink-0" />
              {maintainerScore.grade} · {tMaintainer(`grade${maintainerScore.grade}`)}
            </Badge>
          )}
        </div>
      </div>

      {/* Beginner-friendly issues */}
      <section aria-labelledby="issues-heading">
        <h2
          id="issues-heading"
          className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2"
        >
          <FaBookmark className="size-4 text-primary" />
          {t('issuesHeading')}
          {issues.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              ({issues.length})
            </span>
          )}
        </h2>

        {issues.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('noIssues')}</p>
        ) : (
          <ul className="space-y-2">
            {issues.map(issue => (
              <li key={issue.issueUrl}>
                <Card className="p-3 rounded-lg border-border gap-0 hover:border-border/80 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <a
                        href={issue.issueUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-foreground hover:text-primary transition-colors line-clamp-2"
                      >
                        <span className="font-mono text-muted-foreground text-xs mr-1">
                          #{issue.issueNumber}
                        </span>
                        {issue.title}
                      </a>
                    </div>
                    {issue.pickCount > 0 && (
                      <Badge
                        variant="outline"
                        className="shrink-0 inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded border-border bg-muted text-muted-foreground"
                      >
                        <FaBookmark className="size-2.5" />
                        {issue.pickCount}
                      </Badge>
                    )}
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Contributor tips */}
      <section aria-labelledby="tips-heading">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2
            id="tips-heading"
            className="text-lg font-semibold text-foreground flex items-center gap-2"
          >
            <LuLightbulb className="size-4 text-amber-400" />
            {t('tipsHeading')}
            {tips.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({tips.length})
              </span>
            )}
          </h2>

          {tips.length > 1 && (
            <div className="inline-flex rounded-md border border-border overflow-hidden text-xs">
              <button
                type="button"
                onClick={() => setTipSort('popular')}
                className={cn(
                  'px-3 py-1.5 transition-colors',
                  tipSort === 'popular'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                )}
              >
                {t('tipsSortPopular')}
              </button>
              <button
                type="button"
                onClick={() => setTipSort('recent')}
                className={cn(
                  'px-3 py-1.5 transition-colors border-l border-border',
                  tipSort === 'recent'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                )}
              >
                {t('tipsSortRecent')}
              </button>
            </div>
          )}
        </div>

        {tips.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('noTips')}</p>
        ) : (
          <ul className="space-y-2">
            {sortedTips.map(tip => (
              <li
                key={tip.id}
                className="rounded-lg border border-border bg-muted/40 p-3"
              >
                <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                  {tip.content}
                </p>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{formatRelativeTime(tip.createdAt, tCommon, locale)}</span>
                  {tip.likeCount > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <span>+{tip.likeCount}</span>
                    </span>
                  )}
                  <a
                    href={tip.issueUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors truncate max-w-[200px]"
                  >
                    #{tip.issueUrl.split('/').pop()}
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* CTA to browse issues */}
      <div className="rounded-lg border border-border bg-muted/30 p-4 text-center space-y-2">
        <p className="text-sm text-muted-foreground">{t('ctaDesc')}</p>
        <Link
          href="/issues"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
        >
          {t('ctaLink')}
        </Link>
      </div>
    </div>
  );
}
