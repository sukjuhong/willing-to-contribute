'use client';

import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

export type SortOption = 'default' | 'matchScore';

export interface FilterState {
  language: string;
  label_preset: string;
  maintainerGrades: ('A' | 'B' | 'C')[];
  minStars: number | null;
  minForks: number | null;
  freshness: string | null;
  label: string;
  sort: SortOption;
}

export interface IssueFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  profileLanguage?: string | null;
  isPersonalized?: boolean;
}

const LANGUAGES = [
  'all',
  'JavaScript',
  'TypeScript',
  'Python',
  'Go',
  'Rust',
  'Java',
  'C++',
  'Ruby',
  'PHP',
];

const LABEL_PRESETS = [
  'good first issue',
  'help wanted',
  'bug',
  'enhancement',
  'documentation',
] as const;
const MAINTAINER_GRADES = ['A', 'B', 'C'] as const;

const STARS_PRESETS = [
  { label: 'any', value: null },
  { label: '100+', value: 100 },
  { label: '500+', value: 500 },
  { label: '1k+', value: 1000 },
  { label: '5k+', value: 5000 },
  { label: '10k+', value: 10000 },
] as const;

const FORKS_PRESETS = [
  { label: 'any', value: null },
  { label: '50+', value: 50 },
  { label: '100+', value: 100 },
  { label: '500+', value: 500 },
  { label: '1k+', value: 1000 },
] as const;

const FRESHNESS_PRESETS = [
  { label: 'any', value: null },
  { label: '1w', value: '1w' },
  { label: '1m', value: '1m' },
  { label: '3m', value: '3m' },
  { label: '6m', value: '6m' },
] as const;

export const DEFAULT_FILTER_STATE: FilterState = {
  language: 'all',
  label_preset: '',
  maintainerGrades: [],
  minStars: null,
  minForks: null,
  freshness: null,
  label: '',
  sort: 'default',
};

export default function IssueFilters({
  filters,
  onFilterChange,
  profileLanguage,
  isPersonalized,
}: IssueFiltersProps) {
  const t = useTranslations();
  const tMaintainer = useTranslations('maintainer');
  const tStarsPreset = useTranslations('filters.starsPreset');
  const tForksPreset = useTranslations('filters.forksPreset');
  const tFreshnessPreset = useTranslations('filters.freshnessPreset');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const toggleLabelPreset = (l: string) => {
    const next = filters.label_preset === l ? '' : l;
    onFilterChange({ ...filters, label_preset: next });
  };

  const toggleGrade = (g: (typeof MAINTAINER_GRADES)[number]) => {
    const next = filters.maintainerGrades.includes(g)
      ? filters.maintainerGrades.filter(v => v !== g)
      : [...filters.maintainerGrades, g];
    onFilterChange({ ...filters, maintainerGrades: next });
  };

  const chipClass = (active: boolean) =>
    cn(
      'h-11 min-w-11 px-2.5 text-xs font-medium rounded-md border transition-colors',
      active
        ? 'bg-primary/20 text-primary border-primary/30 hover:bg-primary/30'
        : 'bg-muted text-muted-foreground border-border hover:bg-accent',
    );

  const clearAll = () => {
    onFilterChange({ ...DEFAULT_FILTER_STATE });
  };

  const hasActiveFilters =
    filters.language !== 'all' ||
    filters.label_preset !== '' ||
    filters.maintainerGrades.length > 0 ||
    filters.minStars !== null ||
    filters.minForks !== null ||
    filters.freshness !== null ||
    filters.label !== '' ||
    filters.sort !== 'default';

  return (
    <div className="space-y-3">
      {/* Always visible: Language + Difficulty */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground whitespace-nowrap">
            {t('filters.language')}
          </label>
          <Select
            value={filters.language}
            onValueChange={value => onFilterChange({ ...filters, language: value })}
          >
            <SelectTrigger className="text-sm h-9 w-auto min-w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map(lang => (
                <SelectItem key={lang} value={lang}>
                  {lang === 'all' ? t('filters.allLanguages') : lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {profileLanguage && filters.language === 'all' && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
              {t('filters.fromProfile')}: {profileLanguage}
            </span>
          )}
        </div>

        {isPersonalized && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground whitespace-nowrap">
              {t('filters.sortBy')}
            </label>
            <Select
              value={filters.sort}
              onValueChange={value =>
                onFilterChange({ ...filters, sort: value as SortOption })
              }
            >
              <SelectTrigger className="text-sm h-9 w-auto min-w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">{t('filters.sortDefault')}</SelectItem>
                <SelectItem value="matchScore">
                  {t('filters.sortMatchScore')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground whitespace-nowrap">
            {t('filters.labels')}
          </label>
          <div className="flex gap-1.5 flex-wrap">
            {LABEL_PRESETS.map(l => (
              <Button
                key={l}
                variant="ghost"
                onClick={() => toggleLabelPreset(l)}
                className={chipClass(filters.label_preset === l)}
              >
                {l}
              </Button>
            ))}
          </div>
        </div>

        <Collapsible
          open={showAdvanced}
          onOpenChange={setShowAdvanced}
          className="ml-auto"
        >
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              {t('filters.advanced')}
              {showAdvanced ? (
                <FaChevronUp className="text-[10px]" />
              ) : (
                <FaChevronDown className="text-[10px]" />
              )}
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent className="mt-3">
            <div className="bg-background border border-border rounded-lg p-4 space-y-4">
              {/* Maintainer Score */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground whitespace-nowrap min-w-[100px]">
                  {t('filters.maintainerScore')}
                </label>
                <div className="flex gap-1.5">
                  {MAINTAINER_GRADES.map(g => (
                    <Button
                      key={g}
                      variant="ghost"
                      onClick={() => toggleGrade(g)}
                      className={chipClass(filters.maintainerGrades.includes(g))}
                    >
                      {tMaintainer(`grade${g}`)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Stars Range */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground whitespace-nowrap min-w-[100px]">
                  {t('filters.starsRange')}
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {STARS_PRESETS.map(p => (
                    <Button
                      key={p.label}
                      variant="ghost"
                      onClick={() => onFilterChange({ ...filters, minStars: p.value })}
                      className={chipClass(filters.minStars === p.value)}
                    >
                      {tStarsPreset(p.label)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Forks Range */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground whitespace-nowrap min-w-[100px]">
                  {t('filters.forksRange')}
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {FORKS_PRESETS.map(p => (
                    <Button
                      key={p.label}
                      variant="ghost"
                      onClick={() => onFilterChange({ ...filters, minForks: p.value })}
                      className={chipClass(filters.minForks === p.value)}
                    >
                      {tForksPreset(p.label)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Freshness */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground whitespace-nowrap min-w-[100px]">
                  {t('filters.freshness')}
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {FRESHNESS_PRESETS.map(p => (
                    <Button
                      key={p.label}
                      variant="ghost"
                      onClick={() => onFilterChange({ ...filters, freshness: p.value })}
                      className={chipClass(filters.freshness === p.value)}
                    >
                      {tFreshnessPreset(p.label)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Label */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground whitespace-nowrap min-w-[100px]">
                  {t('filters.label')}
                </label>
                <Input
                  type="text"
                  value={filters.label}
                  onChange={e => onFilterChange({ ...filters, label: e.target.value })}
                  placeholder={t('filters.labelPlaceholder')}
                  className="text-sm h-9 w-48"
                />
              </div>

              {/* Clear All */}
              {hasActiveFilters && (
                <div className="flex justify-end">
                  <button
                    onClick={clearAll}
                    className="text-xs text-destructive hover:text-destructive/80 transition-colors"
                  >
                    {t('filters.clearAll')}
                  </button>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
