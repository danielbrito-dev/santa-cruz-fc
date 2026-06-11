import type { SectionProps } from './types';
import { resolveLocalized } from '@/server/content/localized';
import { PosImg } from './pos-img';

/** Classifica a URL do banner num id de CTA legível para o analytics. */
function ctaId(url: string): string {
  const u = url.toLowerCase();
  if (/socio/.test(u)) return 'sejaSocio';
  if (/ingress|futebolcard|ticket/.test(u)) return 'ingressos';
  if (/loja|shop|store/.test(u)) return 'lojas';
  return 'banner';
}

export function BannerStrip({ content, locale }: SectionProps) {
  const banners = [...content.banners].sort((a, b) => a.position - b.position);
  return (
    <section className="banner-strip">
      <div className="container">
        <div className="banner-grid">
          {banners.map((b) => (
            <a
              key={b.id}
              className="banner-card"
              href={b.ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-cta={ctaId(b.ctaUrl)}
              data-cta-label={resolveLocalized(b.ctaLabel, locale) || resolveLocalized(b.title, locale)}
            >
              <PosImg src={b.image} alt={resolveLocalized(b.title, locale)} sizes="(max-width: 768px) 100vw, 33vw" />
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
