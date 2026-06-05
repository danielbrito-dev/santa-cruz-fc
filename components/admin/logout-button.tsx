'use client';
import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { logout } from '@/server/auth/actions';

export function LogoutButton() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const [pending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await logout(locale);
    });
  }

  return (
    <form action={handleLogout}>
      <button
        type="submit"
        className="admin-logout-btn"
        disabled={pending}
        aria-label={t('logout')}
      >
        <svg
          viewBox="0 0 24 24"
          width="15"
          height="15"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        <span>{pending ? '…' : t('logout')}</span>
      </button>
    </form>
  );
}
