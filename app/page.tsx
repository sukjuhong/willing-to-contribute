'use client';

import { useState, useEffect, useCallback } from 'react';
import { FaSync, FaGithub } from 'react-icons/fa';
import Header from './components/Header';
import AddRepositoryForm from './components/AddRepositoryForm';
import RepositoryItem from './components/RepositoryItem';
import RepositoryIssueList from './components/RepositoryIssueList';
import SettingsPanel from './components/SettingsPanel';
import SyncModal from './components/SyncModal';
import useGithubAuth from './hooks/useGithubAuth';
import useSettings from './hooks/useSettings';
import useIssues from './hooks/useIssues';
import { checkNotificationPermission } from './utils/notifications';
import { Repository } from './types';
import { useTranslation } from './hooks/useTranslation';

export default function Home() {
  const { t } = useTranslation();
  // GitHub authentication state - GitHub App
  const { authState, login, logout, handleCallback } = useGithubAuth();

  // Settings state
  const {
    settings,
    loading: settingsLoading,
    error: settingsError,
    showSyncModal,
    setShowSyncModal,
    handleSync,
    addRepository,
    removeRepository,
    updateNotificationFrequency,
    toggleCustomLabel,
    updateLastCheckedAt,
    toggleHideClosedIssues,
    gistSettings,
  } = useSettings(authState.isLoggedIn);

  // Issues state
  const {
    issues,
    loading: issuesLoading,
    error: issuesError,
    fetchIssues,
  } = useIssues(settings);

  // UI state
  const [activeTab, setActiveTab] = useState<'issues' | 'repositories' | 'settings'>(
    'issues',
  );
  const [refreshing, setRefreshing] = useState(false);

  // Handle OAuth callback
  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const installationId = url.searchParams.get('installation_id');

    if (code) {
      // Remove code from URL
      url.searchParams.delete('code');
      if (installationId) {
        url.searchParams.delete('installation_id');
        window.history.replaceState({}, document.title, url.toString());
      } else {
        window.history.replaceState({}, document.title, url.toString());
      }

      handleCallback(code, installationId ?? undefined);
    }
  }, [handleCallback]);

  // Request notification permission on mount
  useEffect(() => {
    checkNotificationPermission();
  }, []);

  // Fetch issues on mount and when settings change
  useEffect(() => {
    if (!settingsLoading) {
      fetchIssues(false);
    }
  }, [fetchIssues, settingsLoading]);

  // Setup periodic checks for new issues
  useEffect(() => {
    if (settings.notificationFrequency === 'never') {
      return;
    }

    let interval: NodeJS.Timeout;

    // Set interval based on notification frequency
    switch (settings.notificationFrequency) {
      case 'hourly':
        interval = setInterval(() => fetchIssues(true), 60 * 60 * 1000);
        break;
      case '6hours':
        interval = setInterval(() => fetchIssues(true), 6 * 60 * 60 * 1000);
        break;
      case 'daily':
        interval = setInterval(() => fetchIssues(true), 24 * 60 * 60 * 1000);
        break;
      default:
        break;
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [settings.notificationFrequency, fetchIssues]);

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        authState={authState}
        onAppLogin={login}
        onLogout={logout}
        showAppLogin={!authState.isLoggedIn}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="sm:hidden">
            <select
              value={activeTab}
              onChange={e =>
                setActiveTab(e.target.value as 'issues' | 'repositories' | 'settings')
              }
              className="block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="issues">{t('tabs.issues')}</option>
              <option value="repositories">{t('tabs.repositories')}</option>
              <option value="settings">{t('tabs.settings')}</option>
            </select>
          </div>

          <div className="hidden sm:block">
            <nav className="flex space-x-4" aria-label="Tabs">
              {['issues', 'repositories', 'settings'].map(tab => (
                <button
                  key={tab}
                  onClick={() =>
                    setActiveTab(tab as 'issues' | 'repositories' | 'settings')
                  }
                  className={`${
                    activeTab === tab
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-100'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  } px-3 py-2 font-medium text-sm rounded-md`}
                  aria-current={activeTab === tab ? 'page' : undefined}
                >
                  {t(`tabs.${tab}`)}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {activeTab === 'issues' && (
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
        )}

        {activeTab === 'repositories' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('settings.trackedRepositories')}
            </h2>

            <AddRepositoryForm
              onAddRepository={addRepository}
              disabled={settingsLoading}
            />

            {settingsError && (
              <div className="p-4 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 rounded-md">
                {settingsError}
              </div>
            )}

            {settingsLoading ? (
              <div className="flex justify-center items-center p-8">
                <FaSync className="animate-spin text-indigo-600 mr-2" />
                <span className="text-gray-700 dark:text-gray-300">
                  {t('common.loadingRepositories')}
                </span>
              </div>
            ) : settings.repositories.length > 0 ? (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {settings.repositories.map(repo => (
                  <RepositoryItem
                    key={repo.id}
                    repository={repo}
                    onRemove={removeRepository}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <FaGithub className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                  {t('settings.noRepositories')}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {t('settings.addRepositoriesToStart')}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('settings.preferences')}
            </h2>

            <SettingsPanel
              settings={settings}
              onUpdateFrequency={updateNotificationFrequency}
              onToggleHideClosedIssues={toggleHideClosedIssues}
              onToggleCustomLabel={toggleCustomLabel}
              disabled={settingsLoading}
            />

            {!authState.isLoggedIn && (
              <div className="p-4 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 rounded-md">
                <p className="text-sm">
                  <strong>{t('common.note')}:</strong>{' '}
                  {t('settings.settingsSavedLocally')}{' '}
                  <button
                    onClick={login}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {t('common.loginWithGithub')}
                  </button>{' '}
                  {t('settings.toSyncSettings')}
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      <SyncModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        onSync={handleSync}
        localRepositories={settings.repositories}
        gistRepositories={gistSettings?.repositories || []}
      />
    </div>
  );
}
