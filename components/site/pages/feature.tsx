import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import type { FeatureData } from '@/lib/site-pages';
import { Kicker, Marquee } from './_shared';

export async function Feature({
  sectionKey,
  titleKey,
  data,
}: {
  sectionKey: string;
  titleKey: string;
  locale: Locale;
  data: FeatureData;
}) {
  const t = await getTranslations('menu');
  const p = await getTranslations('page');

  return (
    <div className="sc-page page-hero-dark">
      {/* HERO cinematográfico */}
      <header className="sc-hero">
        <div className="sc-hero-media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data.heroImage} alt="" />
        </div>
        <div className="sc-hero-scrim" aria-hidden="true" />
        <div className="sc-hero-grain" aria-hidden="true" />
        <div className="sc-wrap sc-hero-inner sc-hero-in">
          <Kicker label={t(sectionKey)} num={data.heroKicker} />
          <h1 className="sc-hero-title">{t(titleKey)}</h1>
          <span className="sc-hero-scroll">
            <i aria-hidden="true" />
            {p('scrollExplore')}
          </span>
        </div>
      </header>

      {/* MANIFESTO + STATS */}
      <section className="sc-manifesto">
        <div className="sc-wrap sc-manifesto-grid">
          <p className="sc-manifesto-lead sc-reveal">{data.intro}</p>
          <dl className="sc-stats sc-reveal">
            {data.stats.map((s, i) => (
              <div className="sc-stat" key={i}>
                <dt>{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <Marquee />

      {/* EVOLUÇÃO DO ESCUDO */}
      {data.crests && (
        <section className="sc-crests">
          <div className="sc-wrap">
            <div className="sc-shead sc-reveal">
              <h2>{data.crestsTitle}</h2>
              <span className="idx">— {String(data.crests.length).padStart(2, '0')}</span>
            </div>
            <div className="sc-crest-row">
              {data.crests.map((c, i) => (
                <figure className="sc-crest" key={i}>
                  <div className="sc-crest-tile">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.src} alt={`Escudo do Santa Cruz — ${c.year}`} />
                  </div>
                  <figcaption>{c.year}</figcaption>
                </figure>
              ))}
            </div>
            {data.crestsNote && <p className="sc-crest-note">{data.crestsNote}</p>}
          </div>
        </section>
      )}

      {/* MARCOS — banda escura, timeline */}
      <section className="sc-band sc-band-pad">
        <div className="sc-wrap">
          <div className="sc-shead sc-reveal">
            <h2>{data.marcosTitle}</h2>
            <span className="idx">— {String(data.marcos.length).padStart(2, '0')}</span>
          </div>
          <ol className="sc-timeline">
            {data.marcos.map((m, i) => (
              <li className="sc-tl sc-reveal" key={i}>
                <span className="sc-tl-year">{m.year}</span>
                <div className="sc-tl-body">
                  <h3>{m.title}</h3>
                  <p>{m.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CITAÇÃO */}
      {data.quote && (
        <section className="sc-article">
          <div className="sc-wrap sc-wrap--narrow">
            <blockquote className="sc-pullquote sc-reveal" style={{ borderTop: 'none' }}>
              <q>{data.quote.text}</q>
              <cite>{data.quote.cite}</cite>
            </blockquote>
          </div>
        </section>
      )}

      {/* CTA */}
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
