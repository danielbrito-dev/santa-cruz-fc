'use client';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/lib/i18n/navigation';
import { routing } from '@/lib/i18n/routing';

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  return (
    <div className="header-lang">
      {routing.locales.map((l) => (
        <a
          key={l}
          className={l === locale ? 'active' : ''}
          onClick={() => router.replace(pathname, { locale: l })}
          style={{ cursor: 'pointer' }}
        >
          {l.toUpperCase()}
        </a>
      ))}
    </div>
  );
}
