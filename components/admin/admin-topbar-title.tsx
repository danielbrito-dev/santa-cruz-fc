'use client';
import { useTranslations } from 'next-intl';
import { usePathname } from '@/lib/i18n/navigation';

/** Maps admin pathname segments → translation keys */
function derivePageKey(pathname: string): string {
  if (/\/admin\/conteudo/.test(pathname)) return 'contentTitle';
  if (/\/admin\/noticias/.test(pathname)) return 'newsTitle';
  if (/\/admin\/usuarios/.test(pathname)) return 'users';
  if (/\/admin\/marketing/.test(pathname)) return 'marketing';
  // dashboard / root
  return 'dashboard';
}

export function AdminTopbarTitle() {
  const t = useTranslations('admin');
  const pathname = usePathname();
  const key = derivePageKey(pathname);
  return (
    <div className="admin-topbar-title">
      <span className="admin-topbar-separator" aria-hidden="true">/</span>
      <span className="admin-topbar-title-text">{t(key as Parameters<typeof t>[0])}</span>
    </div>
  );
}
