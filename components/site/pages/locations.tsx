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
      <header className="info-hero">
        <div className="container info-hero-inner">
          <nav className="info-breadcrumb" aria-label="breadcrumb">
            <span>{t(sectionKey)}</span>
            <span className="info-breadcrumb-sep">/</span>
            <span className="info-breadcrumb-current">{t(titleKey)}</span>
          </nav>
          <h1 className="info-title">{t(titleKey)}</h1>
          <p className="info-lead">{data.lead}</p>
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
