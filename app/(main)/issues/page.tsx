'use client';

import { useState, useCallback } from 'react';
import { FaSync, FaGithub } from 'react-icons/fa';
import RepositoryIssueList from '../../components/RepositoryIssueList';
import { useApp } from '../../contexts/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import type { Repository } from '../../types';

export default function IssuesPage() {
  const { t } = useTranslation();
  const {
    settings,
    issues,
    issuesLoading,
    issuesError,
    fetchIssues,
    updateLastCheckedAt,
  } = useApp();

  const [refreshing, setRefreshing] = useState(false);

  // Refresh issues manually
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchIssues(false);
    await updateLastCheckedAt(new Date());
    setRefreshing(false);
  }, [fetchIssues, updateLastCheckedAt]);

  // Filter issues based on their state
  const filteredIssues = settings.hideClosedIssues
    ? issues.filter(issue => issue.state === 'open')
    : issues;

  // Sort issues by newest first and then by is_new flag
  const sortedIssues = [...filteredIssues].sort((a, b) => {
    // First, sort by isNew flag
    if (a.isNew && !b.isNew) return -1;
    if (!a.isNew && b.isNew) return 1;

    // Then sort by date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Group issues by repository
  const issuesByRepository: Record<string, typeof sortedIssues> = {};
  const repositoryMap: Record<string, Repository> = {};

  // Initialize repository map for quick lookup
  settings.repositories.forEach(repo => {
    const repoKey = `${repo.owner}/${repo.name}`;
    repositoryMap[repoKey] = repo;
    issuesByRepository[repoKey] = [];
  });

  // Group issues by repository
  sortedIssues.forEach(issue => {
    const repoKey = `${issue.repository.owner}/${issue.repository.name}`;
    if (!issuesByRepository[repoKey]) {
      issuesByRepository[repoKey] = [];
      repositoryMap[repoKey] = issue.repository;
    }
    issuesByRepository[repoKey].push(issue);
  });

  // Sort repositories by the ones with new issues first, then by issue count
  const sortedRepositoryKeys = Object.keys(issuesByRepository).sort((a, b) => {
    const aHasNew = issuesByRepository[a].some(issue => issue.isNew);
    const bHasNew = issuesByRepository[b].some(issue => issue.isNew);

    // First, sort by repositories with new issues
    if (aHasNew && !bHasNew) return -1;
    if (!aHasNew && bHasNew) return 1;

    // Then by issue count
    return issuesByRepository[b].length - issuesByRepository[a].length;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {t('settings.beginnerFriendlyIssues')}
        </h2>

        <button
          onClick={handleRefresh}
          disabled={refreshing || issuesLoading}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            refreshing || issuesLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <FaSync
            className={`mr-2 ${refreshing || issuesLoading ? 'animate-spin' : ''}`}
          />
          {t('common.refresh')}
        </button>
      </div>

      {issuesError && (
        <div className="p-4 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 rounded-md">
          {issuesError}
        </div>
      )}

      {issuesLoading && !refreshing ? (
        <div className="flex justify-center items-center p-8">
          <FaSync className="animate-spin text-indigo-600 mr-2" />
          <span className="text-gray-700 dark:text-gray-300">
            {t('common.loadingIssues')}
          </span>
        </div>
      ) : settings.repositories.length === 0 ? (
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <FaGithub className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
            {t('settings.noRepositories')}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('settings.addRepositoriesToStart')}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedRepositoryKeys.map(repoKey => (
            <RepositoryIssueList
              key={repoKey}
              repository={repositoryMap[repoKey]}
              issues={issuesByRepository[repoKey]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
