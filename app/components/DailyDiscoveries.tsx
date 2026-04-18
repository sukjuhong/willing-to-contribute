'use client';

import React, { useState, useEffect } from 'react';
import { FaSync, FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { Sparkles } from 'lucide-react';
import IssueItem from './IssueItem';
import { useAuth, usePicked } from '../contexts/AppContext';
import { useTranslations } from 'next-intl';
import type { Issue } from '../types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const CACHE_KEY_PREFIX = 'daily_discoveries_';

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD in UTC
}

interface DailyCacheEntry {
  date: string;
  issues: Issue[];
}

export default function DailyDiscoveries() {
  const t = useTranslations();
  const { authState } = useAuth();
  const { pickedIssues, pickIssue, unpickIssue } = usePicked();

  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pickingIssues, setPickingIssues] = useState<Set<string>>(new Set());

  const pickedIssueIds = new Set(pickedIssues.map(s => s.id));
  const todayKey = getTodayKey();
  const localStorageKey = `${CACHE_KEY_PREFIX}${authState.userId ?? 'guest'}`;

  useEffect(() => {
    async function fetchDailyPicks() {
      // Check localStorage cache first — same day same result
      try {
        const raw = localStorage.getItem(localStorageKey);
        if (raw) {
          const cached: DailyCacheEntry = JSON.parse(raw);
          if (cached.date === todayKey && cached.issues.length > 0) {
            setIssues(cached.issues);
            setLoading(false);
            return;
          }
        }
      } catch {
        // Ignore parse errors
      }

      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/daily-picks');
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }
        const data = await res.json();
        const fetched: Issue[] = data.issues ?? [];
        setIssues(fetched);

        // Persist to localStorage for same-day cache
        try {
          const entry: DailyCacheEntry = { date: todayKey, issues: fetched };
          localStorage.setItem(localStorageKey, JSON.stringify(entry));
        } catch {
          // localStorage might be full — ignore
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch daily picks');
      } finally {
        setLoading(false);
      }
    }

    fetchDailyPicks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState.userId]);

  const handlePickIssue = async (issue: Issue) => {
    const isPicked = pickedIssueIds.has(issue.id);
    setPickingIssues(prev => new Set(prev).add(issue.id));
    try {
      if (isPicked) {
        await unpickIssue(issue.id);
      } else {
        await pickIssue(issue);
      }
    } finally {
      setPickingIssues(prev => {
        const next = new Set(prev);
        next.delete(issue.id);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <Card className="bg-card border border-border gap-0 py-0">
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="text-amber-400 w-4 h-4" />
            <h3 className="text-lg font-bold text-foreground">{t('daily.title')}</h3>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return null;
  }

  if (issues.length === 0) {
    return null;
  }

  return (
    <Card className="bg-card border border-border gap-0 py-0">
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2 flex-wrap">
          <Sparkles className="text-amber-400 w-4 h-4" />
          <h3 className="text-lg font-bold text-foreground">{t('daily.title')}</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-600 dark:text-amber-400 border border-amber-400/25">
            {todayKey}
          </span>
          <span className="text-xs text-muted-foreground">{t('daily.subtitle')}</span>
        </div>

        {/* Issue list */}
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

        <p className="text-xs text-muted-foreground">{t('daily.refreshNote')}</p>
      </div>
    </Card>
  );
}
