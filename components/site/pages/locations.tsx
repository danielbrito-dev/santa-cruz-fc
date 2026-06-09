import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import type { LocationsData } from '@/lib/site-pages';

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
    <div className="info">
      <header className="loc-head">
        <div className="container">
          <span className="loc-eyebrow">◉ {t(sectionKey)}</span>
          <h1 className="loc-title">{t(titleKey)}</h1>
          <p className="loc-lead">{data.lead}</p>
        </div>
      </header>

      <div className="info-main">
        <div className="container">
          {data.groups.map((g, i) => (
            <section className="loc-group" key={i}>
              <h2 className="loc-region">{g.region}</h2>
              <div className="loc-grid">
                {g.places.map((pl, j) => (
                  <article className="loc-card" key={j}>
                    <h3 className="loc-name">{pl.name}</h3>
                    <p className="loc-addr">{pl.address}</p>
                    <span className="loc-city">{pl.city}</span>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <div className="info-fill" aria-hidden="true" />
    </div>
  );
}
