'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Checkbox } from '@/components/ui/checkbox';

interface PrivacyToggleProps {
  isPublic: boolean;
  onToggle: (isPublic: boolean) => Promise<void>;
}

export default function PrivacyToggle({ isPublic, onToggle }: PrivacyToggleProps) {
  const t = useTranslations('privacy');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (checked: boolean) => {
    setSaving(true);
    setError(null);
    try {
      await onToggle(checked);
    } catch {
      setError(t('saveError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
        <Checkbox
          checked={isPublic}
          onCheckedChange={checked => handleChange(checked === true)}
          disabled={saving}
          aria-label={t('toggle.title')}
        />
        <span className="text-sm font-medium text-foreground">{t('toggle.title')}</span>
        {saving && <span className="text-xs text-muted-foreground">{t('saving')}</span>}
      </label>
      <p className="text-xs text-muted-foreground pl-6">{t('toggle.description')}</p>
      {error && <p className="text-xs text-destructive pl-6">{error}</p>}
    </div>
  );
}
