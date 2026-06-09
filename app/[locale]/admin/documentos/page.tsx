import { setRequestLocale } from 'next-intl/server';
import { readSiteContent } from '@/server/content/store';
import { DocumentosAdmin } from '@/components/admin/documentos-admin';

export default async function AdminDocumentosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = await readSiteContent();
  return <DocumentosAdmin documents={content.documents ?? []} />;
}
