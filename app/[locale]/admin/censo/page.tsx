import { setRequestLocale } from 'next-intl/server';
import { aggregateCensus } from '@/server/content/census-store';
import { CensoAdmin } from '@/components/admin/censo-admin';

export const dynamic = 'force-dynamic';

export default async function AdminCensoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const agg = await aggregateCensus();
  return <CensoAdmin agg={agg} />;
}
