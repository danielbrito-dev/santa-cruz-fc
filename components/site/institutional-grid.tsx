import { getTranslations } from 'next-intl/server';
import type { SectionProps } from './types';
import { resolveLocalized } from '@/server/content/localized';
import { PosImg } from './pos-img';

export async function InstitutionalGrid({ content, locale }: SectionProps) {
  const t = await getTranslations('identity');
  const cards = [...content.institutional].sort((a, b) => a.position - b.position);
  return (
    <section className="inst-section">
      <div className="container">
        <div className="section-head">
          <h2 className="section-title">
            {t('heading1')} <em>{t('heading2')}</em>
          </h2>
        </div>
        <div className="inst-grid">
          {cards.map((c) => (
            <a
              key={c.id}
              className={c.size === 'span' ? 'inst-card span-rows' : 'inst-card'}
              href={c.ctaUrl}
            >
              <PosImg src={c.image} alt={resolveLocalized(c.title, locale)} sizes="(max-width: 768px) 100vw, 25vw" />
              <div className="grad" />
              <div className="body">
                <span className="eyebrow">{resolveLocalized(c.eyebrow, locale)}</span>
                <h3>{resolveLocalized(c.title, locale)}</h3>
                <span className="cta">
                  {resolveLocalized(c.ctaLabel, locale)}{' '}
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
