import { setRequestLocale, getTranslations } from 'next-intl/server';
import { AdminSoon } from '@/components/admin/admin-soon';

export default async function AdminPaginasPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin');
  return (
    <AdminSoon
      title={t('paginas')}
      description={t('paginasDesc')}
      icon={
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h11l5 5v11a0 0 0 0 1 0 0H4a0 0 0 0 1 0 0V4Z" />
          <path d="M14 4v6h6M8 14h8M8 18h5" />
        </svg>
      }
    />
  );
}
