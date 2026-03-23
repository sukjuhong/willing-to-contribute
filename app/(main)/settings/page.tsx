'use client';

import LoginPrompt from '../../components/LoginPrompt';
import SettingsPanel from '../../components/SettingsPanel';
import { useApp } from '../../contexts/AppContext';
import { useTranslation } from '../../hooks/useTranslation';

const SETTINGS_FEATURES = [
  {
    titleKey: 'settingsGuest.notificationFrequency',
    descKey: 'settingsGuest.notificationFrequencyDesc',
  },
  {
    titleKey: 'settingsGuest.customLabelFiltering',
    descKey: 'settingsGuest.customLabelFilteringDesc',
  },
  {
    titleKey: 'settingsGuest.hideClosedIssues',
    descKey: 'settingsGuest.hideClosedIssuesDesc',
  },
  { titleKey: 'settingsGuest.gistSync', descKey: 'settingsGuest.gistSyncDesc' },
] as const;

const SYNC_STEPS = [
  {
    step: '1',
    labelKey: 'settingsGuest.syncSteps.step1',
    descKey: 'settingsGuest.syncSteps.step1Desc',
  },
  {
    step: '2',
    labelKey: 'settingsGuest.syncSteps.step2',
    descKey: 'settingsGuest.syncSteps.step2Desc',
  },
  {
    step: '3',
    labelKey: 'settingsGuest.syncSteps.step3',
    descKey: 'settingsGuest.syncSteps.step3Desc',
  },
] as const;

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
              {t('settingsGuest.customizeTitle')}
            </h3>
            <p className="text-gray-300 leading-relaxed">
              {t('settingsGuest.customizeDesc1')}
            </p>
            <p className="text-gray-400 mt-3 leading-relaxed">
              {t('settingsGuest.customizeDesc2')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SETTINGS_FEATURES.map(item => (
              <div
                key={item.titleKey}
                className="bg-[#161b22] border border-gray-700 rounded-lg p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-2 w-2 rounded-full bg-cyan-500" />
                  <h4 className="text-gray-100 font-semibold">{t(item.titleKey)}</h4>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">{t(item.descKey)}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#161b22] border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">
              {t('settingsGuest.crossDeviceTitle')}
            </h3>
            <p className="text-gray-300 leading-relaxed">
              {t('settingsGuest.crossDeviceDesc1')}
            </p>
            <p className="text-gray-400 mt-3 leading-relaxed">
              {t('settingsGuest.crossDeviceDesc2')}
            </p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SYNC_STEPS.map(item => (
                <div
                  key={item.step}
                  className="flex gap-3 bg-[#0d1117] border border-gray-700 rounded-md p-3"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center">
                    {item.step}
                  </span>
                  <div>
                    <p className="text-gray-100 text-sm font-medium">
                      {t(item.labelKey)}
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">
                      {t(item.descKey)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#161b22] border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">
              {t('settingsGuest.whyTitle')}
            </h3>
            <p className="text-gray-300 leading-relaxed">{t('settingsGuest.whyDesc1')}</p>
            <p className="text-gray-400 mt-3 leading-relaxed">
              {t('settingsGuest.whyDesc2')}
            </p>
            <p className="text-gray-400 mt-3 leading-relaxed">
              {t('settingsGuest.whyDesc3')}
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
