'use client';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/lib/i18n/navigation';

const navItems = [
  {
    key: 'dashboard' as const,
    href: '/admin',
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    key: 'marketing' as const,
    href: '/admin/marketing',
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    key: 'users' as const,
    href: '/admin/usuarios',
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

export function AdminNav() {
  const t = useTranslations('admin');
  const pathname = usePathname();

  function isActive(href: string) {
    // Exact match for dashboard; prefix match for sub-routes
    if (href === '/admin') {
      return pathname === '/admin' || pathname.endsWith('/admin');
    }
    return pathname.endsWith(href) || pathname.includes(href + '/');
  }

  return (
    <nav className="admin-nav" aria-label={t('title')}>
      {navItems.map(({ key, href, icon }) => (
        <Link
          key={key}
          href={href}
          className={`admin-nav-link${isActive(href) ? ' active' : ''}`}
          aria-current={isActive(href) ? 'page' : undefined}
        >
          <span className="admin-nav-icon">{icon}</span>
          <span className="admin-nav-label">{t(key)}</span>
        </Link>
      ))}
    </nav>
  );
}
