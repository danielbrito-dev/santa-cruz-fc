import { setRequestLocale, getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import type { Locale } from '@/lib/i18n/routing';
import { SiteShell } from '@/components/site/site-shell';
import { Kicker } from '@/components/site/pages/_shared';
import { CensoForm } from '@/components/site/censo-form';
import { getFanUser } from '@/server/auth/fan';
import { getCensusByFan } from '@/server/content/census-store';

export const dynamic = 'force-dynamic';

export default async function CensoPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const fan = await getFanUser();
  if (!fan) redirect(`/${locale}/torcedor/entrar?next=${encodeURIComponent('/viva-o-santa/censo')}`);

  const menu = await getTranslations('menu');
  const t = await getTranslations('fanCensus');
  const initial = await getCensusByFan(fan.id);

  return (
    <SiteShell locale={locale}>
      <div className="sc-page" data-section="vivaSanta">
        <header className="sc-dhero sc-dhero--doc">
          <span className="sc-dhero-ghost" aria-hidden="true">#</span>
          <div className="sc-wrap sc-dhero-inner sc-hero-in">
            <Kicker label={menu('vivaSanta')} />
            <h1 className="sc-dhero-title">{t('title')}</h1>
          </div>
        </header>

        <section className="cns-section">
          <div className="sc-wrap sc-wrap--narrow">
            <p className="cns-lead">{t('lead', { name: fan.name.split(' ')[0] })}</p>
            <CensoForm initial={initial} />
          </div>
        </section>

        <div className="sc-fill" aria-hidden="true" />
      </div>
    </SiteShell>
  );
}
