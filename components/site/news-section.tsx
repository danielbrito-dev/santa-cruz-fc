import { getTranslations, getFormatter } from 'next-intl/server';
import type { SectionProps } from './types';
import { resolveLocalized } from '@/server/content/localized';
import { PosImg } from './pos-img';

export async function NewsSection({ content, locale }: SectionProps) {
  const t = await getTranslations('news');
  const tCommon = await getTranslations('common');
  const format = await getFormatter();

  const published = content.news.filter((n) => n.status === 'published');
  const featured = published.find((n) => n.featured);
  const grid = published
    .filter((n) => !n.featured)
    .sort((a, b) => a.position - b.position);

  const featuredDate = featured
    ? format.dateTime(new Date(featured.publishedAt), {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <section className="news-section" id="noticias">
      <div className="container">
        <div className="section-head">
          <h2 className="section-title">
            {t('heading1')} <em>{t('heading2')}</em>
          </h2>
          <a href="/noticias" className="section-link">
            {tCommon('allNews')}
            {' '}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        <div className="news-grid">
          {featured && (
            <a href={`/noticias/${featured.slug}`} className="news-feature">
              <div className="img-wrap">
                <PosImg
                  src={featured.coverImage}
                  alt={resolveLocalized(featured.title, locale)}
                />
              </div>
              <div className="meta">
                <span className="tag">{resolveLocalized(featured.tag, locale)}</span>
                <h3>{resolveLocalized(featured.title, locale)}</h3>
                <span className="date">{featuredDate}</span>
              </div>
            </a>
          )}

          <div className="news-list">
            {grid.map((item) => (
              <a key={item.id} href={`/noticias/${item.slug}`} className="news-item">
                <div className="thumb">
                  <PosImg
                    src={item.coverImage}
                    alt={resolveLocalized(item.title, locale)}
                  />
                </div>
                <div className="body">
                  <span className="tag">{resolveLocalized(item.tag, locale)}</span>
                  <h4>{resolveLocalized(item.title, locale)}</h4>
                  {item.photoCount > 0 && (
                    <span className="photo-count">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <rect x="3" y="6" width="18" height="14" rx="2" />
                        <circle cx="12" cy="13" r="3" />
                      </svg>
                      {t('photos', { count: item.photoCount })}
                    </span>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
