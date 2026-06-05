'use client';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/lib/i18n/navigation';

const navItems = [
  {
    key: 'dashboard' as const,
    href: '/admin',
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    key: 'content' as const,
    href: '/admin/conteudo',
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    key: 'news' as const,
    href: '/admin/noticias',
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
        <path d="M18 14h-8" />
        <path d="M15 18h-5" />
        <path d="M10 6h8v4h-8V6Z" />
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
