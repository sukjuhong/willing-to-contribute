'use client';

import { useState, useCallback } from 'react';
import { FaSync, FaGithub } from 'react-icons/fa';
import LoginPrompt from '@/app/components/LoginPrompt';
import RepositoryIssueList from '@/app/components/RepositoryIssueList';
import RecommendedIssues from '@/app/components/RecommendedIssues';
import { useApp } from '@/app/contexts/AppContext';
import { useTranslations } from 'next-intl';
import type { Repository } from '@/app/types';

export default function IssuesPage() {
  const t = useTranslations();
  const {
    authState,
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
      {/* Recommended Issues Section */}
      <RecommendedIssues />

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-100">
          {t('settings.beginnerFriendlyIssues')}
        </h2>

        {authState.isLoggedIn && (
          <button
            onClick={handleRefresh}
            disabled={refreshing || issuesLoading}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 ${
              refreshing || issuesLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <FaSync
              className={`mr-2 ${refreshing || issuesLoading ? 'animate-spin' : ''}`}
            />
            {t('common.refresh')}
          </button>
        )}
      </div>

      {!authState.isLoggedIn ? (
        <>
          <LoginPrompt />
          <div className="mt-8 bg-[#161b22] border border-gray-700 rounded-lg p-8">
            <h3 className="text-lg font-semibold text-gray-100 mb-2">
              What is contrifit?
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              contrifit helps developers find beginner-friendly open source issues across
              GitHub repositories — all in one place.
            </p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5">&#10003;</span>
                <span>
                  Browse curated &quot;good first issue&quot; and &quot;help wanted&quot;
                  issues from popular repos
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5">&#10003;</span>
                <span>
                  Track multiple repositories and get notified when new beginner-friendly
                  issues appear
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5">&#10003;</span>
                <span>
                  Filter by programming language, difficulty, and maintainer
                  responsiveness
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5">&#10003;</span>
                <span>Sync your settings across devices via cloud</span>
              </li>
            </ul>
          </div>
        </>
      ) : (
        <>
          {issuesError && (
            <div className="bg-red-500/10 text-red-400 border border-red-500/20 rounded-md p-4">
              {issuesError}
            </div>
          )}

          {issuesLoading && !refreshing ? (
            <div className="flex justify-center items-center p-8">
              <FaSync className="animate-spin text-cyan-400 mr-2" />
              <span className="text-gray-400">{t('common.loadingIssues')}</span>
            </div>
          ) : settings.repositories.length === 0 ? (
            <div className="text-center bg-[#161b22] border border-gray-700 rounded-lg p-8">
              <FaGithub className="mx-auto h-12 w-12 text-gray-600" />
              <h3 className="mt-2 text-lg font-medium text-gray-100">
                {t('settings.noRepositories')}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
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
        </>
      )}
    </div>
  );
}
