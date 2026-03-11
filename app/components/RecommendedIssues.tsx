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
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 rounded-lg border border-indigo-200 dark:border-gray-700">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-2">
          <FaStar className="text-yellow-500" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {t('recommended.title')}
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {t('recommended.description')}
          </span>
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
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {LANGUAGES.map(lang => (
                <option key={lang} value={lang}>
                  {lang === 'all' ? t('recommended.allLanguages') : lang}
                </option>
              ))}
            </select>
          )}
          {collapsed ? (
            <FaChevronDown className="text-gray-400" />
          ) : (
            <FaChevronUp className="text-gray-400" />
          )}
        </div>
      </div>

      {/* Content */}
      {!collapsed && (
        <div className="px-4 pb-4">
          {recommendedError && (
            <div className="p-3 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 rounded-md text-sm">
              {recommendedError}
            </div>
          )}

          {recommendedLoading ? (
            <div className="flex justify-center items-center p-6">
              <FaSync className="animate-spin text-indigo-600 mr-2" />
              <span className="text-gray-700 dark:text-gray-300 text-sm">
                {t('recommended.loading')}
              </span>
            </div>
          ) : filteredIssues.length === 0 ? (
            <div className="text-center p-6 text-gray-500 dark:text-gray-400 text-sm">
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
                      className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        isTracked
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 cursor-default'
                          : isAdding
                            ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                            : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800'
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
