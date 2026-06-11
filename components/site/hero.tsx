import { getTranslations } from 'next-intl/server';
import type { SectionProps } from './types';
import { resolveLocalized } from '@/server/content/localized';
import { PosImg } from './pos-img';

export async function Hero({ content, locale }: SectionProps) {
  const a11y = await getTranslations('a11y');
  const { hero } = content;
  // NOTE: layout 10 emphasizes specific words in red via <em>; that needs a content-model emphasis field (deferred). Lines render plain for now.
  return (
    <div className="hero-stage">
      <PosImg
        className="hero-backdrop"
        src={hero.backdrop}
        alt={a11y('heroBackdrop')}
        sizes="100vw"
        priority
      />
      <div className="hero-grad" />
      <div className="hero-grain" />
      <div className="hero-card">
        <h1 className="hero-title">
          <span className="ht-l1">{resolveLocalized(hero.titleLine1, locale)}</span>
          <span className="ht-l2">{resolveLocalized(hero.titleLine2, locale)}</span>
        </h1>
        <a className="hero-cta" href={hero.ctaUrl}>
          {resolveLocalized(hero.ctaLabel, locale)}
          {' '}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  );
}
