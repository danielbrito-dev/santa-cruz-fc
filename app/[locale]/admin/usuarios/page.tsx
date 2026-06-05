import { setRequestLocale, getTranslations } from 'next-intl/server';

export default async function AdminUsuariosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin');

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <h1 className="admin-page-title">{t('users')}</h1>
        <p className="admin-page-sub">{t('soonUsers')}</p>
      </div>
      <div className="admin-placeholder">
        <svg
          viewBox="0 0 24 24"
          width="48"
          height="48"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="admin-placeholder-icon"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <p>{t('soonUsers')}</p>
      </div>
    </div>
  );
}
