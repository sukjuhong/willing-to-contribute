'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaCheck, FaSpinner, FaRedo } from 'react-icons/fa';
import { useTranslations } from 'next-intl';
import type { UserProfileData } from '../hooks/useUserProfile';

interface ProfileAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyze: () => Promise<void>;
  profileData: UserProfileData | null;
  error: string | null;
}

const STEP_DELAY = 800;

export default function ProfileAnalysisModal({
  isOpen,
  onClose,
  onAnalyze,
  profileData,
  error,
}: ProfileAnalysisModalProps) {
  const t = useTranslations('profileAnalysis');
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [apiDone, setApiDone] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const hasStarted = useRef(false);

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const startAnalysis = useCallback(async () => {
    setCompletedSteps([]);
    setApiDone(false);
    setIsRetrying(true);

    // Step 1: immediate
    setCompletedSteps([1]);

    // Steps 2-4: staggered simulation
    for (let step = 2; step <= 4; step++) {
      const timeout = setTimeout(
        () => {
          setCompletedSteps(prev => [...prev, step]);
        },
        STEP_DELAY * (step - 1),
      );
      timeoutsRef.current.push(timeout);
    }

    // API call in parallel
    try {
      await onAnalyze();
      setApiDone(true);
    } catch {
      setApiDone(true);
    } finally {
      setIsRetrying(false);
    }
  }, [onAnalyze]);

  // Step 5: complete when both simulation and API are done
  useEffect(() => {
    if (apiDone && completedSteps.includes(4) && !completedSteps.includes(5)) {
      const timeout = setTimeout(() => {
        setCompletedSteps(prev => [...prev, 5]);
      }, 300);
      timeoutsRef.current.push(timeout);
    }
  }, [apiDone, completedSteps]);

  // Start analysis when modal opens
  useEffect(() => {
    if (isOpen && !hasStarted.current) {
      hasStarted.current = true;
      startAnalysis();
    }
    if (!isOpen) {
      hasStarted.current = false;
      clearTimeouts();
    }
  }, [isOpen, startAnalysis, clearTimeouts]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Cleanup
  useEffect(() => {
    return () => clearTimeouts();
  }, [clearTimeouts]);

  const isStepDone = (step: number) => completedSteps.includes(step);
  const isAllDone = completedSteps.includes(5);

  const getStepData = (step: number): string | null => {
    if (isRetrying || !profileData || !isStepDone(step)) return null;
    switch (step) {
      case 2:
        return profileData.top_languages?.join(', ') || null;
      case 3:
        return profileData.contributed_repos
          ? t('repoCount', { count: profileData.contributed_repos.length })
          : null;
      case 4:
        return profileData.starred_categories
          ? t('categoryCount', { count: profileData.starred_categories.length })
          : null;
      default:
        return null;
    }
  };

  const steps = [
    { step: 1, label: t('step1') },
    {
      step: 2,
      label: isStepDone(2) ? t('step2Done') : t('step2Pending'),
    },
    {
      step: 3,
      label: isStepDone(3) ? t('step3Done') : t('step3Pending'),
    },
    {
      step: 4,
      label: isStepDone(4) ? t('step4Done') : t('step4Pending'),
    },
    { step: 5, label: t('step5') },
  ];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-analysis-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal content */}
      <div className="relative z-10 bg-[#161b22] border border-gray-700 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <button
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-200 transition-colors text-lg"
          onClick={onClose}
          aria-label={t('close')}
        >
          ✕
        </button>
        <h3 id="profile-analysis-title" className="text-lg font-bold text-gray-100 mb-6">
          {t('modalTitle')}
        </h3>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map(({ step, label }) => {
            const done = isStepDone(step);
            const isActive = !done && step <= Math.max(...completedSteps, 0) + 1;
            const data = getStepData(step);

            return (
              <div
                key={step}
                className="flex items-start gap-3 transition-all duration-300"
              >
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {done ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <FaCheck className="text-emerald-400 text-xs" />
                    </div>
                  ) : isActive ? (
                    <div className="w-5 h-5 flex items-center justify-center">
                      <FaSpinner className="text-gray-500 text-sm animate-spin" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-gray-700" />
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm transition-colors duration-300 ${
                      done ? 'text-gray-100' : 'text-gray-500'
                    }`}
                  >
                    {label}
                  </p>
                  {data && <p className="text-xs text-cyan-400 mt-0.5">{data}</p>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Error */}
        {error && isAllDone && (
          <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-md p-3 flex items-center justify-between">
            <span className="text-sm text-red-400">{t('errorRetry')}</span>
            <button
              onClick={startAnalysis}
              aria-label={t('errorRetry')}
              className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-md border border-red-500/30 transition-colors"
            >
              <FaRedo className="text-xs" />
            </button>
          </div>
        )}

        {/* Close button */}
        {isAllDone && !error && (
          <div className="mt-6 flex justify-end">
            <button
              className="px-4 py-2 text-sm font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-md hover:bg-cyan-500/20 transition-colors"
              onClick={onClose}
            >
              {t('close')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
