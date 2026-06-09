import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import type { GalleryData } from '@/lib/site-pages';
import { Kicker } from './_shared';

export async function Gallery({
  sectionKey,
  titleKey,
  data,
}: {
  sectionKey: string;
  titleKey: string;
  locale: Locale;
  data: GalleryData;
}) {
  const t = await getTranslations('menu');

  return (
    <div className="sc-page" data-section={sectionKey}>
      <header className="sc-dhero sc-dhero--doc">
        <div className="sc-wrap sc-dhero-inner sc-hero-in">
          <Kicker label={t(sectionKey)} />
          <h1 className="sc-dhero-title">{t(titleKey)}</h1>
          <p className="sc-dhero-lead">{data.lead}</p>
        </div>
      </header>

      <div className="sc-gallery">
        <div className="sc-wrap">
          <div className="sc-gallery-grid">
            {data.images.map((im, i) => (
              <figure className="sc-gitem" key={i}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={im.src} alt={im.alt} loading="lazy" />
                <figcaption>{im.alt}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>

      <div className="sc-fill" aria-hidden="true" />
    </div>
  );
}
