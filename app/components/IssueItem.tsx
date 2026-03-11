import React from 'react';
import { Issue } from '../types';
import { FaGithub, FaClock } from 'react-icons/fa';
import { useTranslation } from '../hooks/useTranslation';

interface IssueItemProps {
  issue: Issue;
  compact?: boolean;
}

// Format date to relative time (e.g., "2 days ago")
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSecs < 60) {
    return 'just now';
  } else if (diffInMins < 60) {
    return `${diffInMins}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays < 30) {
    return `${diffInDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
};

const IssueItem: React.FC<IssueItemProps> = ({ issue, compact = false }) => {
  const { t } = useTranslation();

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
            </div>
          </div>

          <div className="flex items-center ml-2 text-xs text-gray-500">
            <span className="whitespace-nowrap">
              {formatRelativeTime(issue.createdAt)}
            </span>
            {issue.isNew && (
              <span className="ml-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono px-1.5 py-0.5 rounded">
                {t('common.new')}
              </span>
            )}
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
          <div className="flex items-center gap-2">
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

          <div className="flex items-center mt-3 text-sm text-gray-500">
            <div className="flex items-center mr-4">
              <span className="text-xs font-[family-name:var(--font-mono)]">
                {issue.repository.owner}/{issue.repository.name} #{issue.number}
              </span>
            </div>

            <div className="flex items-center mr-4">
              <FaClock className="mr-1 text-xs" />
              <span className="text-xs">{formatRelativeTime(issue.createdAt)}</span>
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
