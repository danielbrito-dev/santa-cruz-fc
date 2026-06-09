import { setRequestLocale, getTranslations } from 'next-intl/server';
import { readSiteContent } from '@/server/content/store';
import type { NewsItem } from '@/server/content/types';
import { AdminAnalytics } from '@/components/admin/admin-analytics';

export default async function AdminDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin');

  let news: NewsItem[] = [];
  try {
    const content = await readSiteContent();
    news = content.news;
  } catch {
    news = [];
  }

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <h1 className="admin-page-title">{t('welcome')}</h1>
        <p className="admin-page-sub">{t('scopeNote')}</p>
      </div>

      <AdminAnalytics news={news} />
    </div>
  );
}
