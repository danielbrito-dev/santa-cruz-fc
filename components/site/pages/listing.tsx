import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import type { ListingData } from '@/lib/site-pages';

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
    <div className="listing">
      <header className="listing-head">
        <div className="container listing-head-inner">
          <div>
            <nav className="info-breadcrumb" aria-label="breadcrumb">
              <span>{t(sectionKey)}</span>
              <span className="info-breadcrumb-sep">/</span>
              <span className="info-breadcrumb-current">{t(titleKey)}</span>
            </nav>
            <h1 className="listing-title">{t(titleKey)}</h1>
            <p className="listing-lead">{data.lead}</p>
          </div>
          <span className="listing-count">{data.items.length}</span>
        </div>
      </header>

      <div className="listing-body">
        <div className="container">
          <div className="listing-grid">
            {data.items.map((it, i) => (
              <article className="listing-card" key={i}>
                {it.tag && <span className="listing-tag">{it.tag}</span>}
                <h3 className="listing-card-title">{it.title}</h3>
                {it.meta && <span className="listing-meta">{it.meta}</span>}
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="info-fill" aria-hidden="true" />
    </div>
  );
}
