'use client';
import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/lib/i18n/navigation';
import { routing } from '@/lib/i18n/routing';

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.addEventListener('keydown', handleKey);
      return () => document.removeEventListener('keydown', handleKey);
    }
  }, [open]);

  function selectLocale(l: string) {
    router.replace(pathname, { locale: l });
    setOpen(false);
  }

  return (
    <div className="header-lang" ref={containerRef}>
      <button
        className="lang-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Idioma: ${locale.toUpperCase()}`}
        onClick={() => setOpen((v) => !v)}
      >
        {locale.toUpperCase()}
        <span className="lang-caret" aria-hidden="true" />
      </button>

      <div
        className={`lang-menu${open ? ' open' : ''}`}
        role="listbox"
        aria-label="Selecionar idioma"
      >
        {routing.locales.map((l) => (
          <button
            key={l}
            role="option"
            aria-current={l === locale ? 'true' : undefined}
            aria-selected={l === locale}
            onClick={() => selectLocale(l)}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
