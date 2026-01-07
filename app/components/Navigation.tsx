'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '../hooks/useTranslation';

export default function Navigation() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const tabs = [
    { name: 'issues', path: '/issues' },
    { name: 'repositories', path: '/repositories' },
    { name: 'settings', path: '/settings' },
  ];

  return (
    <div className="mb-6">
      <div className="sm:hidden">
        <select
          value={pathname}
          onChange={e => {
            window.location.href = e.target.value;
          }}
          className="block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          {tabs.map(tab => (
            <option key={tab.path} value={tab.path}>
              {t(`tabs.${tab.name}`)}
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
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-100'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              } px-3 py-2 font-medium text-sm rounded-md`}
              aria-current={pathname === tab.path ? 'page' : undefined}
            >
              {t(`tabs.${tab.name}`)}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
