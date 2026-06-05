import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin');

  const modules = [
    {
      key: 'marketing',
      href: `/${locale}/admin/marketing` as const,
      label: t('marketing'),
      desc: t('soon'),
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      ),
    },
    {
      key: 'users',
      href: `/${locale}/admin/usuarios` as const,
      label: t('users'),
      desc: t('soonUsers'),
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
  ] as const;

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <h1 className="admin-page-title">{t('welcome')}</h1>
        <p className="admin-page-sub">{t('welcomeSub')}</p>
      </div>

      <div className="admin-cards-grid">
        {modules.map(({ key, href, label, desc, icon }) => (
          <Link key={key} href={href} className="admin-card">
            <div className="admin-card-icon">{icon}</div>
            <div className="admin-card-body">
              <h2 className="admin-card-title">{label}</h2>
              <p className="admin-card-desc">{desc}</p>
            </div>
            <span className="admin-card-badge">{t('comingSoon')}</span>
            <svg
              className="admin-card-arrow"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
