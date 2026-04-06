'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaCheck, FaSpinner, FaRedo } from 'react-icons/fa';
import { useTranslations } from 'next-intl';
import type { UserProfileData } from '../hooks/useUserProfile';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="bg-card border-border max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle className="text-foreground">{t('modalTitle')}</DialogTitle>
        </DialogHeader>

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
                      <FaSpinner className="text-muted-foreground text-sm animate-spin" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-border" />
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm transition-colors duration-300 ${
                      done ? 'text-foreground' : 'text-muted-foreground'
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
          <div
            role="alert"
            className="mt-4 bg-destructive/10 border border-destructive/20 rounded-md p-3 flex items-center justify-between"
          >
            <span className="text-sm text-destructive">{t('errorRetry')}</span>
            <Button
              onClick={startAnalysis}
              aria-label={t('errorRetry')}
              variant="ghost"
              size="sm"
              className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10 border border-destructive/30"
            >
              <FaRedo className="text-xs" />
            </Button>
          </div>
        )}

        {/* Footer close button */}
        {isAllDone && !error && (
          <DialogFooter>
            <Button
              variant="outline"
              onClick={onClose}
              className="text-cyan-400 border-cyan-500/20 bg-cyan-500/10 hover:bg-cyan-500/20"
            >
              {t('close')}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
