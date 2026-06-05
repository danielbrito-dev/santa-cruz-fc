import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { readSiteContent } from '@/server/content/store';
import { NewsList } from '@/components/admin/news-list';

export default async function AdminNoticiasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin');
  const content = await readSiteContent();
  const news = [...content.news].sort((a, b) => a.position - b.position);

  return (
    <div className="admin-page admin-page--wide">
      <div className="admin-page-head admin-news-header">
        <h1 className="admin-page-title">{t('newsTitle')}</h1>
        <Link
          href={`/${locale}/admin/noticias/nova`}
          className="admin-btn admin-btn--primary"
        >
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {t('newsNew')}
        </Link>
      </div>
      <NewsList items={news} locale={locale} />
    </div>
  );
}
