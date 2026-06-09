import { setRequestLocale } from 'next-intl/server';
import { readSiteContent } from '@/server/content/store';
import { GaleriaAdmin } from '@/components/admin/galeria-admin';

export default async function AdminGaleriaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = await readSiteContent();
  return <GaleriaAdmin images={content.gallery ?? []} />;
}
