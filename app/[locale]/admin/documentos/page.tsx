import { setRequestLocale, getTranslations } from 'next-intl/server';
import { AdminSoon } from '@/components/admin/admin-soon';

export default async function AdminDocumentosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin');
  return (
    <AdminSoon
      title={t('documentos')}
      description={t('documentosDesc')}
      icon={
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 3v5h5M9 13h6M9 17h6" />
        </svg>
      }
    />
  );
}
