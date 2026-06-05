import { setRequestLocale, getTranslations } from 'next-intl/server';

export default async function AdminMarketingPage({
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
        <h1 className="admin-page-title">{t('marketing')}</h1>
        <p className="admin-page-sub">{t('soon')}</p>
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
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
        <p>{t('soon')}</p>
      </div>
    </div>
  );
}
