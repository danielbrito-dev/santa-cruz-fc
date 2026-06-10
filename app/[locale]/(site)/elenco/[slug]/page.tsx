import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getServerApi } from '@/lib/trpc/server';
import { routing, type Locale } from '@/lib/i18n/routing';
import { Header } from '@/components/site/header';
import { Footer } from '@/components/site/footer';
import { FooterParallax } from '@/components/site/footer.client';
import { AthletePage } from '@/components/site/athlete-page';
import { getSquad, getPlayerBySlug, slugifyName } from '@/server/squad/squad';

export const revalidate = 60;

export function generateStaticParams() {
  const players = getSquad().players;
  return routing.locales.flatMap((locale) =>
    players.map((p) => ({ locale, slug: slugifyName(p.name) })),
  );
}

export default async function AthleteRoute({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const player = getPlayerBySlug(slug);
  if (!player) notFound();

  const api = await getServerApi();
  const content = await api.content.site();

  return (
    <>
      <Header />
      <main>
        <AthletePage player={player} locale={locale} />
      </main>
      <Footer content={content} locale={locale} />
      <FooterParallax />
    </>
  );
}
