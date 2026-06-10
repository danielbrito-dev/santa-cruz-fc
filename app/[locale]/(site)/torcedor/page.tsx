import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import { SiteShell } from '@/components/site/site-shell';

export const revalidate = 60;

export default async function TorcedorPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('fan');
  const features = ['sorteios', 'censo', 'sugestoes', 'area'] as const;

  return (
    <SiteShell locale={locale}>
      <section className="fan-area">
        <div className="container">
          <span className="fan-kicker">{t('kicker')}</span>
          <h1 className="fan-title">{t('title')}</h1>
          <p className="fan-lead">{t('lead')}</p>
          <ul className="fan-grid">
            {features.map((f) => (
              <li key={f} className="fan-card">
                <h3>{t(`f_${f}_title`)}</h3>
                <p>{t(`f_${f}_desc`)}</p>
              </li>
            ))}
          </ul>
          <p className="fan-soon">{t('soon')}</p>
        </div>
      </section>
    </SiteShell>
  );
}
