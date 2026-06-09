import { setRequestLocale } from 'next-intl/server';
import { readSiteContent } from '@/server/content/store';
import { PatrocinadoresAdmin } from '@/components/admin/patrocinadores-admin';

export default async function AdminPatrocinadoresPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = await readSiteContent();
  return <PatrocinadoresAdmin sponsors={content.sponsors} />;
}
