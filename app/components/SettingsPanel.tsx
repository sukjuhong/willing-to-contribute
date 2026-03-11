import React, { useState } from 'react';
import { UserSettings } from '../types';
import { FaCog, FaRegBell, FaSave, FaSpinner } from 'react-icons/fa';
import { useTranslation } from '../hooks/useTranslation';

interface SettingsPanelProps {
  settings: UserSettings;
  onUpdateFrequency: (
    frequency: 'hourly' | '6hours' | 'daily' | 'never',
  ) => Promise<boolean>;
  onToggleHideClosedIssues: (hide: boolean) => Promise<boolean>;
  onToggleCustomLabel: (label: string, add: boolean) => Promise<boolean>;
  disabled?: boolean;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onUpdateFrequency,
  onToggleHideClosedIssues,
  onToggleCustomLabel,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleFrequencyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLoading(true);
    setError(null);
    try {
      const value = e.target.value as 'hourly' | '6hours' | 'daily' | 'never';
      await onUpdateFrequency(value);
    } catch {
      setError(t('errors.failedToUpdateNotificationFrequency'));
    } finally {
      setLoading(false);
    }
  };

  const handleHideClosedToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    setError(null);
    try {
      await onToggleHideClosedIssues(e.target.checked);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(t('errors.failedToUpdateHideClosedIssues'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomLabel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const success = await onToggleCustomLabel(newLabel.trim(), true);
      if (success) {
        setNewLabel('');
      }
    } catch {
      setError(t('errors.failedToAddCustomLabel'));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCustomLabel = async (label: string) => {
    setLoading(true);
    setError(null);
    try {
      await onToggleCustomLabel(label, false);
    } catch {
      setError(t('errors.failedToRemoveCustomLabel'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#161b22] rounded-lg border border-gray-700 p-4">
      <div className="flex items-center mb-4">
        <FaCog className="text-cyan-400 mr-2" />
        <h3 className="text-lg font-semibold text-gray-100">{t('settings.title')}</h3>
      </div>

      {error && (
        <div className="mb-4 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md text-sm p-2">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            {t('settings.notificationFrequency')}
          </label>
          <div className="flex items-center">
            <FaRegBell className="text-gray-400 mr-2" />
            <select
              value={settings.notificationFrequency}
              onChange={handleFrequencyChange}
              disabled={disabled || loading}
              className="block w-full px-3 py-2 bg-[#0d1117] border border-gray-700 rounded-md text-gray-100 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value="hourly">{t('settings.frequency.hourly')}</option>
              <option value="6hours">{t('settings.frequency.every6Hours')}</option>
              <option value="daily">{t('settings.frequency.daily')}</option>
              <option value="never">{t('settings.frequency.never')}</option>
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center">
            <input
              id="hideClosedIssues"
              type="checkbox"
              checked={settings.hideClosedIssues}
              onChange={handleHideClosedToggle}
              disabled={disabled || loading}
              className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 bg-[#0d1117] border-gray-600 rounded"
            />
            <label
              htmlFor="hideClosedIssues"
              className="ml-2 block text-sm text-gray-300"
            >
              {t('settings.hideClosedIssues')}
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            {t('settings.customLabels')}
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {settings.customLabels.map(label => (
              <span
                key={label}
                className="inline-flex items-center bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full px-2.5 py-0.5 text-xs font-medium font-[family-name:var(--font-mono)]"
              >
                {label}
                <button
                  type="button"
                  onClick={() => handleRemoveCustomLabel(label)}
                  disabled={disabled || loading}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-cyan-500/20 hover:text-cyan-300 focus:outline-none"
                >
                  <span className="sr-only">{t('settings.removeLabel', { label })}</span>×
                </button>
              </span>
            ))}
          </div>
          <form onSubmit={handleAddCustomLabel} className="flex">
            <input
              type="text"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              placeholder={t('settings.addCustomLabel')}
              disabled={disabled || loading}
              className="block w-full px-3 py-2 bg-[#0d1117] border border-gray-700 text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 rounded-l-md"
            />
            <button
              type="submit"
              disabled={disabled || loading || !newLabel.trim()}
              className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-cyan-600 hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 ${
                disabled || loading || !newLabel.trim()
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaSave />}
            </button>
          </form>
          <p className="mt-1 text-gray-500 text-xs">
            {t('settings.customLabelsDescription')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
