'use client';

import { FaSync, FaGithub } from 'react-icons/fa';
import AddRepositoryForm from '@/app/components/AddRepositoryForm';
import LoginPrompt from '@/app/components/LoginPrompt';
import RepositoryItem from '@/app/components/RepositoryItem';
import { useApp } from '@/app/contexts/AppContext';
import { useTranslations } from 'next-intl';

const FEATURES = [
  {
    titleKey: 'repositoriesGuest.features.addRepos',
    descKey: 'repositoriesGuest.features.addReposDesc',
  },
  {
    titleKey: 'repositoriesGuest.features.monitorIssues',
    descKey: 'repositoriesGuest.features.monitorIssuesDesc',
  },
  {
    titleKey: 'repositoriesGuest.features.removeRepos',
    descKey: 'repositoriesGuest.features.removeReposDesc',
  },
  {
    titleKey: 'repositoriesGuest.features.syncSettings',
    descKey: 'repositoriesGuest.features.syncSettingsDesc',
  },
  {
    titleKey: 'repositoriesGuest.features.notifications',
    descKey: 'repositoriesGuest.features.notificationsDesc',
  },
] as const;

const POPULAR_REPOS = [
  {
    name: 'facebook/react',
    desc: 'A JavaScript library for building user interfaces. Maintained by Meta with a large, welcoming community.',
  },
  {
    name: 'vuejs/vue',
    desc: 'Progressive JavaScript framework focused on the view layer. Beginner-friendly docs and active issue triage.',
  },
  {
    name: 'django/django',
    desc: 'The high-level Python web framework. The "easy pickings" label marks approachable issues for first-time contributors.',
  },
  {
    name: 'microsoft/vscode',
    desc: 'Open-source code editor by Microsoft. Thousands of good-first-issue items across UI, extensions, and language support.',
  },
  {
    name: 'vercel/next.js',
    desc: 'React framework for production. Actively triaged issues with clear reproduction steps make it easy to jump in.',
  },
  {
    name: 'rust-lang/rust',
    desc: 'The Rust programming language itself. The E-easy and E-mentor tags guide newcomers through the contribution process.',
  },
] as const;

const HOW_IT_WORKS_STEPS = [
  {
    step: '1',
    titleKey: 'repositoriesGuest.steps.step1Title',
    descKey: 'repositoriesGuest.steps.step1Desc',
  },
  {
    step: '2',
    titleKey: 'repositoriesGuest.steps.step2Title',
    descKey: 'repositoriesGuest.steps.step2Desc',
  },
  {
    step: '3',
    titleKey: 'repositoriesGuest.steps.step3Title',
    descKey: 'repositoriesGuest.steps.step3Desc',
  },
  {
    step: '4',
    titleKey: 'repositoriesGuest.steps.step4Title',
    descKey: 'repositoriesGuest.steps.step4Desc',
  },
] as const;

export default function RepositoriesPage() {
  const t = useTranslations();
  const {
    settings,
    settingsLoading,
    settingsError,
    addRepository,
    removeRepository,
    authState,
  } = useApp();

  if (!authState.isLoggedIn) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-100">
          {t('settings.trackedRepositories')}
        </h2>
        <LoginPrompt />

        {/* Feature overview for unauthenticated users / SEO content */}
        <div className="space-y-6 mt-4">
          <div className="bg-[#161b22] border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">
              {t('repositoriesGuest.whatIsTracking')}
            </h3>
            <p className="text-gray-300 leading-relaxed">
              {t('repositoriesGuest.trackingDesc1')}
            </p>
            <p className="text-gray-400 mt-3 leading-relaxed">
              {t('repositoriesGuest.trackingDesc2')}
            </p>
          </div>

          <div className="bg-[#161b22] border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-cyan-400 mb-4">
              {t('repositoriesGuest.featuresTitle')}
            </h3>
            <ul className="space-y-3">
              {FEATURES.map(item => (
                <li key={item.titleKey} className="flex gap-3">
                  <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-cyan-500" />
                  <div>
                    <span className="text-gray-100 font-medium">{t(item.titleKey)}</span>
                    <p className="text-gray-400 text-sm mt-0.5">{t(item.descKey)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#161b22] border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-cyan-400 mb-2">
              {t('repositoriesGuest.popularTitle')}
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              {t('repositoriesGuest.popularDesc')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {POPULAR_REPOS.map(repo => (
                <div
                  key={repo.name}
                  className="border border-gray-700 rounded-md p-3 bg-[#0d1117]"
                >
                  <p className="text-cyan-400 font-mono text-sm font-semibold">
                    {repo.name}
                  </p>
                  <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                    {repo.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#161b22] border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-cyan-400 mb-2">
              {t('repositoriesGuest.howItWorksTitle')}
            </h3>
            <ol className="space-y-3 text-gray-300">
              {HOW_IT_WORKS_STEPS.map(item => (
                <li key={item.step} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center">
                    {item.step}
                  </span>
                  <span>
                    <strong className="text-gray-100">{t(item.titleKey)}</strong>
                    {' — '}
                    {t(item.descKey)}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-100">
        {t('settings.trackedRepositories')}
      </h2>

      <AddRepositoryForm
        onAddRepository={addRepository}
        disabled={settingsLoading}
        isLoggedIn={authState.isLoggedIn}
        trackedRepositories={settings.repositories}
      />

      {settingsError && (
        <div className="bg-red-500/10 text-red-400 border border-red-500/20 rounded-md p-4">
          {settingsError}
        </div>
      )}

      {settingsLoading ? (
        <div className="flex justify-center items-center p-8">
          <FaSync className="animate-spin text-cyan-400 mr-2" />
          <span className="text-gray-400">{t('common.loadingRepositories')}</span>
        </div>
      ) : settings.repositories.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {settings.repositories.map(repo => (
            <RepositoryItem key={repo.id} repository={repo} onRemove={removeRepository} />
          ))}
        </div>
      ) : (
        <div className="text-center bg-[#161b22] border border-gray-700 rounded-lg p-8">
          <FaGithub className="mx-auto h-12 w-12 text-gray-600" />
          <h3 className="mt-2 text-lg font-medium text-gray-100">
            {t('settings.noRepositories')}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {t('settings.addRepositoriesToStart')}
          </p>
        </div>
      )}
    </div>
  );
}
