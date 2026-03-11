import React, { useState } from 'react';
import { Issue, Repository } from '../types';
import IssueItem from './IssueItem';
import { FaChevronDown, FaChevronRight, FaExternalLinkAlt } from 'react-icons/fa';
import { useTranslation } from '../hooks/useTranslation';

interface RepositoryIssueListProps {
  repository: Repository;
  issues: Issue[];
}

const RepositoryIssueList: React.FC<RepositoryIssueListProps> = ({
  repository,
  issues,
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);

  const newIssuesCount = issues.filter(issue => issue.isNew).length;

  return (
    <div className="bg-[#161b22] rounded-lg border border-gray-700 overflow-hidden mb-4">
      {/* Repository header */}
      <div
        className="p-3 bg-[#21262d] flex items-center justify-between cursor-pointer border-l-2 border-cyan-500"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          {isExpanded ? (
            <FaChevronDown className="text-gray-500 mr-2" />
          ) : (
            <FaChevronRight className="text-gray-500 mr-2" />
          )}
          <h3 className="font-medium text-gray-100 font-[family-name:var(--font-mono)]">
            {repository.owner}/{repository.name}
          </h3>
          <span className="ml-2 text-xs bg-gray-800 text-gray-300 border border-gray-600 px-2 py-0.5 rounded font-mono">
            {issues.length} {t('common.issues')}
          </span>
          {newIssuesCount > 0 && (
            <span className="ml-2 text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded">
              {newIssuesCount} {t('common.new')}
            </span>
          )}
        </div>

        <a
          href={`https://github.com/${repository.owner}/${repository.name}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 hover:text-cyan-300 flex items-center text-sm"
          onClick={e => e.stopPropagation()}
        >
          <FaExternalLinkAlt className="mr-1 text-xs" />
          <span className="text-xs">{t('common.viewRepo')}</span>
        </a>
      </div>

      {/* Issues list */}
      {isExpanded && (
        <div className="divide-y divide-gray-700/50">
          {issues.map(issue => (
            <div key={issue.id} className="px-2 py-1">
              <IssueItem issue={issue} compact={true} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RepositoryIssueList;
