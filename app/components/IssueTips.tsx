'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { LuLightbulb, LuHeart, LuFlag, LuTrash2, LuLoader } from 'react-icons/lu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/app/contexts/AppContext';
import { useLocaleSwitch } from '@/app/providers/IntlProvider';
import { formatRelativeTime } from '../utils/formatRelativeTime';
import { cn } from '@/lib/utils';

interface IssueTipsProps {
  issueUrl: string;
}

interface Tip {
  id: string;
  issueUrl: string;
  userId: string;
  content: string;
  likeCount: number;
  createdAt: string;
  isOwn: boolean;
  isLiked: boolean;
  isReported: boolean;
}

const MAX_CONTENT_LENGTH = 280;

const IssueTips: React.FC<IssueTipsProps> = ({ issueUrl }) => {
  const t = useTranslations('tips');
  const tCommon = useTranslations('common');
  const { authState } = useAuth();
  const { locale } = useLocaleSwitch();

  const [open, setOpen] = useState(false);
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [draft, setDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fetchedUrlRef = useRef<string | null>(null);

  const fetchTips = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tips?issueUrl=${encodeURIComponent(issueUrl)}`);
      if (!res.ok) {
        setTips([]);
        return;
      }
      const json = (await res.json()) as { tips?: Tip[] };
      setTips(json.tips ?? []);
    } catch {
      setTips([]);
    } finally {
      setLoading(false);
      setHasFetched(true);
    }
  }, [issueUrl]);

  // Fetch on first expand
  useEffect(() => {
    if (open && fetchedUrlRef.current !== issueUrl) {
      fetchedUrlRef.current = issueUrl;
      void fetchTips();
    }
  }, [open, issueUrl, fetchTips]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const content = draft.trim();
      if (!content || content.length > MAX_CONTENT_LENGTH || submitting) return;
      setSubmitting(true);
      setSubmitError(null);
      try {
        const res = await fetch('/api/tips', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ issueUrl, content }),
        });
        if (!res.ok) {
          const err = (await res.json().catch(() => null)) as { error?: string } | null;
          setSubmitError(err?.error ?? t('submitError'));
          return;
        }
        const json = (await res.json()) as { tip?: Tip };
        if (json.tip) {
          setTips(prev => [json.tip!, ...prev]);
          setDraft('');
        }
      } catch {
        setSubmitError(t('submitError'));
      } finally {
        setSubmitting(false);
      }
    },
    [draft, submitting, issueUrl, t],
  );

  const handleLike = useCallback(
    async (tip: Tip) => {
      if (!authState.isLoggedIn) return;
      // Optimistic update
      setTips(prev =>
        prev.map(p =>
          p.id === tip.id
            ? {
                ...p,
                isLiked: !p.isLiked,
                likeCount: Math.max(0, p.likeCount + (p.isLiked ? -1 : 1)),
              }
            : p,
        ),
      );
      try {
        const res = await fetch('/api/tips/like', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tipId: tip.id }),
        });
        if (!res.ok) {
          // Roll back
          setTips(prev =>
            prev.map(p =>
              p.id === tip.id
                ? {
                    ...p,
                    isLiked: tip.isLiked,
                    likeCount: tip.likeCount,
                  }
                : p,
            ),
          );
        }
      } catch {
        setTips(prev =>
          prev.map(p =>
            p.id === tip.id
              ? { ...p, isLiked: tip.isLiked, likeCount: tip.likeCount }
              : p,
          ),
        );
      }
    },
    [authState.isLoggedIn],
  );

  const handleReport = useCallback(
    async (tip: Tip) => {
      if (!authState.isLoggedIn || tip.isReported) return;
      setTips(prev => prev.map(p => (p.id === tip.id ? { ...p, isReported: true } : p)));
      try {
        const res = await fetch('/api/tips/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tipId: tip.id }),
        });
        if (!res.ok && res.status !== 409) {
          // Roll back on hard failure (treat 409 = already reported as success)
          setTips(prev =>
            prev.map(p => (p.id === tip.id ? { ...p, isReported: false } : p)),
          );
        }
      } catch {
        setTips(prev =>
          prev.map(p => (p.id === tip.id ? { ...p, isReported: false } : p)),
        );
      }
    },
    [authState.isLoggedIn],
  );

  const handleDelete = useCallback(
    async (tip: Tip) => {
      if (typeof window !== 'undefined' && !window.confirm(t('deleteConfirm'))) return;
      const previous = tips;
      setTips(prev => prev.filter(p => p.id !== tip.id));
      try {
        const res = await fetch(`/api/tips?id=${encodeURIComponent(tip.id)}`, {
          method: 'DELETE',
        });
        if (!res.ok) setTips(previous);
      } catch {
        setTips(previous);
      }
    },
    [tips, t],
  );

  const remaining = MAX_CONTENT_LENGTH - draft.length;
  const isOverLimit = draft.length > MAX_CONTENT_LENGTH;

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mt-3">
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          onClick={e => e.stopPropagation()}
        >
          <LuLightbulb className="size-3.5" />
          <span>
            {hasFetched
              ? tips.length === 0
                ? t('add')
                : t('countLabel', { count: tips.length })
              : t('toggle')}
          </span>
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-2 space-y-3">
        {authState.isLoggedIn ? (
          <form onSubmit={handleSubmit} className="space-y-1.5">
            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder={t('placeholder')}
              maxLength={MAX_CONTENT_LENGTH + 50}
              rows={2}
              className={cn(
                'w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm',
                'placeholder:text-muted-foreground resize-y outline-none',
                'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
                isOverLimit && 'border-destructive',
              )}
              aria-label={t('placeholder')}
            />
            <div className="flex items-center justify-between text-xs">
              <span
                className={cn('text-muted-foreground', isOverLimit && 'text-destructive')}
              >
                {t('charCount', { count: draft.length, max: MAX_CONTENT_LENGTH })}
              </span>
              <Button
                type="submit"
                size="xs"
                disabled={submitting || !draft.trim() || isOverLimit || remaining < 0}
              >
                {submitting && <LuLoader className="animate-spin" />}
                {t('submit')}
              </Button>
            </div>
            {submitError && (
              <p className="text-xs text-destructive" role="alert">
                {submitError}
              </p>
            )}
          </form>
        ) : (
          <p className="text-xs text-muted-foreground">{t('loginRequired')}</p>
        )}

        {loading && (
          <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
            <LuLoader className="size-3 animate-spin" /> {tCommon('loading')}
          </p>
        )}

        {!loading && hasFetched && tips.length === 0 && (
          <p className="text-xs text-muted-foreground">{t('empty')}</p>
        )}

        {!loading && tips.length > 0 && (
          <ul className="space-y-2">
            {tips.map(tip => (
              <li
                key={tip.id}
                className="rounded-md border border-border bg-muted/40 p-2.5 text-sm"
              >
                <p className="whitespace-pre-wrap break-words text-foreground">
                  {tip.content}
                </p>
                <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{formatRelativeTime(tip.createdAt, tCommon, locale)}</span>
                  <button
                    type="button"
                    onClick={() => handleLike(tip)}
                    disabled={!authState.isLoggedIn}
                    aria-label={t('like')}
                    className={cn(
                      'inline-flex items-center gap-1 transition-colors',
                      authState.isLoggedIn
                        ? 'hover:text-foreground'
                        : 'cursor-not-allowed opacity-60',
                      tip.isLiked && 'text-rose-500 hover:text-rose-500/80',
                    )}
                  >
                    <LuHeart className={cn('size-3.5', tip.isLiked && 'fill-current')} />
                    <span>{tip.likeCount}</span>
                  </button>
                  {tip.isOwn ? (
                    <button
                      type="button"
                      onClick={() => handleDelete(tip)}
                      aria-label={tCommon('cancel')}
                      className="inline-flex items-center gap-1 hover:text-destructive transition-colors ml-auto"
                    >
                      <LuTrash2 className="size-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleReport(tip)}
                      disabled={!authState.isLoggedIn || tip.isReported}
                      aria-label={t('report')}
                      className={cn(
                        'inline-flex items-center gap-1 transition-colors ml-auto',
                        authState.isLoggedIn && !tip.isReported
                          ? 'hover:text-foreground'
                          : 'cursor-not-allowed opacity-60',
                      )}
                    >
                      <LuFlag className="size-3.5" />
                      <span>{tip.isReported ? t('reported') : t('report')}</span>
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default IssueTips;
