import { setRequestLocale, getTranslations } from 'next-intl/server';
import { AdminSoon } from '@/components/admin/admin-soon';

export default async function AdminGaleriaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin');
  return (
    <AdminSoon
      title={t('galeria')}
      description={t('galeriaDesc')}
      icon={
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-4.5-4.5L5 21" />
        </svg>
      }
    />
  );
}
