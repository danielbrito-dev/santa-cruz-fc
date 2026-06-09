import type { ReactNode } from 'react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { readSiteContent } from '@/server/content/store';

const S = {
  width: 22,
  height: 22,
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

const ARROW = (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

export default async function AdminDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin');

  let publishedCount = 0;
  try {
    const content = await readSiteContent();
    publishedCount = content.news.filter((n) => n.status === 'published').length;
  } catch {
    publishedCount = 0;
  }

  interface Tile {
    title: string;
    desc: string;
    href: string;
    icon: ReactNode;
    active?: boolean; // módulo já funcional (CRUD real)
    action?: string; // rótulo do botão (módulos ativos)
    stat?: string; // badge de estatística
  }

  const tiles: Tile[] = [
    {
      title: t('contentTitle'), desc: t('contentDesc'), href: `/${locale}/admin/conteudo`, active: true, action: t('contentAction'),
      icon: <svg viewBox="0 0 24 24" {...S}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
    },
    {
      title: t('paginas'), desc: t('paginasDesc'), href: `/${locale}/admin/paginas`,
      icon: <svg viewBox="0 0 24 24" {...S}><path d="M4 4h11l5 5v11H4Z" /><path d="M14 4v6h6M8 14h8M8 18h5" /></svg>,
    },
    {
      title: t('newsTitle'), desc: t('newsDesc'), href: `/${locale}/admin/noticias`, active: true, action: t('newsAction'), stat: t('publishedNews', { count: publishedCount }),
      icon: <svg viewBox="0 0 24 24" {...S}><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" /><path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6Z" /></svg>,
    },
    {
      title: t('jogos'), desc: t('jogosSub'), href: `/${locale}/admin/jogos`, active: true, action: t('manage'),
      icon: <svg viewBox="0 0 24 24" {...S}><circle cx="12" cy="12" r="9" /><path d="M12 7l4.5 3.3-1.7 5.3H9.2L7.5 10.3 12 7Z" /></svg>,
    },
    {
      title: t('elenco'), desc: t('elencoDesc'), href: `/${locale}/admin/elenco`, active: true, action: t('manage'),
      icon: <svg viewBox="0 0 24 24" {...S}><path d="M9 21v-2a4 4 0 0 1 8 0v2" /><circle cx="13" cy="7" r="4" /><path d="M3 21v-1a3 3 0 0 1 3-3" /><circle cx="6" cy="10" r="2" /></svg>,
    },
    {
      title: t('patrocinadores'), desc: t('patrocinadoresDesc'), href: `/${locale}/admin/patrocinadores`, active: true, action: t('manage'),
      icon: <svg viewBox="0 0 24 24" {...S}><path d="M20.6 7.4 13 15l-3-3 7.6-7.6a2 2 0 0 1 2.8 0l.2.2a2 2 0 0 1 0 2.8Z" /><path d="M3 21l6-6M3 21v-4h4" /><circle cx="6.5" cy="6.5" r="2" /></svg>,
    },
    {
      title: t('galeria'), desc: t('galeriaDesc'), href: `/${locale}/admin/galeria`,
      icon: <svg viewBox="0 0 24 24" {...S}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-4.5-4.5L5 21" /></svg>,
    },
    {
      title: t('documentos'), desc: t('documentosDesc'), href: `/${locale}/admin/documentos`,
      icon: <svg viewBox="0 0 24 24" {...S}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></svg>,
    },
    {
      title: t('historias'), desc: t('historiasDesc'), href: `/${locale}/admin/historias`,
      icon: <svg viewBox="0 0 24 24" {...S}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /><path d="M8 9h8M8 13h5" /></svg>,
    },
    {
      title: t('users'), desc: t('usersDesc'), href: `/${locale}/admin/usuarios`,
      icon: <svg viewBox="0 0 24 24" {...S}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <h1 className="admin-page-title">{t('welcome')}</h1>
        <p className="admin-page-sub">{t('scopeNote')}</p>
      </div>

      <div className="admin-cards-grid">
        {tiles.map((tile, i) => (
          <Link key={i} href={tile.href} className="admin-card admin-card--active">
            <div className="admin-card-icon">{tile.icon}</div>
            <div className="admin-card-body">
              <h2 className="admin-card-title">{tile.title}</h2>
              <p className="admin-card-desc">{tile.desc}</p>
            </div>
            <div className="admin-card-footer">
              {tile.stat && <span className="admin-badge admin-badge--stat">{tile.stat}</span>}
              {tile.active ? (
                <span className="admin-btn admin-btn--primary admin-btn--sm">
                  {tile.action}
                  {ARROW}
                </span>
              ) : (
                <span className="admin-badge admin-badge--soon">{t('comingSoon')}</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
