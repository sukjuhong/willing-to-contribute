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
      <h2 className="text-xl font-bold text-gray-100">{t('settings.preferences')}</h2>

      <SettingsPanel
        settings={settings}
        onUpdateFrequency={updateNotificationFrequency}
        onToggleHideClosedIssues={toggleHideClosedIssues}
        onToggleCustomLabel={toggleCustomLabel}
        disabled={settingsLoading}
      />

      {!authState.isLoggedIn && (
        <div className="bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md p-4">
          <p className="text-sm">
            <strong>{t('common.note')}:</strong> {t('settings.settingsSavedLocally')}{' '}
            <button onClick={login} className="text-cyan-400 hover:underline">
              {t('common.loginWithGithub')}
            </button>{' '}
            {t('settings.toSyncSettings')}
          </p>
        </div>
      )}
    </div>
  );
}
