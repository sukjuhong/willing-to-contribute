'use client';

import SettingsPanel from '../../components/SettingsPanel';
import { useApp } from '../../contexts/AppContext';
import { useTranslation } from '../../hooks/useTranslation';

export default function SettingsPage() {
  const { t } = useTranslation();
  const {
    authState,
    login,
    settings,
    settingsLoading,
    updateNotificationFrequency,
    toggleHideClosedIssues,
    toggleCustomLabel,
  } = useApp();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
        {t('settings.preferences')}
      </h2>

      <SettingsPanel
        settings={settings}
        onUpdateFrequency={updateNotificationFrequency}
        onToggleHideClosedIssues={toggleHideClosedIssues}
        onToggleCustomLabel={toggleCustomLabel}
        disabled={settingsLoading}
      />

      {!authState.isLoggedIn && (
        <div className="p-4 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 rounded-md">
          <p className="text-sm">
            <strong>{t('common.note')}:</strong> {t('settings.settingsSavedLocally')}{' '}
            <button
              onClick={login}
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {t('common.loginWithGithub')}
            </button>{' '}
            {t('settings.toSyncSettings')}
          </p>
        </div>
      )}
    </div>
  );
}
