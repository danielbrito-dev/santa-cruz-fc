import { setRequestLocale, getTranslations } from 'next-intl/server';
import { AdminSoon } from '@/components/admin/admin-soon';

export default async function AdminPatrocinadoresPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin');
  return (
    <AdminSoon
      title={t('patrocinadores')}
      description={t('patrocinadoresDesc')}
      icon={
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.6 7.4 13 15l-3-3 7.6-7.6a2 2 0 0 1 2.8 0l.2.2a2 2 0 0 1 0 2.8Z" />
          <path d="M3 21l6-6M3 21v-4h4" />
          <circle cx="6.5" cy="6.5" r="2.5" />
        </svg>
      }
    />
  );
}
