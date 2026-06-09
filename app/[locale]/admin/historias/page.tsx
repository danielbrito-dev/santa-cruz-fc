import { setRequestLocale } from 'next-intl/server';
import { readSiteContent } from '@/server/content/store';
import { HistoriasAdmin } from '@/components/admin/historias-admin';

export default async function AdminHistoriasPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = await readSiteContent();
  return <HistoriasAdmin stories={content.stories ?? []} />;
}
