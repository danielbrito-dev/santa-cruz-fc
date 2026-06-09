import { setRequestLocale, getTranslations } from 'next-intl/server';
import { AdminSoon } from '@/components/admin/admin-soon';

export default async function AdminHistoriasPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin');
  return (
    <AdminSoon
      title={t('historias')}
      description={t('historiasDesc')}
      icon={
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <path d="M8 9h8M8 13h5" />
        </svg>
      }
    />
  );
}
