import { setRequestLocale } from 'next-intl/server';
import { getServerApi } from '@/lib/trpc/server';
import type { Locale } from '@/lib/i18n/routing';

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const api = await getServerApi();
  const content = await api.content.site();
  return <main data-testid="home" data-matches={content.matches.length} />;
}
