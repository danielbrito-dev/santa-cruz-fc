import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import type { LocationsData } from '@/lib/site-pages';
import { Kicker } from './_shared';

export async function Locations({
  sectionKey,
  titleKey,
  data,
}: {
  sectionKey: string;
  titleKey: string;
  locale: Locale;
  data: LocationsData;
}) {
  const t = await getTranslations('menu');

  return (
    <div className="sc-page" data-section={sectionKey}>
      <header className="sc-dhero">
        <span className="sc-dhero-ghost" aria-hidden="true">
          ◉
        </span>
        <div className="sc-wrap sc-dhero-inner sc-hero-in">
          <Kicker label={t(sectionKey)} />
          <h1 className="sc-dhero-title">{t(titleKey)}</h1>
          <p className="sc-dhero-lead">{data.lead}</p>
        </div>
      </header>

      <div className="sc-loc">
        <div className="sc-wrap">
          {data.groups.map((g, i) => (
            <section className="sc-loc-group" key={i}>
              <h2 className="sc-loc-region">{g.region}</h2>
              <div className="sc-loc-grid">
                {g.places.map((pl, j) => (
                  <article className="sc-loc-card sc-reveal" key={j}>
                    <h3 className="sc-loc-name">{pl.name}</h3>
                    <p className="sc-loc-addr">{pl.address}</p>
                    <span className="sc-loc-city">{pl.city}</span>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <div className="sc-fill" aria-hidden="true" />
    </div>
  );
}
