'use client';

import React from 'react';
import { LuActivity } from 'react-icons/lu';
import { useTranslations } from 'next-intl';

export default function FeedHeader() {
  const t = useTranslations('feed');

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <LuActivity className="text-primary text-xl" />
        <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
      </div>
      <p className="text-muted-foreground text-sm">{t('subtitle')}</p>
    </div>
  );
}
