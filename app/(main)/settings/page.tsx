'use client';

import LoginPrompt from '../../components/LoginPrompt';
import SettingsPanel from '../../components/SettingsPanel';
import { useApp } from '../../contexts/AppContext';
import { useTranslation } from '../../hooks/useTranslation';

export default function SettingsPage() {
  const { t } = useTranslation();
  const {
    authState,
    settings,
    settingsLoading,
    updateNotificationFrequency,
    toggleHideClosedIssues,
    toggleCustomLabel,
  } = useApp();

  if (!authState.isLoggedIn) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-100">{t('settings.preferences')}</h2>
        <LoginPrompt />

        {/* Feature overview for unauthenticated users / SEO content */}
        <div className="space-y-6 mt-4">
          <div className="bg-[#161b22] border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">
              Customize Your Experience
            </h3>
            <p className="text-gray-300 leading-relaxed">
              The Settings page lets you tailor every aspect of how Willing to Contribute
              works for you. Once you sign in with GitHub you can configure notification
              frequency, define custom issue-label filters, decide whether to show or hide
              closed issues, and manage cross-device synchronization — all from a single
              panel.
            </p>
            <p className="text-gray-400 mt-3 leading-relaxed">
              Every setting is persisted in your browser and optionally backed up to a
              private GitHub Gist so your preferences follow you across devices and
              browsers. Changes take effect immediately — no page reload required.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#161b22] border border-gray-700 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="h-2 w-2 rounded-full bg-cyan-500" />
                <h4 className="text-gray-100 font-semibold">Notification Frequency</h4>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Choose how often the app checks for new beginner-friendly issues — every
                15 minutes, 30 minutes, hourly, or on-demand. Browser notifications are
                delivered instantly when a matching issue appears so you can act on it
                before others.
              </p>
            </div>

            <div className="bg-[#161b22] border border-gray-700 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="h-2 w-2 rounded-full bg-cyan-500" />
                <h4 className="text-gray-100 font-semibold">Custom Label Filtering</h4>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Beyond the built-in{' '}
                <span className="font-mono text-cyan-400 text-xs">good first issue</span>{' '}
                and <span className="font-mono text-cyan-400 text-xs">help wanted</span>{' '}
                filters, you can add any GitHub label you care about. Toggle individual
                labels on or off to show only the issue types that match your skills and
                interests.
              </p>
            </div>

            <div className="bg-[#161b22] border border-gray-700 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="h-2 w-2 rounded-full bg-cyan-500" />
                <h4 className="text-gray-100 font-semibold">Hide Closed Issues</h4>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                GitHub occasionally keeps closed issues visible for historical reference.
                Toggle this option on to keep your feed clean and focused on actionable,
                open issues only — reducing noise when you are scanning for your next
                contribution opportunity.
              </p>
            </div>

            <div className="bg-[#161b22] border border-gray-700 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="h-2 w-2 rounded-full bg-cyan-500" />
                <h4 className="text-gray-100 font-semibold">Gist Synchronization</h4>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Save your entire settings — tracked repositories, label filters, and
                preferences — to a private GitHub Gist with one click. Load them back at
                any time or on any device. Conflict resolution is built in, so you always
                stay in control of which version wins.
              </p>
            </div>
          </div>

          <div className="bg-[#161b22] border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">
              Cross-Device Sync via GitHub Gist
            </h3>
            <p className="text-gray-300 leading-relaxed">
              Willing to Contribute uses{' '}
              <strong className="text-gray-100">private GitHub Gists</strong> as a
              lightweight cloud storage layer — no separate account or third-party service
              required. When you trigger a sync, the app serializes your current settings
              into a JSON file and saves it to a Gist that only you can read.
            </p>
            <p className="text-gray-400 mt-3 leading-relaxed">
              On another device, sign in with the same GitHub account and load the Gist to
              restore everything instantly. If the remote Gist and your local settings
              have diverged, a conflict resolution dialog guides you through choosing
              which version to keep — local, remote, or a manual merge. Your Gist is never
              shared publicly and can be deleted from your GitHub account at any time.
            </p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  step: '1',
                  label: 'Save to Gist',
                  desc: 'Click "Save to Gist" to upload your current settings to a private GitHub Gist.',
                },
                {
                  step: '2',
                  label: 'Sign in Anywhere',
                  desc: 'On any device, sign in with your GitHub account to access the sync feature.',
                },
                {
                  step: '3',
                  label: 'Load from Gist',
                  desc: 'Click "Load from Gist" to restore your tracked repositories and preferences.',
                },
              ].map(item => (
                <div
                  key={item.step}
                  className="flex gap-3 bg-[#0d1117] border border-gray-700 rounded-md p-3"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center">
                    {item.step}
                  </span>
                  <div>
                    <p className="text-gray-100 text-sm font-medium">{item.label}</p>
                    <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#161b22] border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">
              Why These Settings Matter for Open-Source Contributors
            </h3>
            <p className="text-gray-300 leading-relaxed">
              Finding the right issue to work on is one of the biggest hurdles for new
              open-source contributors. The default GitHub interface shows every issue
              across a repository — bugs, feature requests, performance work, and
              refactors — without distinguishing which ones are suitable for beginners.
              Willing to Contribute solves this by letting you filter aggressively so you
              only see what is relevant to your current skill level.
            </p>
            <p className="text-gray-400 mt-3 leading-relaxed">
              Notification frequency matters too. Many beginner-friendly issues are
              claimed within hours of being labeled. Setting a shorter polling interval
              means you hear about new issues faster, giving you a better chance of being
              the first to comment and claim the work. Combined with custom label filters,
              you can build a highly targeted feed that surfaces exactly the kind of
              issues you are ready to tackle.
            </p>
            <p className="text-gray-400 mt-3 leading-relaxed">
              All settings are stored locally in your browser first, so the app works even
              without an internet connection after the initial load. The Gist sync layer
              is purely optional and additive — it adds persistence across devices without
              removing local control.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-100">{t('settings.preferences')}</h2>

      <SettingsPanel
        settings={settings}
        onUpdateFrequency={updateNotificationFrequency}
        onToggleHideClosedIssues={toggleHideClosedIssues}
        onToggleCustomLabel={toggleCustomLabel}
        disabled={settingsLoading}
      />
    </div>
  );
}
