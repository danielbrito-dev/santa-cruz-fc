import { setRequestLocale } from 'next-intl/server';
import { getServerApi } from '@/lib/trpc/server';
import type { Locale } from '@/lib/i18n/routing';
import { Header } from '@/components/site/header';
import { Footer } from '@/components/site/footer';
import { FooterParallax } from '@/components/site/footer.client';
import { SquadPage } from '@/components/site/squad-page';
import { getSquad, groupPlayers } from '@/server/squad/squad';

export default async function ElencoRoute({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const api = await getServerApi();
  const content = await api.content.site();
  const squad = getSquad();
  const groups = groupPlayers(squad.players);

  return (
    <>
      <Header />
      <main>
        <SquadPage squad={squad} groups={groups} locale={locale} />
      </main>
      <Footer content={content} locale={locale} />
      <FooterParallax />
    </>
  );
}
