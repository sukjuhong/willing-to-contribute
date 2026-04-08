'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FaSync,
  FaStar,
  FaChevronDown,
  FaChevronUp,
  FaBookmark,
  FaRegBookmark,
} from 'react-icons/fa';
import IssueItem from './IssueItem';
import IssueFilters, { DEFAULT_FILTER_STATE, type FilterState } from './IssueFilters';
import ProfileAnalysisModal from './ProfileAnalysisModal';
import { useApp } from '../contexts/AppContext';
import { useTranslations } from 'next-intl';
import type { Issue } from '../types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatRelativeTime(isoString: string | null, t: any): string {
  if (!isoString) return '';
  const time = new Date(isoString).getTime();
  if (isNaN(time)) return '';
  const diffMs = Date.now() - time;
  if (diffMs < 0) return t('common.justNow');
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays > 0) return t('common.daysAgo', { days: diffDays });
  if (diffHours > 0) return t('common.hoursAgo', { hours: diffHours });
  return t('common.justNow');
}

export default function RecommendedIssues() {
  const t = useTranslations();
  const {
    settings,
    saveIssue,
    unsaveIssue,
    authState,
    profile,
    syncProfile,
    profileLoading,
    profileError,
  } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [pickingIssues, setPickingIssues] = useState<Set<string>>(new Set());
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [userOverrodeLanguage, setUserOverrodeLanguage] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTER_STATE,
  });

  // Data fetching state
  const [issues, setIssues] = useState<Issue[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isPersonalized, setIsPersonalized] = useState(false);

  // Track which issues are already picked
  const pickedIssueIds = new Set(settings.savedIssues.map(s => s.id));

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

        params.set('page', String(currentPage));
        const res = await fetch(`/api/recommended?${params}`);

        if (res.status === 429) {
          throw new Error(
            authState.accessToken
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
        if (data.personalized) setIsPersonalized(true);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      filters.language,
      filters.difficulties,
      filters.maintainerGrades,
      filters.minStars,
      filters.minForks,
      filters.freshness,
      filters.label,
    ],
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
  ]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFromApi(nextPage, true);
  };

  const handlePickIssue = async (issue: Issue) => {
    const isPicked = pickedIssueIds.has(issue.id);
    setPickingIssues(prev => new Set(prev).add(issue.id));
    try {
      if (isPicked) {
        await unsaveIssue(issue.id);
      } else {
        await saveIssue(issue);
      }
    } finally {
      setPickingIssues(prev => {
        const next = new Set(prev);
        next.delete(issue.id);
        return next;
      });
    }
  };

  return (
    <Collapsible open={!collapsed} onOpenChange={open => setCollapsed(!open)}>
      <Card className="bg-card border border-border gap-0 py-0">
        {/* Header */}
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between p-4 cursor-pointer">
            <div className="flex items-center gap-2 flex-wrap">
              <FaStar className="text-amber-400" />
              <h3 className="text-lg font-bold text-foreground">
                {t('recommended.title')}
              </h3>
              {isPersonalized && (
                <>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25">
                    {t('recommended.personalized')}
                  </span>
                  {profile && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setShowAnalysisModal(true);
                      }}
                      disabled={profileLoading}
                      aria-label={t('recommended.resync')}
                      className="text-muted-foreground hover:text-primary transition-colors p-1 disabled:opacity-50"
                      title={t('recommended.lastSynced', {
                        time: formatRelativeTime(profile.last_synced_at, t),
                      })}
                    >
                      <FaSync
                        className={`text-xs ${profileLoading ? 'animate-spin' : ''}`}
                      />
                    </button>
                  )}
                </>
              )}
              <span className="text-xs text-muted-foreground">
                {t('recommended.description')}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {collapsed ? (
                <FaChevronDown className="text-muted-foreground" />
              ) : (
                <FaChevronUp className="text-muted-foreground" />
              )}
            </div>
          </button>
        </CollapsibleTrigger>

        {/* Content */}
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-3">
            {/* Filters */}
            <IssueFilters
              filters={filters}
              onFilterChange={newFilters => {
                if (newFilters.language !== filters.language) {
                  setUserOverrodeLanguage(true);
                }
                // Reset override when clearing all filters
                if (
                  newFilters.language === DEFAULT_FILTER_STATE.language &&
                  newFilters.difficulties.length === 0 &&
                  newFilters.maintainerGrades.length === 0 &&
                  newFilters.minStars === null &&
                  newFilters.minForks === null &&
                  newFilters.freshness === null &&
                  newFilters.label === ''
                ) {
                  setUserOverrodeLanguage(false);
                }
                setFilters(newFilters);
              }}
              profileLanguage={
                !userOverrodeLanguage ? (profile?.top_languages?.[0] ?? null) : null
              }
            />

            {/* Profile CTA: logged in but no profile analyzed yet */}
            {authState.isLoggedIn && !profile && !profileLoading && (
              <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-md px-3 py-2 text-sm">
                <span className="text-primary/80">
                  {t('recommended.analyzeProfileCta')}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={e => {
                    e.stopPropagation();
                    setShowAnalysisModal(true);
                  }}
                  className="ml-3 flex-shrink-0 text-xs bg-primary/20 hover:bg-primary/30 text-primary border-primary/30"
                >
                  {t('recommended.analyzeNow')}
                </Button>
              </div>
            )}

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm p-3"
              >
                {error}
              </div>
            )}

            {/* Issue list */}
            {loading && issues.length === 0 ? (
              <div className="space-y-2 p-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : loading && issues.length > 0 ? (
              <div className="relative">
                <div className="absolute inset-0 bg-card/70 flex justify-center items-center z-10 rounded-md">
                  <FaSync className="animate-spin text-primary mr-2" />
                  <span className="text-muted-foreground text-sm">
                    {t('recommended.loading')}
                  </span>
                </div>
                <div className="opacity-40 pointer-events-none space-y-2">
                  {issues.slice(0, 3).map(issue => (
                    <div key={issue.id} className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <IssueItem issue={issue} compact />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : issues.length === 0 ? (
              <div className="text-center p-6 text-muted-foreground text-sm">
                {t('recommended.noIssues')}
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {issues.map(issue => {
                    const isPicked = pickedIssueIds.has(issue.id);
                    const isPicking = pickingIssues.has(issue.id);

                    return (
                      <div key={issue.id} className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <IssueItem issue={issue} compact />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            authState.isLoggedIn ? handlePickIssue(issue) : undefined
                          }
                          disabled={isPicking || !authState.isLoggedIn}
                          className={
                            isPicked
                              ? 'flex-shrink-0 text-xs bg-primary/10 text-primary border-primary/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20'
                              : !authState.isLoggedIn
                                ? 'flex-shrink-0 text-xs bg-muted text-muted-foreground border-border cursor-not-allowed'
                                : isPicking
                                  ? 'flex-shrink-0 text-xs bg-muted text-muted-foreground border-transparent cursor-not-allowed'
                                  : 'flex-shrink-0 text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
                          }
                          title={
                            isPicked
                              ? t('recommended.unpick')
                              : !authState.isLoggedIn
                                ? t('recommended.loginToPick')
                                : t('recommended.pick')
                          }
                        >
                          {isPicking ? (
                            <FaSync className="animate-spin text-xs" />
                          ) : isPicked ? (
                            <FaBookmark className="text-xs" />
                          ) : (
                            <FaRegBookmark className="text-xs" />
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>

                {/* Load More */}
                {hasMore && (
                  <div className="flex justify-center pt-2">
                    <Button
                      variant="outline"
                      onClick={handleLoadMore}
                      disabled={loading}
                      className="flex items-center gap-2 text-sm font-medium text-primary bg-primary/10 border-primary/20 hover:bg-primary/20 disabled:opacity-50"
                    >
                      {loading ? <FaSync className="animate-spin text-xs" /> : null}
                      {t('recommended.loadMore')}
                    </Button>
                  </div>
                )}

                {/* Showing count */}
                {totalCount > 0 && (
                  <div className="text-center text-xs text-muted-foreground">
                    {t('recommended.showingCount', {
                      count: issues.length,
                      total: totalCount,
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </CollapsibleContent>
      </Card>

      {/* Profile Analysis Modal */}
      <ProfileAnalysisModal
        isOpen={showAnalysisModal}
        onClose={() => setShowAnalysisModal(false)}
        onAnalyze={syncProfile}
        profileData={profile}
        error={profileError}
      />
    </Collapsible>
  );
}
