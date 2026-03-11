'use client';

import React, { useState } from 'react';
import {
  FaSync,
  FaStar,
  FaPlus,
  FaCheck,
  FaChevronDown,
  FaChevronUp,
} from 'react-icons/fa';
import IssueItem from './IssueItem';
import { useApp } from '../contexts/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import type { Issue } from '../types';

const LANGUAGES = [
  'all',
  'JavaScript',
  'TypeScript',
  'Python',
  'Go',
  'Rust',
  'Java',
  'C++',
  'Ruby',
  'PHP',
];

interface RecommendedIssuesProps {
  recommendedIssues: Issue[];
  recommendedLoading: boolean;
  recommendedError: string | null;
  languageFilter: string;
  changeLanguageFilter: (language: string) => void;
}

export default function RecommendedIssues({
  recommendedIssues,
  recommendedLoading,
  recommendedError,
  languageFilter,
  changeLanguageFilter,
}: RecommendedIssuesProps) {
  const { t } = useTranslation();
  const { settings, addRepository } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [addingRepos, setAddingRepos] = useState<Set<string>>(new Set());

  // Track which repos are already tracked
  const trackedRepoKeys = new Set(settings.repositories.map(r => `${r.owner}/${r.name}`));

  // Filter out issues from already tracked repos
  const filteredIssues = recommendedIssues.filter(
    issue => !trackedRepoKeys.has(`${issue.repository.owner}/${issue.repository.name}`),
  );

  const handleAddRepo = async (issue: Issue) => {
    const repoKey = `${issue.repository.owner}/${issue.repository.name}`;
    setAddingRepos(prev => new Set(prev).add(repoKey));
    try {
      await addRepository(repoKey);
    } finally {
      setAddingRepos(prev => {
        const next = new Set(prev);
        next.delete(repoKey);
        return next;
      });
    }
  };

  return (
    <div className="bg-[#161b22] rounded-lg border border-gray-700">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-2">
          <FaStar className="text-amber-400" />
          <h3 className="text-lg font-bold text-gray-100">{t('recommended.title')}</h3>
          <span className="text-xs text-gray-500">{t('recommended.description')}</span>
        </div>
        <div className="flex items-center gap-3">
          {!collapsed && (
            <select
              value={languageFilter}
              onChange={e => {
                e.stopPropagation();
                changeLanguageFilter(e.target.value);
              }}
              onClick={e => e.stopPropagation()}
              className="text-sm bg-[#0d1117] border border-gray-700 rounded-md px-2 py-1 text-gray-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              {LANGUAGES.map(lang => (
                <option key={lang} value={lang}>
                  {lang === 'all' ? t('recommended.allLanguages') : lang}
                </option>
              ))}
            </select>
          )}
          {collapsed ? (
            <FaChevronDown className="text-gray-500" />
          ) : (
            <FaChevronUp className="text-gray-500" />
          )}
        </div>
      </div>

      {/* Content */}
      {!collapsed && (
        <div className="px-4 pb-4">
          {recommendedError && (
            <div className="bg-red-500/10 text-red-400 border border-red-500/20 rounded-md text-sm p-3">
              {recommendedError}
            </div>
          )}

          {recommendedLoading ? (
            <div className="flex justify-center items-center p-6">
              <FaSync className="animate-spin text-cyan-400 mr-2" />
              <span className="text-gray-400 text-sm">{t('recommended.loading')}</span>
            </div>
          ) : filteredIssues.length === 0 ? (
            <div className="text-center p-6 text-gray-500 text-sm">
              {t('recommended.noIssues')}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredIssues.map(issue => {
                const repoKey = `${issue.repository.owner}/${issue.repository.name}`;
                const isTracked = trackedRepoKeys.has(repoKey);
                const isAdding = addingRepos.has(repoKey);

                return (
                  <div key={issue.id} className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <IssueItem issue={issue} compact />
                    </div>
                    <button
                      onClick={() => handleAddRepo(issue)}
                      disabled={isTracked || isAdding}
                      className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors border ${
                        isTracked
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 cursor-default'
                          : isAdding
                            ? 'bg-gray-800 text-gray-500 border-transparent cursor-not-allowed'
                            : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20'
                      }`}
                      title={
                        isTracked
                          ? t('recommended.alreadyTracked')
                          : t('recommended.addRepo')
                      }
                    >
                      {isTracked ? (
                        <>
                          <FaCheck className="text-xs" />
                          {t('recommended.alreadyTracked')}
                        </>
                      ) : isAdding ? (
                        <FaSync className="animate-spin text-xs" />
                      ) : (
                        <>
                          <FaPlus className="text-xs" />
                          {t('recommended.addRepo')}
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
