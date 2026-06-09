import { setRequestLocale } from 'next-intl/server';
import { readSquadFile } from '@/server/squad/store';
import { ElencoAdmin } from '@/components/admin/elenco-admin';

export default async function AdminElencoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const squad = await readSquadFile();
  return <ElencoAdmin players={squad.players} staff={squad.staff} />;
}
