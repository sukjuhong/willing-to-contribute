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
