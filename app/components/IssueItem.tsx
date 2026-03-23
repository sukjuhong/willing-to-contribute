import React from 'react';
import { Issue } from '../types';
import { FaGithub, FaClock, FaStar, FaCodeBranch } from 'react-icons/fa';
import { useTranslations } from 'next-intl';

interface IssueItemProps {
  issue: Issue;
  compact?: boolean;
}

const formatRelativeTime = (
  dateString: string,
  tCommon: ReturnType<typeof useTranslations<'common'>>,
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
    return date.toLocaleDateString();
  }
};

const difficultyStyles = {
  beginner: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  intermediate: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  advanced: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const maintainerGradeStyles = {
  A: 'bg-emerald-500/15 text-emerald-400',
  B: 'bg-amber-500/15 text-amber-400',
  C: 'bg-gray-500/15 text-gray-400',
};

const IssueItem: React.FC<IssueItemProps> = ({ issue, compact = false }) => {
  const t = useTranslations();
  const tCommon = useTranslations('common');
  const tDifficulty = useTranslations('difficulty');
  const tMaintainer = useTranslations('maintainer');

  if (compact) {
    return (
      <div
        className={`bg-[#161b22] rounded p-2 hover:bg-[#21262d] transition-colors border-l-2 ${
          issue.isNew
            ? 'border-amber-400'
            : issue.state === 'open'
              ? 'border-emerald-500'
              : 'border-gray-600'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-200 truncate">
              <a
                href={issue.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-cyan-400 transition-colors"
              >
                <span className="font-[family-name:var(--font-mono)] text-gray-500">
                  #{issue.number}
                </span>{' '}
                {issue.title}
              </a>
            </h3>

            <div className="flex flex-wrap gap-1 mt-1">
              {issue.labels.slice(0, 3).map(label => (
                <span
                  key={label.id}
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: `#${label.color}15`,
                    color: `#${label.color}`,
                  }}
                >
                  {label.name}
                </span>
              ))}
              {issue.labels.length > 3 && (
                <span className="text-xs text-gray-500">+{issue.labels.length - 3}</span>
              )}
              {issue.difficulty && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded border ${difficultyStyles[issue.difficulty]}`}
                  title={t('difficulty.estimated')}
                >
                  {tDifficulty(issue.difficulty)}
                </span>
              )}
              {issue.repository.maintainerScore && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded ${maintainerGradeStyles[issue.repository.maintainerScore.grade]}`}
                  title={`${tMaintainer(`grade${issue.repository.maintainerScore.grade}`)} · ${tMaintainer('responseTime', { hours: Math.round(issue.repository.maintainerScore.avgResponseTimeHours) })} · ${tMaintainer('mergeRate', { rate: Math.round(issue.repository.maintainerScore.mergeRate * 100) })}`}
                >
                  {tMaintainer(`grade${issue.repository.maintainerScore.grade}`)}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end ml-3 shrink-0 text-xs text-gray-500 gap-1">
            <span className="font-[family-name:var(--font-mono)] text-gray-400">
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
                {formatRelativeTime(issue.createdAt, tCommon)}
              </span>
              {issue.isNew && (
                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono px-1.5 py-0.5 rounded">
                  {t('common.new')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-[#161b22] rounded-lg border border-gray-700 p-4 hover:border-gray-600 transition-colors border-l-2 ${
        issue.isNew
          ? 'border-amber-400'
          : issue.state === 'open'
            ? 'border-emerald-500'
            : 'border-gray-600'
      }`}
    >
      <div className="flex items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-semibold text-gray-100">
              <a
                href={issue.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-cyan-400 transition-colors"
              >
                {issue.title}
              </a>
            </h3>

            {issue.isNew && (
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono px-2.5 py-0.5 rounded">
                {t('common.new')}
              </span>
            )}

            {issue.difficulty && (
              <span
                className={`text-xs px-2 py-0.5 rounded border ${difficultyStyles[issue.difficulty]}`}
                title={t('difficulty.estimated')}
              >
                {tDifficulty(issue.difficulty)}
              </span>
            )}

            {issue.repository.maintainerScore && (
              <span
                className={`text-xs px-2 py-0.5 rounded ${maintainerGradeStyles[issue.repository.maintainerScore.grade]}`}
                title={`${tMaintainer(`grade${issue.repository.maintainerScore.grade}`)} · ${tMaintainer('responseTime', { hours: Math.round(issue.repository.maintainerScore.avgResponseTimeHours) })} · ${tMaintainer('mergeRate', { rate: Math.round(issue.repository.maintainerScore.mergeRate * 100) })}`}
              >
                {issue.repository.maintainerScore.grade} ·{' '}
                {tMaintainer(`grade${issue.repository.maintainerScore.grade}`)}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 mt-2">
            {issue.labels.map(label => (
              <span
                key={label.id}
                className="text-xs px-2.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: `#${label.color}25`,
                  color: `#${label.color}`,
                  border: `1px solid #${label.color}50`,
                }}
              >
                {label.name}
              </span>
            ))}
          </div>

          <div className="flex items-center mt-3 text-sm text-gray-500 flex-wrap gap-y-1">
            <div className="flex items-center mr-4">
              <span className="text-xs font-[family-name:var(--font-mono)]">
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
                  {formatRelativeTime(issue.repository.lastPushedAt, tCommon)}
                </span>
              </div>
            )}

            <div className="flex items-center mr-4">
              <FaClock className="mr-1 text-xs" />
              <span className="text-xs">
                {formatRelativeTime(issue.createdAt, tCommon)}
              </span>
            </div>

            <a
              href={issue.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-cyan-400 hover:text-cyan-300 transition-colors ml-auto text-xs"
            >
              <FaGithub className="mr-1" />
              <span>{t('common.viewIssue')}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueItem;
