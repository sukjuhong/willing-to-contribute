'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';

export default function Navigation() {
  const pathname = usePathname();
  const tTabs = useTranslations('tabs');

  const tabs = [
    { name: 'issues' as const, path: '/issues' as const },
    { name: 'repositories' as const, path: '/repositories' as const },
    { name: 'settings' as const, path: '/settings' as const },
  ];

  return (
    <div className="mb-6">
      <div className="sm:hidden">
        <select
          value={pathname}
          onChange={e => {
            window.location.href = e.target.value;
          }}
          className="block w-full rounded-md bg-[#161b22] border border-gray-700 text-gray-100"
        >
          {tabs.map(tab => (
            <option key={tab.path} value={tab.path}>
              {tTabs(tab.name)}
            </option>
          ))}
        </select>
      </div>

      <div className="hidden sm:block">
        <nav className="flex space-x-4" aria-label="Tabs">
          {tabs.map(tab => (
            <Link
              key={tab.path}
              href={tab.path}
              className={`${
                pathname === tab.path
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-[family-name:var(--font-mono)]'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              } px-3 py-2 font-medium text-sm rounded-md transition-colors`}
              aria-current={pathname === tab.path ? 'page' : undefined}
            >
              {tTabs(tab.name)}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
