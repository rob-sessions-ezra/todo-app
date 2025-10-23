import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const cls = document.documentElement.classList;
    if (isDark) {
      cls.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      cls.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      type="button"
      onClick={() => setIsDark(v => !v)}
      className="inline-flex items-center gap-2 rounded-md border border-gray-300 dark:border-slate-600 px-3 py-1.5 text-sm
                 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700"
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
    >
      {isDark ? (
        <>
          <svg className="h-4 w-4 text-yellow-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
        </>
      ) : (
        <>
          <svg className="h-4 w-4 text-yellow-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M6.76 4.84l-1.8-1.79L3.17 4.84l1.79 1.8 1.8-1.8zM1 13h3v-2H1v2zm10-9h2V1h-2v3zm7.07 2.21l1.79-1.8-1.79-1.79-1.8 1.79 1.8 1.8zM20 11v2h3v-2h-3zM6.76 19.16l-1.8 1.8 1.8 1.79 1.79-1.79-1.79-1.8zM11 20h2v3h-2v-3zm7.07-2.21l1.8 1.8 1.79-1.8-1.79-1.79-1.8 1.79z" />
          </svg>
        </>
      )}
    </button>
  );
}
