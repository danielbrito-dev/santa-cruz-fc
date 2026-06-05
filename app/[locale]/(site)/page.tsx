import { setRequestLocale } from 'next-intl/server';
import { getServerApi } from '@/lib/trpc/server';
import type { Locale } from '@/lib/i18n/routing';
import { Header } from '@/components/site/header';
import { SvgFilters } from '@/components/site/svg-filters';
import { Hero } from '@/components/site/hero';
import { MatchCalendar } from '@/components/site/match-calendar';
import { NewsSection } from '@/components/site/news-section';
import { BannerStrip } from '@/components/site/banner-strip';
import { InstitutionalGrid } from '@/components/site/institutional-grid';

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const api = await getServerApi();
  const content = await api.content.site();
  return (
    <>
      <Header />
      <SvgFilters />
      <main>
        <section className="hero" id="calendario">
          <Hero content={content} locale={locale} />
          <MatchCalendar content={content} locale={locale} />
        </section>
        <NewsSection content={content} locale={locale} />
        <BannerStrip content={content} locale={locale} />
        <InstitutionalGrid content={content} locale={locale} />
      </main>
    </>
  );
}
