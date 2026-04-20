'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { FaGithub, FaStar, FaCodeBranch } from 'react-icons/fa';
import { LuBookmark, LuShare2, LuCheck } from 'react-icons/lu';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Issue } from '@/app/types';
import { TOP_15_LANGUAGES } from '@/app/lib/findFirstIssue';

type Level = 'beginner' | 'some-oss' | 'regular';
type Interest = 'docs' | 'bug' | 'feature' | 'ui';

interface QuizState {
  lang: string;
  level: Level | '';
  interest: Interest | '';
}

const INTEREST_LABEL_MAP: Record<Interest, string> = {
  docs: 'documentation',
  bug: 'bug',
  feature: 'enhancement',
  ui: 'UI',
};

function buildApiUrl(lang: string, interest: Interest | ''): string {
  const params = new URLSearchParams();
  if (lang) params.set('language', lang);
  if (interest && INTEREST_LABEL_MAP[interest]) {
    params.set('label', INTEREST_LABEL_MAP[interest]);
  }
  params.set('minStars', '500');
  params.set('freshness', '3m');
  return `/api/recommended?${params.toString()}`;
}

function buildShareUrl(quiz: QuizState): string {
  const params = new URLSearchParams();
  if (quiz.lang) params.set('lang', quiz.lang.toLowerCase());
  if (quiz.level) params.set('level', quiz.level);
  if (quiz.interest) params.set('interest', quiz.interest);
  return `${window.location.origin}/find-your-first-issue?${params.toString()}`;
}

interface ResultCardProps {
  issue: Issue;
}

function ResultCard({ issue }: ResultCardProps) {
  return (
    <Card className="rounded-lg border-border p-4 hover:border-primary/40 transition-colors border-l-2 border-l-primary/50 gap-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground">
            <a
              href={issue.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              {issue.title}
            </a>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 font-mono">
            {issue.repository.owner}/{issue.repository.name} #{issue.number}
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {issue.labels.slice(0, 4).map(label => (
              <Badge
                key={label.id}
                variant="outline"
                className="text-xs rounded-full border-none px-2 py-0.5"
                style={{
                  backgroundColor: `#${label.color}25`,
                  color: `#${label.color}`,
                  border: `1px solid #${label.color}50`,
                }}
              >
                {label.name}
              </Badge>
            ))}
          </div>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1 text-xs text-muted-foreground">
          {issue.repository.stargazersCount !== undefined && (
            <span className="inline-flex items-center gap-1">
              <FaStar className="text-amber-400 text-[10px]" />
              {issue.repository.stargazersCount.toLocaleString()}
            </span>
          )}
          {issue.repository.forksCount !== undefined && (
            <span className="inline-flex items-center gap-1">
              <FaCodeBranch className="text-[10px]" />
              {issue.repository.forksCount.toLocaleString()}
            </span>
          )}
          {typeof issue.pickCount === 'number' && issue.pickCount > 0 && (
            <span
              className="inline-flex items-center gap-1"
              title="Pickssue users interested"
            >
              <LuBookmark className="size-3" />
              {issue.pickCount}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function QuizClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('findFirstIssue');

  const [step, setStep] = useState<1 | 2 | 3 | 'results'>(1);
  const [quiz, setQuiz] = useState<QuizState>({ lang: '', level: '', interest: '' });
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const levelOptions = useMemo(
    () => [
      {
        value: 'beginner' as Level,
        label: t('levelBeginner'),
        desc: t('levelBeginnerDesc'),
      },
      {
        value: 'some-oss' as Level,
        label: t('levelSomeOss'),
        desc: t('levelSomeOssDesc'),
      },
      {
        value: 'regular' as Level,
        label: t('levelRegular'),
        desc: t('levelRegularDesc'),
      },
    ],
    [t],
  );

  const interestOptions = useMemo(
    () => [
      {
        value: 'docs' as Interest,
        label: t('interestDocs'),
        desc: t('interestDocsDesc'),
      },
      { value: 'bug' as Interest, label: t('interestBug'), desc: t('interestBugDesc') },
      {
        value: 'feature' as Interest,
        label: t('interestFeature'),
        desc: t('interestFeatureDesc'),
      },
      { value: 'ui' as Interest, label: t('interestUi'), desc: t('interestUiDesc') },
    ],
    [t],
  );

  const fetchIssues = useCallback(
    async (q: QuizState, signal?: AbortSignal) => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(buildApiUrl(q.lang, q.interest), { signal });
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        if (signal?.aborted) return;
        const allIssues: Issue[] = data.issues || [];
        setIssues(allIssues.slice(0, 10));
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setError(t('loadError'));
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [t],
  );

  // Restore from URL params on mount
  useEffect(() => {
    const lang = searchParams.get('lang') || '';
    const level = (searchParams.get('level') as Level) || '';
    const interest = (searchParams.get('interest') as Interest) || '';

    if (!lang && !level && !interest) return;

    const controller = new AbortController();

    const restored: QuizState = {
      lang: lang
        ? (TOP_15_LANGUAGES.find(l => l.toLowerCase() === lang.toLowerCase()) ?? lang)
        : '',
      level,
      interest,
    };
    setQuiz(restored);
    if (lang && level && interest) {
      setStep('results');
      fetchIssues(restored, controller.signal);
    } else if (lang && level) {
      setStep(3);
    } else if (lang) {
      setStep(2);
    }

    return () => controller.abort();
  }, [searchParams, fetchIssues]);

  function handleLangSelect(lang: string) {
    const next = { ...quiz, lang };
    setQuiz(next);
    setStep(2);
    updateUrl({ ...next });
  }

  function handleLevelSelect(level: Level) {
    const next = { ...quiz, level };
    setQuiz(next);
    setStep(3);
    updateUrl({ ...next });
  }

  function handleInterestSelect(interest: Interest) {
    const next = { ...quiz, interest };
    setQuiz(next);
    setStep('results');
    // URL update below triggers the useEffect that invokes fetchIssues
    // with an AbortSignal, avoiding duplicate requests and race conditions.
    updateUrl(next);
  }

  function updateUrl(q: Partial<QuizState>) {
    const params = new URLSearchParams();
    if (q.lang) params.set('lang', q.lang.toLowerCase());
    if (q.level) params.set('level', q.level);
    if (q.interest) params.set('interest', q.interest);
    router.replace(`/find-your-first-issue?${params.toString()}`, { scroll: false });
  }

  function handleRestart() {
    setQuiz({ lang: '', level: '', interest: '' });
    setIssues([]);
    setError('');
    setStep(1);
    router.replace('/find-your-first-issue', { scroll: false });
  }

  async function handleShare() {
    const url = buildShareUrl(quiz);
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: t('shareTitle'), url });
      } catch {
        // cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // clipboard unavailable
      }
    }
  }

  const stepLabels = [
    t('stepLabelLanguage'),
    t('stepLabelExperience'),
    t('stepLabelInterest'),
    t('stepLabelResults'),
  ];
  const currentStepIndex = step === 'results' ? 3 : (step as number) - 1;

  return (
    <section className="mt-12">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {stepLabels.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors ${
                i < currentStepIndex
                  ? 'bg-primary text-primary-foreground'
                  : i === currentStepIndex
                    ? 'bg-primary/20 text-primary border border-primary'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {i < currentStepIndex ? <LuCheck className="size-3.5" /> : i + 1}
            </div>
            <span
              className={`text-xs hidden sm:inline ${i === currentStepIndex ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
            >
              {label}
            </span>
            {i < stepLabels.length - 1 && (
              <div
                className={`h-px w-6 sm:w-10 ${i < currentStepIndex ? 'bg-primary' : 'bg-border'}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Language */}
      {step === 1 && (
        <div>
          <h2 className="text-xl font-bold text-foreground mb-2">{t('step1Title')}</h2>
          <p className="text-sm text-muted-foreground mb-6">{t('step1Desc')}</p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {TOP_15_LANGUAGES.map(lang => (
              <button
                key={lang}
                onClick={() => handleLangSelect(lang)}
                className="px-3 py-2 rounded-lg border border-border bg-card hover:border-primary hover:bg-primary/5 transition-colors text-sm font-medium text-foreground text-left"
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Experience Level */}
      {step === 2 && (
        <div>
          <h2 className="text-xl font-bold text-foreground mb-2">{t('step2Title')}</h2>
          <p className="text-sm text-muted-foreground mb-6">{t('step2Desc')}</p>
          <div className="space-y-3">
            {levelOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleLevelSelect(opt.value)}
                className="w-full text-left px-5 py-4 rounded-lg border border-border bg-card hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <p className="font-semibold text-foreground">{opt.label}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{opt.desc}</p>
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep(1)}
            className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('back')}
          </button>
        </div>
      )}

      {/* Step 3: Interest */}
      {step === 3 && (
        <div>
          <h2 className="text-xl font-bold text-foreground mb-2">{t('step3Title')}</h2>
          <p className="text-sm text-muted-foreground mb-6">{t('step3Desc')}</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {interestOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleInterestSelect(opt.value)}
                className="text-left px-5 py-4 rounded-lg border border-border bg-card hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <p className="font-semibold text-foreground">{opt.label}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{opt.desc}</p>
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep(2)}
            className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('back')}
          </button>
        </div>
      )}

      {/* Results */}
      {step === 'results' && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-foreground">{t('resultsTitle')}</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md border border-border hover:border-primary/40"
                title="Share these results"
              >
                {copied ? (
                  <>
                    <LuCheck className="size-3.5 text-primary" />
                    <span>{t('copied')}</span>
                  </>
                ) : (
                  <>
                    <LuShare2 className="size-3.5" />
                    <span>{t('share')}</span>
                  </>
                )}
              </button>
              <button
                onClick={handleRestart}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('retake')}
              </button>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-2">
            {quiz.lang && (
              <span>
                <span className="text-foreground font-medium">{quiz.lang}</span>
                {quiz.interest && (
                  <>
                    {' '}
                    &middot;{' '}
                    <span className="text-foreground font-medium capitalize">
                      {interestOptions.find(o => o.value === quiz.interest)?.label}
                    </span>
                  </>
                )}
              </span>
            )}
          </p>

          {loading && (
            <div className="space-y-3 mt-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 rounded-lg bg-card border border-border animate-pulse"
                />
              ))}
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
              <button
                onClick={() => fetchIssues(quiz)}
                className="ml-3 underline hover:no-underline"
              >
                {t('retry')}
              </button>
            </div>
          )}

          {!loading && !error && issues.length === 0 && (
            <p className="mt-4 text-muted-foreground text-sm">{t('noIssues')}</p>
          )}

          {!loading && issues.length > 0 && (
            <>
              <div className="space-y-3 mt-4">
                {issues.map(issue => (
                  <ResultCard key={issue.id} issue={issue} />
                ))}
              </div>

              {/* CTA */}
              <div className="mt-8 p-6 rounded-xl bg-card border border-primary/20 text-center">
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {t('ctaTitle')}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                  {t('ctaDesc')}
                </p>
                <Link
                  href="/issues"
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
                >
                  <FaGithub className="size-4" />
                  {t('ctaButton')}
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
