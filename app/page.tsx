'use client';

import { useState, useEffect, useCallback } from 'react';
import { FaSync, FaGithub } from 'react-icons/fa';
import Header from './components/Header';
import AddRepositoryForm from './components/AddRepositoryForm';
import RepositoryItem from './components/RepositoryItem';
import IssueItem from './components/IssueItem';
import SettingsPanel from './components/SettingsPanel';
import useGithubAuth from './hooks/useGithubAuth';
import useSettings from './hooks/useSettings';
import useIssues from './hooks/useIssues';
import { checkNotificationPermission } from './utils/notifications';

export default function Home() {
  // GitHub authentication state
  const { authState, login, logout, handleCallback } = useGithubAuth();
  
  // Settings state
  const { 
    settings, 
    loading: settingsLoading, 
    error: settingsError,
    addRepository,
    removeRepository,
    updateNotificationFrequency,
    toggleCustomLabel,
    updateLastCheckedAt,
    toggleHideClosedIssues,
  } = useSettings(authState.isLoggedIn);
  
  // Issues state
  const { 
    issues, 
    loading: issuesLoading, 
    error: issuesError, 
    fetchIssues 
  } = useIssues(settings);
  
  // UI state
  const [activeTab, setActiveTab] = useState<'issues' | 'repositories' | 'settings'>('issues');
  const [refreshing, setRefreshing] = useState(false);
  
  // Handle OAuth callback
  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    
    if (code) {
      // Remove code from URL
      url.searchParams.delete('code');
      window.history.replaceState({}, document.title, url.toString());
      
      // Handle the callback
      handleCallback(code);
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
    await updateLastCheckedAt();
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
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header 
        authState={authState}
        onLogin={login}
        onLogout={logout}
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="sm:hidden">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as any)}
              className="block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="issues">Issues</option>
              <option value="repositories">Repositories</option>
              <option value="settings">Settings</option>
            </select>
          </div>
          
          <div className="hidden sm:block">
            <nav className="flex space-x-4" aria-label="Tabs">
              {['issues', 'repositories', 'settings'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`${
                    activeTab === tab
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-100'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  } px-3 py-2 font-medium text-sm rounded-md`}
                  aria-current={activeTab === tab ? 'page' : undefined}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>
        </div>
        
        {activeTab === 'issues' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Beginner-Friendly Issues
              </h2>
              
              <button
                onClick={handleRefresh}
                disabled={refreshing || issuesLoading}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  (refreshing || issuesLoading) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <FaSync className={`mr-2 ${refreshing || issuesLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
            
            {issuesError && (
              <div className="p-4 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 rounded-md">
                {issuesError}
              </div>
            )}
            
            {(issuesLoading && !refreshing) ? (
              <div className="flex justify-center items-center p-8">
                <FaSync className="animate-spin text-indigo-600 mr-2" />
                <span className="text-gray-700 dark:text-gray-300">Loading issues...</span>
              </div>
            ) : sortedIssues.length > 0 ? (
              <div className="grid gap-4 grid-cols-1">
                {sortedIssues.map(issue => (
                  <IssueItem key={issue.id} issue={issue} />
                ))}
              </div>
            ) : (
              <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <FaGithub className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No issues found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {settings.repositories.length === 0 
                    ? 'Add some repositories to start tracking issues.' 
                    : 'No issues matching your criteria found in the tracked repositories.'}
                </p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'repositories' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Tracked Repositories
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
                <span className="text-gray-700 dark:text-gray-300">Loading repositories...</span>
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
                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No repositories added</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Add repositories to start tracking beginner-friendly issues.
                </p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Preferences
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
                  <strong>Note:</strong> Your settings are currently saved locally in your browser.{' '}
                  <button 
                    onClick={login}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Log in with GitHub
                  </button>{' '}
                  to sync your settings across devices.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
