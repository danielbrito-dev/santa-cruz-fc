import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import type { FeatureData } from '@/lib/site-pages';

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
    <div className="info feat page-hero-dark">
      {/* HERO cinematográfico */}
      <header className="feat-hero">
        <div className="feat-hero-media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data.heroImage} alt="" />
        </div>
        <div className="feat-hero-overlay" aria-hidden="true" />
        <div className="container feat-hero-inner">
          {data.heroKicker && <span className="feat-kicker">{data.heroKicker}</span>}
          <span className="feat-eyebrow">{t(sectionKey)}</span>
          <h1 className="feat-title">{t(titleKey)}</h1>
        </div>
      </header>

      {/* MANIFESTO + STATS */}
      <section className="feat-intro">
        <div className="container feat-intro-grid">
          <p className="feat-lead">{data.intro}</p>
          <dl className="feat-stats">
            {data.stats.map((s, i) => (
              <div className="feat-stat" key={i}>
                <dt>{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* EVOLUÇÃO DO ESCUDO */}
      {data.crests && (
        <section className="feat-crests">
          <div className="container">
            <h2 className="feat-h2">{data.crestsTitle}</h2>
            <div className="feat-crest-row">
              {data.crests.map((c, i) => (
                <figure className="feat-crest" key={i}>
                  <div className="feat-crest-tile">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.src} alt={`Escudo do Santa Cruz — ${c.year}`} />
                  </div>
                  <figcaption>{c.year}</figcaption>
                </figure>
              ))}
            </div>
            {data.crestsNote && <p className="feat-crest-note">{data.crestsNote}</p>}
          </div>
        </section>
      )}

      {/* MARCOS — linha do tempo */}
      <section className="feat-marcos">
        <div className="container">
          <h2 className="feat-h2 feat-h2--onDark">{data.marcosTitle}</h2>
          <ol className="feat-timeline">
            {data.marcos.map((m, i) => (
              <li className="feat-tl-item" key={i}>
                <span className="feat-tl-year">{m.year}</span>
                <div className="feat-tl-body">
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
        <section className="feat-quote">
          <div className="container">
            <blockquote className="feat-quote-text">“{data.quote.text}”</blockquote>
            <cite className="feat-quote-cite">{data.quote.cite}</cite>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="info-cta">
        <div className="container info-cta-inner">
          <div>
            <span className="info-cta-eyebrow">{p('ctaEyebrow')}</span>
            <h2>{p('ctaTitle')}</h2>
            <p>{p('ctaText')}</p>
          </div>
          <a
            className="info-cta-btn"
            href="https://socio-santacruz.futebolcard.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {p('ctaButton')} →
          </a>
        </div>
      </section>

      <div className="info-fill" aria-hidden="true" />
    </div>
  );
}
