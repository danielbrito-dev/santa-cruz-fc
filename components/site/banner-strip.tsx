import type { SectionProps } from './types';
import { resolveLocalized } from '@/server/content/localized';

export function BannerStrip({ content, locale }: SectionProps) {
  const banners = [...content.banners].sort((a, b) => a.position - b.position);
  return (
    <section className="banner-strip">
      <div className="container">
        <div className="banner-grid">
          {banners.map((b) => (
            <a key={b.id} className="banner-card" href={b.ctaUrl} target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.image} alt={resolveLocalized(b.title, locale)} />
              <div className="grad" />
              <div className="body">
                <span className="eyebrow">{resolveLocalized(b.eyebrow, locale)}</span>
                <h3>{resolveLocalized(b.title, locale)}</h3>
                <span className="cta">
                  {resolveLocalized(b.ctaLabel, locale)}{' '}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
