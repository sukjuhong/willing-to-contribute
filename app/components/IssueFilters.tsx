'use client';

import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useTranslations } from 'next-intl';

export interface FilterState {
  language: string;
  difficulties: ('beginner' | 'intermediate' | 'advanced')[];
  maintainerGrades: ('A' | 'B' | 'C')[];
  minStars: number | null;
  minForks: number | null;
  freshness: string | null;
  label: string;
}

export interface IssueFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  profileLanguage?: string | null;
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

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const;
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
  difficulties: [],
  maintainerGrades: [],
  minStars: null,
  minForks: null,
  freshness: null,
  label: '',
};

export default function IssueFilters({
  filters,
  onFilterChange,
  profileLanguage,
}: IssueFiltersProps) {
  const t = useTranslations();
  const tDifficulty = useTranslations('difficulty');
  const tMaintainer = useTranslations('maintainer');
  const tStarsPreset = useTranslations('filters.starsPreset');
  const tForksPreset = useTranslations('filters.forksPreset');
  const tFreshnessPreset = useTranslations('filters.freshnessPreset');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const toggleDifficulty = (d: (typeof DIFFICULTIES)[number]) => {
    const next = filters.difficulties.includes(d)
      ? filters.difficulties.filter(v => v !== d)
      : [...filters.difficulties, d];
    onFilterChange({ ...filters, difficulties: next });
  };

  const toggleGrade = (g: (typeof MAINTAINER_GRADES)[number]) => {
    const next = filters.maintainerGrades.includes(g)
      ? filters.maintainerGrades.filter(v => v !== g)
      : [...filters.maintainerGrades, g];
    onFilterChange({ ...filters, maintainerGrades: next });
  };

  const chipClass = (active: boolean) =>
    active
      ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
      : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700';

  const clearAll = () => {
    onFilterChange({ ...DEFAULT_FILTER_STATE });
  };

  const hasActiveFilters =
    filters.language !== 'all' ||
    filters.difficulties.length > 0 ||
    filters.maintainerGrades.length > 0 ||
    filters.minStars !== null ||
    filters.minForks !== null ||
    filters.freshness !== null ||
    filters.label !== '';

  return (
    <div className="space-y-3">
      {/* Always visible: Language + Difficulty */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400 whitespace-nowrap">
            {t('filters.language')}
          </label>
          <select
            value={filters.language}
            onChange={e => onFilterChange({ ...filters, language: e.target.value })}
            className="text-sm bg-[#0d1117] border border-gray-700 rounded-md px-2 py-1 text-gray-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            {LANGUAGES.map(lang => (
              <option key={lang} value={lang}>
                {lang === 'all' ? t('filters.allLanguages') : lang}
              </option>
            ))}
          </select>
          {profileLanguage && filters.language === 'all' && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {t('filters.fromProfile')}: {profileLanguage}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400 whitespace-nowrap">
            {t('filters.difficulty')}
          </label>
          <div className="flex gap-1.5">
            {DIFFICULTIES.map(d => (
              <button
                key={d}
                onClick={() => toggleDifficulty(d)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${chipClass(filters.difficulties.includes(d))}`}
              >
                {tDifficulty(d)}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200 transition-colors"
        >
          {t('filters.advanced')}
          {showAdvanced ? (
            <FaChevronUp className="text-[10px]" />
          ) : (
            <FaChevronDown className="text-[10px]" />
          )}
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="bg-[#0d1117] border border-gray-700 rounded-lg p-4 space-y-4">
          {/* Maintainer Score */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400 whitespace-nowrap min-w-[100px]">
              {t('filters.maintainerScore')}
            </label>
            <div className="flex gap-1.5">
              {MAINTAINER_GRADES.map(g => (
                <button
                  key={g}
                  onClick={() => toggleGrade(g)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${chipClass(filters.maintainerGrades.includes(g))}`}
                >
                  {tMaintainer(`grade${g}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Stars Range */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400 whitespace-nowrap min-w-[100px]">
              {t('filters.starsRange')}
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {STARS_PRESETS.map(p => (
                <button
                  key={p.label}
                  onClick={() => onFilterChange({ ...filters, minStars: p.value })}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${chipClass(filters.minStars === p.value)}`}
                >
                  {tStarsPreset(p.label)}
                </button>
              ))}
            </div>
          </div>

          {/* Forks Range */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400 whitespace-nowrap min-w-[100px]">
              {t('filters.forksRange')}
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {FORKS_PRESETS.map(p => (
                <button
                  key={p.label}
                  onClick={() => onFilterChange({ ...filters, minForks: p.value })}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${chipClass(filters.minForks === p.value)}`}
                >
                  {tForksPreset(p.label)}
                </button>
              ))}
            </div>
          </div>

          {/* Freshness */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400 whitespace-nowrap min-w-[100px]">
              {t('filters.freshness')}
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {FRESHNESS_PRESETS.map(p => (
                <button
                  key={p.label}
                  onClick={() => onFilterChange({ ...filters, freshness: p.value })}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${chipClass(filters.freshness === p.value)}`}
                >
                  {tFreshnessPreset(p.label)}
                </button>
              ))}
            </div>
          </div>

          {/* Label */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400 whitespace-nowrap min-w-[100px]">
              {t('filters.label')}
            </label>
            <input
              type="text"
              value={filters.label}
              onChange={e => onFilterChange({ ...filters, label: e.target.value })}
              placeholder={t('filters.labelPlaceholder')}
              className="text-sm bg-[#161b22] border border-gray-700 rounded-md px-2.5 py-1 text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 w-48"
            />
          </div>

          {/* Clear All */}
          {hasActiveFilters && (
            <div className="flex justify-end">
              <button
                onClick={clearAll}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                {t('filters.clearAll')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
