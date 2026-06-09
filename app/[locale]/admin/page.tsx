import { setRequestLocale, getTranslations } from 'next-intl/server';
import { getAnalyticsSummary } from '@/server/analytics/source';
import { AdminAnalytics } from '@/components/admin/admin-analytics';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin');
  const summary = await getAnalyticsSummary();

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <h1 className="admin-page-title">{t('welcome')}</h1>
        <p className="admin-page-sub">{t('scopeNote')}</p>
      </div>

      <AdminAnalytics summary={summary} />
    </div>
  );
}
