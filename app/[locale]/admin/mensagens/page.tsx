import { setRequestLocale } from 'next-intl/server';
import { listFormSubmissions } from '@/server/content/form-store';
import { MensagensAdmin } from '@/components/admin/mensagens-admin';

export const dynamic = 'force-dynamic';

export default async function AdminMensagensPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const submissions = await listFormSubmissions();
  return <MensagensAdmin submissions={submissions} />;
}
