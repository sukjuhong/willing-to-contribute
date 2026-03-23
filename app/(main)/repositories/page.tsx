'use client';

import { FaSync, FaGithub } from 'react-icons/fa';
import AddRepositoryForm from '../../components/AddRepositoryForm';
import LoginPrompt from '../../components/LoginPrompt';
import RepositoryItem from '../../components/RepositoryItem';
import { useApp } from '../../contexts/AppContext';
import { useTranslation } from '../../hooks/useTranslation';

export default function RepositoriesPage() {
  const { t } = useTranslation();
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
              What is Repository Tracking?
            </h3>
            <p className="text-gray-300 leading-relaxed">
              Repository Tracking is the core feature of Willing to Contribute. Once you
              sign in with GitHub, you can add any public GitHub repository to your
              personal tracking list. The app continuously monitors those repositories and
              surfaces open issues labeled as beginner-friendly — tags like{' '}
              <span className="text-cyan-400 font-mono text-sm">good first issue</span>,{' '}
              <span className="text-cyan-400 font-mono text-sm">help wanted</span>, and{' '}
              <span className="text-cyan-400 font-mono text-sm">easy</span> — so you never
              have to manually browse dozens of issue trackers.
            </p>
            <p className="text-gray-400 mt-3 leading-relaxed">
              You can track as many repositories as you like. Each repository is shown as
              a card with a direct link to its GitHub page. Removing a repository from
              your list takes a single click and never affects the upstream project in any
              way.
            </p>
          </div>

          <div className="bg-[#161b22] border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-cyan-400 mb-4">
              Everything You Can Do After Signing In
            </h3>
            <ul className="space-y-3">
              {[
                {
                  title: 'Add Repositories by URL or owner/name',
                  desc: 'Paste a full GitHub URL like https://github.com/facebook/react or type the short form facebook/react — the app resolves it automatically.',
                },
                {
                  title: 'Monitor Beginner-Friendly Issues in Real Time',
                  desc: 'Issues are fetched directly from the GitHub API and refreshed on demand. Filter by label, sort by date or comments, and hide issues that are already closed.',
                },
                {
                  title: 'Remove Repositories Anytime',
                  desc: 'Keep your list focused. Remove repositories you no longer want to track with a single click — your other tracked repos are unaffected.',
                },
                {
                  title: 'Sync Settings Across Devices via GitHub Gist',
                  desc: 'Your tracked repository list is saved to a private GitHub Gist. Sign in from any device and your entire list is restored automatically.',
                },
                {
                  title: 'Get Browser Notifications for New Issues',
                  desc: 'Enable desktop notifications in Settings and be alerted whenever a new beginner-friendly issue appears in one of your tracked repositories.',
                },
              ].map(item => (
                <li key={item.title} className="flex gap-3">
                  <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-cyan-500" />
                  <div>
                    <span className="text-gray-100 font-medium">{item.title}</span>
                    <p className="text-gray-400 text-sm mt-0.5">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#161b22] border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-cyan-400 mb-2">
              Popular Beginner-Friendly Repositories to Get Started
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Not sure where to begin? These well-maintained open-source projects have
              active maintainers and regularly label issues for new contributors.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
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
              ].map(repo => (
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
            <h3 className="text-lg font-semibold text-cyan-400 mb-2">How It Works</h3>
            <ol className="space-y-3 text-gray-300">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <span>
                  <strong className="text-gray-100">Sign in with GitHub</strong> — OAuth
                  login grants read access to public repositories and write access to your
                  private Gists for settings sync. No write access to your code is ever
                  requested.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <span>
                  <strong className="text-gray-100">Add repositories</strong> — Enter a
                  GitHub repository URL or the short owner/name format. The app validates
                  that the repository exists before adding it.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <span>
                  <strong className="text-gray-100">Browse open issues</strong> — Switch
                  to the Issues tab to see all beginner-friendly issues across your
                  tracked repositories, sorted by newest first.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center">
                  4
                </span>
                <span>
                  <strong className="text-gray-100">Pick an issue and contribute</strong>{' '}
                  — Click any issue to open it on GitHub. Read the discussion, ask
                  questions, and submit your first pull request.
                </span>
              </li>
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
