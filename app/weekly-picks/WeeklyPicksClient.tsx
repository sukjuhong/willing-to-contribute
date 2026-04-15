'use client';

import React from 'react';
import { FaStar, FaCodeBranch, FaCalendarWeek } from 'react-icons/fa';
import { LuShield, LuCircleDot, LuUsers, LuFlame } from 'react-icons/lu';
import { useTranslations } from 'next-intl';
import { useLocaleSwitch } from '@/app/providers/IntlProvider';
import type { WeeklyPicksData } from '../lib/weeklyPicks';
import type { Issue } from '../types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type CompetitionStatus = 'available' | 'inProgress' | 'hot';

const getCompetitionStatus = (
  comments: number | undefined,
  assignee: string | null | undefined,
): CompetitionStatus => {
  if (assignee) return 'inProgress';
  if ((comments ?? 0) >= 3) return 'hot';
  return 'available';
};

const competitionStatusStyles: Record<CompetitionStatus, string> = {
  available: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  inProgress: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  hot: 'bg-red-500/15 text-red-400 border-red-500/20',
};

const competitionStatusIcons: Record<CompetitionStatus, React.ReactNode> = {
  available: <LuCircleDot className="shrink-0 size-2.5" />,
  inProgress: <LuUsers className="shrink-0 size-2.5" />,
  hot: <LuFlame className="shrink-0 size-2.5" />,
};

const maintainerGradeStyles: Record<string, string> = {
  A: 'bg-emerald-500/15 text-emerald-400',
  B: 'bg-amber-500/15 text-amber-400',
  C: 'bg-muted text-muted-foreground',
};

const formatRelativeTime = (
  dateString: string,
  tCommon: ReturnType<typeof useTranslations<'common'>>,
  locale: string,
): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 1) return tCommon('justNow');
  if (diffInHours < 24) return tCommon('hoursAgo', { hours: diffInHours });
  if (diffInDays < 30) return tCommon('daysAgo', { days: diffInDays });
  return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US').format(date);
};

function WeeklyIssueCard({ issue, rank }: { issue: Issue; rank: number }) {
  const tCommon = useTranslations('common');
  const tMaintainer = useTranslations('maintainer');
  const tIssue = useTranslations('issue');
  const { locale } = useLocaleSwitch();

  const competitionStatus = getCompetitionStatus(issue.comments, issue.assignee);

  return (
    <Card className="rounded-lg border-border p-4 hover:border-primary/30 transition-colors gap-0">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
          {rank}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-semibold text-foreground">
              <a
                href={issue.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                {issue.title}
              </a>
            </h3>
            {issue.repository.maintainerScore && (
              <Badge
                variant="outline"
                className={cn(
                  'inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded border-none',
                  maintainerGradeStyles[issue.repository.maintainerScore.grade],
                )}
                title={`${tMaintainer(`grade${issue.repository.maintainerScore.grade}`)} · ${tMaintainer('responseTime', { hours: Math.round(issue.repository.maintainerScore.avgResponseTimeHours) })} · ${tMaintainer('mergeRate', { rate: Math.round(issue.repository.maintainerScore.mergeRate * 100) })}`}
              >
                <LuShield className="shrink-0 size-[11px]" />
                {tMaintainer(`grade${issue.repository.maintainerScore.grade}`)}
              </Badge>
            )}
            <Badge
              variant="outline"
              className={cn(
                'inline-flex items-center gap-1 text-xs py-0.5 px-2 rounded font-medium',
                competitionStatusStyles[competitionStatus],
              )}
            >
              {competitionStatusIcons[competitionStatus]}
              {tIssue(`status.${competitionStatus}`)}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-2">
            {issue.labels.map(label => (
              <Badge
                key={label.id}
                variant="outline"
                className="text-xs px-2 py-0.5 rounded-full border-none"
                style={{
                  backgroundColor: `#${label.color}25`,
                  color: `#${label.color}`,
                  border: `1px solid #${label.color}50`,
                }}
              >
                {label.name}
              </Badge>
            ))}
          </div>

          <div className="flex items-center mt-3 text-sm text-muted-foreground flex-wrap gap-y-1 gap-x-3">
            <span className="font-mono text-xs text-foreground/70">
              {issue.repository.owner}/{issue.repository.name} #{issue.number}
            </span>
            {issue.repository.stargazersCount !== undefined && (
              <span className="inline-flex items-center gap-1 text-xs">
                <FaStar className="text-amber-400/70 text-[10px]" />
                {issue.repository.stargazersCount.toLocaleString()}
              </span>
            )}
            {issue.repository.forksCount !== undefined && (
              <span className="inline-flex items-center gap-1 text-xs">
                <FaCodeBranch className="text-[10px]" />
                {issue.repository.forksCount.toLocaleString()}
              </span>
            )}
            {issue.repository.language && (
              <span className="text-xs">{issue.repository.language}</span>
            )}
            <span className="text-xs">
              {formatRelativeTime(issue.createdAt, tCommon, locale)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

interface WeeklyPicksClientProps {
  data: WeeklyPicksData;
}

export default function WeeklyPicksClient({ data }: WeeklyPicksClientProps) {
  const t = useTranslations('weeklyPicks');

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FaCalendarWeek className="text-primary text-xl" />
            <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            {t('subtitle', {
              week: data.weekNumber,
              year: data.year,
            })}
          </p>
          <p className="text-muted-foreground/60 text-xs mt-1">
            {t('generatedAt', {
              date: new Date(data.generatedAt).toLocaleDateString(),
            })}
          </p>
        </div>

        {/* Issue list */}
        {data.issues.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">{t('noIssues')}</div>
        ) : (
          <div className="space-y-3">
            {data.issues.map((issue, idx) => (
              <WeeklyIssueCard key={issue.id} issue={issue} rank={idx + 1} />
            ))}
          </div>
        )}

        {/* Footer note */}
        <div className="mt-8 text-center text-xs text-muted-foreground/60">
          {t('autoRefresh')}
        </div>
      </div>
    </div>
  );
}
