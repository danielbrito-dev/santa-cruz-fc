import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { readSiteContent } from '@/server/content/store';

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin');

  // Read published news count server-side for the stat tile
  let publishedCount = 0;
  try {
    const content = await readSiteContent();
    publishedCount = content.news.filter((n) => n.status === 'published').length;
  } catch {
    publishedCount = 0;
  }

  return (
    <div className="admin-page">
      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="admin-page-head">
        <h1 className="admin-page-title">{t('welcome')}</h1>
        <p className="admin-page-sub">{t('welcomeSub')}</p>
      </div>

      {/* ── Module tiles ────────────────────────────────────────────── */}
      <div className="admin-cards-grid">

        {/* News tile — active, has stat */}
        <Link href={`/${locale}/admin/noticias`} className="admin-card admin-card--active">
          <div className="admin-card-icon">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
              <path d="M18 14h-8" />
              <path d="M15 18h-5" />
              <path d="M10 6h8v4h-8V6Z" />
            </svg>
          </div>
          <div className="admin-card-body">
            <h2 className="admin-card-title">{t('newsTitle')}</h2>
            <p className="admin-card-desc">{t('newsDesc')}</p>
          </div>
          <div className="admin-card-footer">
            <span className="admin-badge admin-badge--stat">
              {t('publishedNews', { count: publishedCount })}
            </span>
            <span className="admin-btn admin-btn--primary admin-btn--sm">
              {t('newsAction')}
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </Link>

        {/* Content tile — active */}
        <Link href={`/${locale}/admin/conteudo`} className="admin-card admin-card--active">
          <div className="admin-card-icon">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div className="admin-card-body">
            <h2 className="admin-card-title">{t('contentTitle')}</h2>
            <p className="admin-card-desc">{t('contentDesc')}</p>
          </div>
          <div className="admin-card-footer">
            <span className="admin-btn admin-btn--primary admin-btn--sm">
              {t('contentAction')}
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </Link>

        {/* Users tile — muted / coming soon */}
        <div className="admin-card admin-card--muted">
          <div className="admin-card-icon">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="admin-card-body">
            <h2 className="admin-card-title">{t('users')}</h2>
            <p className="admin-card-desc">{t('usersDesc')}</p>
          </div>
          <div className="admin-card-footer">
            <span className="admin-badge admin-badge--soon">{t('comingSoon')}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
