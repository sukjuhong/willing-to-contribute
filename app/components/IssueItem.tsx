import React, { useState, useRef, useEffect } from 'react';
import { Issue } from '../types';
import { FaGithub, FaClock, FaStar, FaCodeBranch } from 'react-icons/fa';
import {
  LuShield,
  LuCircleDot,
  LuUsers,
  LuFlame,
  LuShare2,
  LuAward,
} from 'react-icons/lu';
import { useTranslations } from 'next-intl';
import { useLocaleSwitch } from '@/app/providers/IntlProvider';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface IssueItemProps {
  issue: Issue;
  compact?: boolean;
}

const formatRelativeTime = (
  dateString: string,
  tCommon: ReturnType<typeof useTranslations<'common'>>,
  locale: string,
): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSecs < 60) {
    return tCommon('justNow');
  } else if (diffInMins < 60) {
    return tCommon('minutesAgo', { minutes: diffInMins });
  } else if (diffInHours < 24) {
    return tCommon('hoursAgo', { hours: diffInHours });
  } else if (diffInDays < 30) {
    return tCommon('daysAgo', { days: diffInDays });
  } else {
    return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US').format(date);
  }
};

const maintainerGradeStyles = {
  A: 'bg-emerald-500/15 text-emerald-400',
  B: 'bg-amber-500/15 text-amber-400',
  C: 'bg-muted text-muted-foreground',
};

const getMatchScoreStyle = (score: number): string => {
  if (score >= 70) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20';
  if (score >= 40) return 'bg-amber-500/15 text-amber-400 border-amber-500/20';
  return 'bg-muted text-muted-foreground border-border';
};

const qualityGradeStyles: Record<'A' | 'B' | 'C', string> = {
  A: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  B: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  C: 'bg-muted text-muted-foreground border-border',
};

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

interface CompetitionBadgeProps {
  status: CompetitionStatus;
  label: string;
  compact?: boolean;
}

const CompetitionBadge: React.FC<CompetitionBadgeProps> = ({
  status,
  label,
  compact,
}) => (
  <Badge
    variant="outline"
    className={cn(
      'inline-flex items-center gap-1 text-xs py-0.5 rounded font-medium',
      compact ? 'px-1.5' : 'px-2',
      competitionStatusStyles[status],
    )}
  >
    {competitionStatusIcons[status]}
    {label}
  </Badge>
);

interface ShareButtonProps {
  onClick: (e: React.MouseEvent) => void;
  label: string;
  copied: boolean;
  copiedLabel: string;
  compact?: boolean;
}

const ShareButton: React.FC<ShareButtonProps> = ({
  onClick,
  label,
  copied,
  copiedLabel,
  compact,
}) => (
  <div className="relative">
    <button
      onClick={onClick}
      title={label}
      className={cn(
        'inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded',
        compact ? 'p-0.5' : 'p-1',
      )}
      aria-label={label}
    >
      <LuShare2 className={compact ? 'size-3' : 'size-3.5'} />
    </button>
    {copied && (
      <span className="absolute right-0 bottom-full mb-1 whitespace-nowrap rounded bg-foreground px-1.5 py-0.5 text-[10px] text-background">
        {copiedLabel}
      </span>
    )}
  </div>
);

const IssueItem: React.FC<IssueItemProps> = ({ issue, compact = false }) => {
  const t = useTranslations();
  const tCommon = useTranslations('common');
  const tMaintainer = useTranslations('maintainer');
  const tIssue = useTranslations('issue');
  const tQuality = useTranslations('issue.quality');
  const { locale } = useLocaleSwitch();
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const competitionStatus = getCompetitionStatus(issue.comments, issue.assignee);

  const shareUrl = `${issue.url}?utm_source=pickssue&utm_medium=share`;
  const shareTitle = `${issue.title} - ${issue.repository.owner}/${issue.repository.name} #${issue.number}`;
  const shareText = `${shareTitle}\n${tCommon('shareText')}`;

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // user cancelled or error — no action needed
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        setCopied(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopied(false), 2000);
      } catch {
        // clipboard not available
      }
    }
  };

  if (compact) {
    return (
      <div
        className={cn(
          'bg-card rounded p-2 hover:bg-accent transition-colors border-l-2',
          issue.isNew
            ? 'border-amber-400'
            : issue.state === 'open'
              ? 'border-[color:var(--color-success)]'
              : 'border-[color:var(--color-danger)]',
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-foreground truncate">
              <a
                href={issue.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                <span className="font-mono text-muted-foreground">#{issue.number}</span>{' '}
                {issue.title}
              </a>
            </h3>

            <div className="flex flex-wrap items-center gap-1 mt-1">
              {issue.labels.slice(0, 3).map(label => (
                <Badge
                  key={label.id}
                  variant="outline"
                  className="text-xs px-1.5 py-0.5 rounded-full border-none"
                  style={{
                    backgroundColor: `#${label.color}15`,
                    color: `#${label.color}`,
                  }}
                >
                  {label.name}
                </Badge>
              ))}
              {issue.labels.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{issue.labels.length - 3}
                </span>
              )}
              {issue.labels.length > 0 && (
                <span
                  className="text-muted-foreground/30 text-xs mx-0.5 select-none"
                  aria-hidden="true"
                >
                  |
                </span>
              )}
              {issue.repository.maintainerScore && (
                <Badge
                  variant="outline"
                  className={cn(
                    'inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded border-none',
                    maintainerGradeStyles[issue.repository.maintainerScore.grade],
                  )}
                  title={`${tMaintainer(`grade${issue.repository.maintainerScore.grade}`)} · ${tMaintainer('responseTime', { hours: Math.round(issue.repository.maintainerScore.avgResponseTimeHours) })} · ${tMaintainer('mergeRate', { rate: Math.round(issue.repository.maintainerScore.mergeRate * 100) })}`}
                >
                  <LuShield className="shrink-0 size-2.5" />
                  {tMaintainer(`grade${issue.repository.maintainerScore.grade}`)}
                </Badge>
              )}
              {issue.qualityScore && (
                <Badge
                  variant="outline"
                  className={cn(
                    'inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded',
                    qualityGradeStyles[issue.qualityScore.grade],
                  )}
                  title={tQuality('tooltip', {
                    grade: issue.qualityScore.grade,
                    score: issue.qualityScore.score,
                  })}
                >
                  <LuAward className="shrink-0 size-2.5" />
                  {tQuality('label')} {issue.qualityScore.grade}
                </Badge>
              )}
              <CompetitionBadge
                status={competitionStatus}
                label={tIssue(`status.${competitionStatus}`)}
                compact
              />
              {issue.matchScore != null && (
                <Badge
                  variant="outline"
                  className={cn(
                    'inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded font-medium',
                    getMatchScoreStyle(issue.matchScore),
                  )}
                  title={tIssue('matchScoreTooltip')}
                >
                  {tIssue('matchScore', { score: issue.matchScore })}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end ml-3 shrink-0 text-xs text-muted-foreground gap-1">
            <span className="font-mono text-foreground/70">
              {issue.repository.owner}/{issue.repository.name}
            </span>
            <div className="flex items-center gap-2">
              {issue.repository.stargazersCount !== undefined && (
                <span className="inline-flex items-center gap-0.5">
                  <FaStar className="text-amber-500 text-[10px]" />
                  {issue.repository.stargazersCount.toLocaleString()}
                </span>
              )}
              {issue.repository.forksCount !== undefined && (
                <span className="inline-flex items-center gap-0.5">
                  <FaCodeBranch className="text-[10px]" />
                  {issue.repository.forksCount.toLocaleString()}
                </span>
              )}
              {issue.repository.language && <span>{issue.repository.language}</span>}
            </div>
            <div className="flex items-center gap-1">
              <span className="whitespace-nowrap">
                {formatRelativeTime(issue.createdAt, tCommon, locale)}
              </span>
              {issue.isNew && (
                <Badge
                  variant="outline"
                  className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs font-mono px-1.5 py-0.5 rounded"
                >
                  {t('common.new')}
                </Badge>
              )}
              <ShareButton
                onClick={handleShare}
                label={tCommon('share')}
                copied={copied}
                copiedLabel={tCommon('copied')}
                compact
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card
      className={cn(
        'rounded-lg border-border p-4 hover:border-border/80 transition-colors border-l-2 gap-0',
        issue.isNew
          ? 'border-amber-400'
          : issue.state === 'open'
            ? 'border-[color:var(--color-success)]'
            : 'border-[color:var(--color-danger)]',
      )}
    >
      <div className="flex items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-semibold text-foreground">
              <a
                href={issue.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                {issue.title}
              </a>
            </h3>

            {issue.isNew && (
              <Badge
                variant="outline"
                className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs font-mono px-2.5 py-0.5 rounded"
              >
                {t('common.new')}
              </Badge>
            )}

            {issue.repository.maintainerScore && (
              <Badge
                variant="outline"
                className={cn(
                  'inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded border-none',
                  maintainerGradeStyles[issue.repository.maintainerScore.grade],
                )}
                title={`${tMaintainer('responseTime', { hours: Math.round(issue.repository.maintainerScore.avgResponseTimeHours) })} · ${tMaintainer('mergeRate', { rate: Math.round(issue.repository.maintainerScore.mergeRate * 100) })}`}
              >
                <LuShield className="shrink-0 size-[11px]" />
                {issue.repository.maintainerScore.grade} ·{' '}
                {tMaintainer(`grade${issue.repository.maintainerScore.grade}`)}
              </Badge>
            )}

            {issue.qualityScore && (
              <Badge
                variant="outline"
                className={cn(
                  'inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded',
                  qualityGradeStyles[issue.qualityScore.grade],
                )}
                title={tQuality('tooltip', {
                  grade: issue.qualityScore.grade,
                  score: issue.qualityScore.score,
                })}
              >
                <LuAward className="shrink-0 size-[11px]" />
                {tQuality('label')} {issue.qualityScore.grade}
              </Badge>
            )}

            <CompetitionBadge
              status={competitionStatus}
              label={tIssue(`status.${competitionStatus}`)}
            />

            {issue.matchScore != null && (
              <Badge
                variant="outline"
                className={cn(
                  'inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded font-medium',
                  getMatchScoreStyle(issue.matchScore),
                )}
                title={tIssue('matchScoreTooltip')}
              >
                {tIssue('matchScore', { score: issue.matchScore })}
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 mt-2">
            {issue.labels.map(label => (
              <Badge
                key={label.id}
                variant="outline"
                className="text-xs px-2.5 py-0.5 rounded-full border-none"
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

          <div className="flex items-center mt-3 text-sm text-muted-foreground flex-wrap gap-y-1">
            <div className="flex items-center mr-4">
              <span className="text-xs font-mono">
                {issue.repository.owner}/{issue.repository.name} #{issue.number}
              </span>
            </div>

            {issue.repository.stargazersCount !== undefined && (
              <div className="flex items-center mr-3">
                <FaStar className="mr-1 text-xs text-amber-400/70" />
                <span className="text-xs">
                  {issue.repository.stargazersCount.toLocaleString()}
                </span>
              </div>
            )}

            {issue.repository.forksCount !== undefined && (
              <div className="flex items-center mr-3">
                <FaCodeBranch className="mr-1 text-xs" />
                <span className="text-xs">
                  {issue.repository.forksCount.toLocaleString()}
                </span>
              </div>
            )}

            {issue.repository.lastPushedAt && (
              <div className="flex items-center mr-4">
                <span className="text-xs">
                  {formatRelativeTime(issue.repository.lastPushedAt, tCommon, locale)}
                </span>
              </div>
            )}

            <div className="flex items-center mr-4">
              <FaClock className="mr-1 text-xs" />
              <span className="text-xs">
                {formatRelativeTime(issue.createdAt, tCommon, locale)}
              </span>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <a
                href={issue.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-primary hover:text-primary/80 transition-colors text-xs"
              >
                <FaGithub className="mr-1" />
                <span>{t('common.viewIssue')}</span>
              </a>
              <ShareButton
                onClick={handleShare}
                label={tCommon('share')}
                copied={copied}
                copiedLabel={tCommon('copied')}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default IssueItem;
