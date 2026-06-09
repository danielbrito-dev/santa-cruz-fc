import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import type { GalleryData } from '@/lib/site-pages';

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
    <div className="gallery">
      <header className="gallery-head">
        <div className="container">
          <span className="gallery-eyebrow">{t(sectionKey)}</span>
          <h1 className="gallery-title">{t(titleKey)}</h1>
          <p className="gallery-lead">{data.lead}</p>
        </div>
      </header>

      <div className="gallery-body">
        <div className="container">
          <div className="gallery-grid">
            {data.images.map((im, i) => (
              <figure className="gallery-item" key={i}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={im.src} alt={im.alt} loading="lazy" />
              </figure>
            ))}
          </div>
        </div>
      </div>

      <div className="info-fill" aria-hidden="true" />
    </div>
  );
}
