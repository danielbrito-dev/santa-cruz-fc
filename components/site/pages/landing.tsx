import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import type { LandingData } from '@/lib/site-pages';
import { Kicker, Marquee } from './_shared';

export async function Landing({
  sectionKey,
  titleKey,
  data,
}: {
  sectionKey: string;
  titleKey: string;
  locale: Locale;
  data: LandingData;
}) {
  const t = await getTranslations('menu');
  const external = data.ctaHref.startsWith('http');

  return (
    <div className="sc-page page-hero-dark">
      <header className="sc-dhero sc-dhero--ink">
        <span className="sc-dhero-ghost" aria-hidden="true">
          SC
        </span>
        <div className="sc-wrap sc-dhero-inner sc-hero-in">
          <Kicker label={t(sectionKey)} />
          <h1 className="sc-dhero-title">{t(titleKey)}</h1>
          <p className="sc-dhero-lead">{data.lead}</p>
          <a
            className="sc-btn"
            href={data.ctaHref}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {data.ctaLabel} →
          </a>
        </div>
      </header>

      <Marquee />

      <div className="sc-land-blocks">
        <div className="sc-wrap sc-wrap--narrow">
          {data.highlights.map((h, i) => (
            <article className="sc-land-block sc-reveal" key={i}>
              <span className="sc-land-idx">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3>{h.title}</h3>
                <p>{h.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="sc-fill" aria-hidden="true" />
    </div>
  );
}
