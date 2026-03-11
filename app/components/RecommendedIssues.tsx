'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FaSync,
  FaStar,
  FaPlus,
  FaCheck,
  FaChevronDown,
  FaChevronUp,
  FaSearch,
} from 'react-icons/fa';
import IssueItem from './IssueItem';
import IssueFilters, { DEFAULT_FILTER_STATE, type FilterState } from './IssueFilters';
import { useApp } from '../contexts/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import type { Issue } from '../types';

export default function RecommendedIssues() {
  const { t } = useTranslation();
  const { settings, addRepository, authState } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [addingRepos, setAddingRepos] = useState<Set<string>>(new Set());

  // Filter & search state
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTER_STATE,
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Data fetching state
  const [issues, setIssues] = useState<Issue[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  // Track which repos are already tracked
  const trackedRepoKeys = new Set(settings.repositories.map(r => `${r.owner}/${r.name}`));

  const fetchFromApi = useCallback(
    async (currentPage: number, append: boolean) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (filters.language !== 'all') params.set('language', filters.language);
        filters.difficulties.forEach(d => params.append('difficulty', d));
        filters.maintainerGrades.forEach(g => params.append('maintainerGrade', g));
        if (filters.minStars) params.set('minStars', String(filters.minStars));
        if (filters.minForks) params.set('minForks', String(filters.minForks));
        if (filters.freshness) params.set('freshness', filters.freshness);
        if (filters.label) params.set('label', filters.label);

        let res: Response;
        if (searchQuery) {
          params.set('page', String(currentPage));
          const headers: HeadersInit = {};
          if (authState.token) {
            headers['Authorization'] = `Bearer ${authState.token}`;
          }
          res = await fetch(
            `/api/search?type=issues&q=${encodeURIComponent(searchQuery)}&${params}`,
            { headers },
          );
        } else {
          params.set('page', String(currentPage));
          res = await fetch(`/api/recommended?${params}`);
        }

        if (res.status === 429) {
          throw new Error(
            authState.token
              ? t('errors.rateLimitExceededLoggedIn')
              : t('errors.rateLimitExceeded'),
          );
        }

        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }

        const data = await res.json();
        const newIssues: Issue[] = data.issues ?? data.data ?? [];
        const total: number = data.total ?? data.totalCount ?? 0;

        setIssues(prev => {
          const next = append ? [...prev, ...newIssues] : newIssues;
          setHasMore(newIssues.length > 0 && next.length < total);
          return next;
        });
        setTotalCount(total);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch issues');
      } finally {
        setLoading(false);
      }
    },
    [filters, searchQuery, authState.token, t],
  );

  // Serialize array filters for stable dependency tracking
  const difficultiesKey = filters.difficulties.join(',');
  const gradesKey = filters.maintainerGrades.join(',');

  // Fetch on mount and when filters/search change
  useEffect(() => {
    setPage(1);
    fetchFromApi(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.language,
    difficultiesKey,
    gradesKey,
    filters.minStars,
    filters.minForks,
    filters.freshness,
    filters.label,
    searchQuery,
  ]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFromApi(nextPage, true);
  };

  // Filter out issues from already tracked repos
  const filteredIssues = issues.filter(
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
          {collapsed ? (
            <FaChevronDown className="text-gray-500" />
          ) : (
            <FaChevronUp className="text-gray-500" />
          )}
        </div>
      </div>

      {/* Content */}
      {!collapsed && (
        <div className="px-4 pb-4 space-y-3">
          {/* Search input */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('recommended.searchPlaceholder')}
              className="w-full bg-[#0d1117] border border-gray-700 rounded-md pl-9 pr-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              onClick={e => e.stopPropagation()}
            />
          </div>

          {/* Filters */}
          <IssueFilters filters={filters} onFilterChange={setFilters} />

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 text-red-400 border border-red-500/20 rounded-md text-sm p-3">
              {error}
            </div>
          )}

          {/* Issue list */}
          {loading && issues.length === 0 ? (
            <div className="flex justify-center items-center p-6">
              <FaSync className="animate-spin text-cyan-400 mr-2" />
              <span className="text-gray-400 text-sm">{t('recommended.loading')}</span>
            </div>
          ) : filteredIssues.length === 0 ? (
            <div className="text-center p-6 text-gray-500 text-sm">
              {t('recommended.noIssues')}
            </div>
          ) : (
            <>
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
                        onClick={() =>
                          authState.isLoggedIn ? handleAddRepo(issue) : undefined
                        }
                        disabled={isTracked || isAdding || !authState.isLoggedIn}
                        className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors border ${
                          isTracked
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 cursor-default'
                            : !authState.isLoggedIn
                              ? 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed'
                              : isAdding
                                ? 'bg-gray-800 text-gray-500 border-transparent cursor-not-allowed'
                                : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20'
                        }`}
                        title={
                          isTracked
                            ? t('recommended.alreadyTracked')
                            : !authState.isLoggedIn
                              ? t('recommended.loginToTrack')
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
                            {authState.isLoggedIn
                              ? t('recommended.addRepo')
                              : t('recommended.loginToTrack')}
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-md hover:bg-cyan-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <FaSync className="animate-spin text-xs" /> : null}
                    {t('recommended.loadMore')}
                  </button>
                </div>
              )}

              {/* Showing count */}
              {totalCount > 0 && (
                <div className="text-center text-xs text-gray-500">
                  {t('recommended.showingCount', {
                    count: filteredIssues.length,
                    total: totalCount,
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
