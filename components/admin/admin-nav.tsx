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
    key: 'paginas' as const,
    href: '/admin/paginas',
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 4h11l5 5v11H4Z" />
        <path d="M14 4v6h6M8 14h8M8 18h5" />
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
    key: 'jogos' as const,
    href: '/admin/jogos',
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7l4.5 3.3-1.7 5.3H9.2L7.5 10.3 12 7Z" />
      </svg>
    ),
  },
  {
    key: 'elenco' as const,
    href: '/admin/elenco',
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 21v-2a4 4 0 0 1 8 0v2" />
        <circle cx="13" cy="7" r="4" />
        <path d="M3 21v-1a3 3 0 0 1 3-3" />
        <circle cx="6" cy="10" r="2" />
      </svg>
    ),
  },
  {
    key: 'patrocinadores' as const,
    href: '/admin/patrocinadores',
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.6 7.4 13 15l-3-3 7.6-7.6a2 2 0 0 1 2.8 0l.2.2a2 2 0 0 1 0 2.8Z" />
        <path d="M3 21l6-6M3 21v-4h4" />
        <circle cx="6.5" cy="6.5" r="2" />
      </svg>
    ),
  },
  {
    key: 'galeria' as const,
    href: '/admin/galeria',
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-4.5-4.5L5 21" />
      </svg>
    ),
  },
  {
    key: 'documentos' as const,
    href: '/admin/documentos',
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
        <path d="M14 3v5h5M9 13h6M9 17h6" />
      </svg>
    ),
  },
  {
    key: 'historias' as const,
    href: '/admin/historias',
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <path d="M8 9h8M8 13h5" />
      </svg>
    ),
  },
  {
    key: 'mensagens' as const,
    href: '/admin/mensagens',
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-10 6L2 7" />
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
