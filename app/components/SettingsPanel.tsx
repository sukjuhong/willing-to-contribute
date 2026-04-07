import React, { useState } from 'react';
import { UserSettings } from '../types';
import { FaCog, FaRegBell, FaSave, FaSpinner } from 'react-icons/fa';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleFrequencyChange = async (value: string) => {
    setLoading(true);
    setError(null);
    try {
      await onUpdateFrequency(value as 'hourly' | '6hours' | 'daily' | 'never');
    } catch {
      setError(t('errors.failedToUpdateNotificationFrequency'));
    } finally {
      setLoading(false);
    }
  };

  const handleHideClosedToggle = async (checked: boolean) => {
    setLoading(true);
    setError(null);
    try {
      await onToggleHideClosedIssues(checked);
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
    <Card className="bg-card border-border p-4">
      <div className="flex items-center mb-4">
        <FaCog className="text-primary mr-2" />
        <h3 className="text-lg font-semibold text-foreground">{t('settings.title')}</h3>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm p-2"
        >
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            {t('settings.notificationFrequency')}
          </label>
          <div className="flex items-center gap-2">
            <FaRegBell className="text-muted-foreground shrink-0" />
            <Select
              value={settings.notificationFrequency}
              onValueChange={handleFrequencyChange}
              disabled={disabled || loading}
            >
              <SelectTrigger className="w-full bg-background border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">{t('settings.frequency.hourly')}</SelectItem>
                <SelectItem value="6hours">{t('settings.frequency.6hours')}</SelectItem>
                <SelectItem value="daily">{t('settings.frequency.daily')}</SelectItem>
                <SelectItem value="never">{t('settings.frequency.never')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="hideClosedIssues"
              checked={settings.hideClosedIssues}
              onCheckedChange={handleHideClosedToggle}
              disabled={disabled || loading}
            />
            <label
              htmlFor="hideClosedIssues"
              className="text-sm text-foreground cursor-pointer"
            >
              {t('settings.hideClosedIssues')}
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            {t('settings.customLabels')}
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {settings.customLabels.map(label => (
              <span
                key={label}
                className="inline-flex items-center bg-primary/10 text-primary border border-primary/20 rounded-full px-2.5 py-0.5 text-xs font-medium font-mono"
              >
                {label}
                <button
                  type="button"
                  onClick={() => handleRemoveCustomLabel(label)}
                  disabled={disabled || loading}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-primary/20 hover:text-primary/80 focus:outline-none"
                >
                  <span className="sr-only">{t('settings.removeLabel', { label })}</span>×
                </button>
              </span>
            ))}
          </div>
          <form onSubmit={handleAddCustomLabel} className="flex">
            <Input
              type="text"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              placeholder={t('settings.addCustomLabel')}
              disabled={disabled || loading}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground rounded-r-none border-r-0"
            />
            <Button
              type="submit"
              disabled={disabled || loading || !newLabel.trim()}
              aria-label={t('settings.addCustomLabel')}
              className="rounded-l-none"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaSave />}
            </Button>
          </form>
          <p className="mt-1 text-muted-foreground text-xs">
            {t('settings.customLabelsDescription')}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default SettingsPanel;
