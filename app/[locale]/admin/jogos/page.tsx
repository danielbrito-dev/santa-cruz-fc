import { setRequestLocale } from 'next-intl/server';
import { readSiteContent } from '@/server/content/store';
import { JogosAdmin } from '@/components/admin/jogos-admin';

export default async function AdminJogosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = await readSiteContent();
  return <JogosAdmin matches={content.matches} clubs={content.clubs ?? []} />;
}
