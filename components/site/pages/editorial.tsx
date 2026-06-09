import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import type { EditorialData } from '@/lib/site-pages';
import { Kicker, Marquee } from './_shared';

export async function Editorial({
  sectionKey,
  titleKey,
  data,
}: {
  sectionKey: string;
  titleKey: string;
  locale: Locale;
  data: EditorialData;
}) {
  const t = await getTranslations('menu');
  const p = await getTranslations('page');
  const photo = data.heroImage;

  return (
    <div className={`sc-page${photo ? ' page-hero-dark' : ''}`} data-section={sectionKey}>
      {photo ? (
        <header className="sc-hero">
          <div className="sc-hero-media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt="" />
          </div>
          <div className="sc-hero-scrim" aria-hidden="true" />
          <div className="sc-hero-grain" aria-hidden="true" />
          <div className="sc-wrap sc-hero-inner sc-hero-in">
            <Kicker label={t(sectionKey)} />
            <h1 className="sc-hero-title">{t(titleKey)}</h1>
            <p className="sc-hero-lead">{data.lead}</p>
          </div>
        </header>
      ) : (
        <header className="sc-dhero">
          <span className="sc-dhero-ghost" aria-hidden="true">
            SCFC
          </span>
          <div className="sc-wrap sc-dhero-inner sc-hero-in">
            <Kicker label={t(sectionKey)} />
            <h1 className="sc-dhero-title">{t(titleKey)}</h1>
            <p className="sc-dhero-lead">{data.lead}</p>
          </div>
        </header>
      )}

      <Marquee />

      <div className="sc-article">
        <div className="sc-wrap sc-wrap--read">
          <article>
            {data.sections.map((s, i) => (
              <section className="sc-reveal" key={i}>
                <h2>{s.heading}</h2>
                {s.paragraphs.map((par, j) => (
                  <p key={j}>{par}</p>
                ))}
              </section>
            ))}
            {data.quote && (
              <blockquote className="sc-pullquote sc-reveal">
                <q>{data.quote.text}</q>
                <cite>{data.quote.cite}</cite>
              </blockquote>
            )}
          </article>
        </div>
      </div>

      <section className="sc-cta">
        <div className="sc-wrap sc-cta-inner">
          <div>
            <span className="sc-cta-eyebrow">{p('ctaEyebrow')}</span>
            <h2>{p('ctaTitle')}</h2>
            <p>{p('ctaText')}</p>
          </div>
          <a
            className="sc-btn"
            href="https://socio-santacruz.futebolcard.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {p('ctaButton')} →
          </a>
        </div>
      </section>

      <div className="sc-fill" aria-hidden="true" />
    </div>
  );
}
