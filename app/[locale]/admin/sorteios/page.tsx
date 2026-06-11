import { setRequestLocale } from 'next-intl/server';
import { listDraws } from '@/server/content/draw-store';
import { SorteiosAdmin } from '@/components/admin/sorteios-admin';

export const dynamic = 'force-dynamic';

export default async function AdminSorteiosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const draws = await listDraws();
  return <SorteiosAdmin draws={draws} />;
}
