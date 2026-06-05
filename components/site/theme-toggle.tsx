'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { THEME_STORAGE_KEY, type Theme } from '@/lib/theme';

export function ThemeToggle() {
  const t = useTranslations('a11y');
  const [theme, setTheme] = useState<Theme | null>(null); // null until mounted (avoids hydration mismatch)

  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    setTheme(current === 'dark' ? 'dark' : 'light');
  }, []);

  function toggle() {
    if (theme === null) return; // ignore clicks before the mount effect resolves the theme
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(THEME_STORAGE_KEY, next); } catch {}
    setTheme(next);
  }

  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={t('toggleTheme')}
      aria-pressed={theme === null ? undefined : isDark}
      title={t('toggleTheme')}
    >
      {theme === null ? (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/></svg>
      ) : isDark ? (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"/></svg>
      ) : (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
      )}
    </button>
  );
}
