import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import type { ListingData } from '@/lib/site-pages';
import { Kicker } from './_shared';

export async function Listing({
  sectionKey,
  titleKey,
  data,
}: {
  sectionKey: string;
  titleKey: string;
  locale: Locale;
  data: ListingData;
}) {
  const t = await getTranslations('menu');

  return (
    <div className="sc-page">
      <header className="sc-dhero">
        <span className="sc-dhero-ghost" aria-hidden="true">
          {String(data.items.length).padStart(2, '0')}
        </span>
        <div className="sc-wrap sc-dhero-inner sc-hero-in">
          <Kicker label={t(sectionKey)} num={String(data.items.length).padStart(2, '0')} />
          <h1 className="sc-dhero-title">{t(titleKey)}</h1>
          <p className="sc-dhero-lead">{data.lead}</p>
        </div>
      </header>

      <div className="sc-listing">
        <div className="sc-wrap">
          <div className="sc-list-grid">
            {data.items.map((it, i) => (
              <article className="sc-lcard sc-reveal" key={i}>
                {it.tag && <span className="sc-ltag">{it.tag}</span>}
                <h3 className="sc-lcard-title">{it.title}</h3>
                {it.meta && <span className="sc-lcard-meta">{it.meta}</span>}
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="sc-fill" aria-hidden="true" />
    </div>
  );
}
