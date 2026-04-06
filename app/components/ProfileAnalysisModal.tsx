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
  const [analyzing, setAnalyzing] = useState(false);
  const hasStarted = useRef(false);

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const startAnalysis = useCallback(async () => {
    setCompletedSteps([]);
    setApiDone(false);
    setAnalyzing(true);

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
      setAnalyzing(false);
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

  // Cleanup
  useEffect(() => {
    return () => clearTimeouts();
  }, [clearTimeouts]);

  const isStepDone = (step: number) => completedSteps.includes(step);
  const isAllDone = completedSteps.includes(5);

  const getStepData = (step: number): string | null => {
    if (!profileData || !isStepDone(step)) return null;
    switch (step) {
      case 2:
        return profileData.top_languages?.join(', ') || null;
      case 3:
        return profileData.contributed_repos
          ? `${profileData.contributed_repos.length} repositories`
          : null;
      case 4:
        return profileData.starred_categories
          ? `${profileData.starred_categories.length} categories`
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
    <div className="modal modal-open modal-bottom sm:modal-middle">
      <div className="modal-box bg-[#161b22] border border-gray-700 max-w-md">
        {/* Header */}
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-gray-400 hover:text-gray-200"
          onClick={onClose}
        >
          ✕
        </button>
        <h3 className="text-lg font-bold text-gray-100 mb-6">{t('modalTitle')}</h3>

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
                  ) : isActive || analyzing ? (
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
              className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-md border border-red-500/30 transition-colors"
            >
              <FaRedo className="text-xs" />
            </button>
          </div>
        )}

        {/* Close button */}
        {isAllDone && !error && (
          <div className="modal-action">
            <button
              className="px-4 py-2 text-sm font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-md hover:bg-cyan-500/20 transition-colors"
              onClick={onClose}
            >
              {t('close')}
            </button>
          </div>
        )}
      </div>
      {/* Backdrop */}
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}
