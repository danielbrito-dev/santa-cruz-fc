import { setRequestLocale, getTranslations } from 'next-intl/server';
import { AdminSoon } from '@/components/admin/admin-soon';

export default async function AdminElencoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin');
  return (
    <AdminSoon
      title={t('elenco')}
      description={t('elencoDesc')}
      icon={
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21v-2a4 4 0 0 1 4-4 4 4 0 0 1 4 4v2" />
          <circle cx="13" cy="7" r="4" />
          <path d="M3 21v-1a3 3 0 0 1 3-3" />
          <circle cx="6" cy="10" r="2" />
        </svg>
      }
    />
  );
}
