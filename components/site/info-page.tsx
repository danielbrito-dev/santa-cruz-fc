import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';

const LOREM = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
];

/**
 * Editorial template for internal pages. Composed blocks (decorative hero, lead,
 * two-column body with a sticky facts aside, pull-quote, related cards, CTA band).
 * Placeholder content; real club facts in the aside. Light/dark via tokens.
 */
export async function InfoPage({
  sectionKey,
  titleKey,
}: {
  sectionKey: string;
  titleKey: string;
  locale: Locale;
}) {
  const t = await getTranslations('menu');
  const p = await getTranslations('page');

  const facts: { k: string; v: string }[] = [
    { k: p('factFounded'), v: '1914' },
    { k: p('factStadium'), v: 'Arruda' },
    { k: p('factCity'), v: 'Recife · PE' },
    { k: p('factColors'), v: p('colorsValue') },
    { k: p('factMascot'), v: 'Cobra Coral' },
  ];

  return (
    <div className="info">
      {/* HERO */}
      <header className="info-hero">
        <div className="container info-hero-inner">
          <nav className="info-breadcrumb" aria-label="breadcrumb">
            <span>{t(sectionKey)}</span>
            <span className="info-breadcrumb-sep">/</span>
            <span className="info-breadcrumb-current">{t(titleKey)}</span>
          </nav>
          <h1 className="info-title">{t(titleKey)}</h1>
          <p className="info-lead">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua.
          </p>
        </div>
      </header>

      {/* BODY + ASIDE */}
      <div className="info-main">
        <div className="container info-grid">
          <article className="info-content">
            <p className="info-content-lead">{LOREM[0]}</p>

            <h2>{p('overview')}</h2>
            <p>{LOREM[1]}</p>
            <p>{LOREM[2]}</p>

            <blockquote className="info-quote">
              “Lorem ipsum dolor sit amet, consectetur adipiscing elit — tradição que não é moda.”
              <cite>Santa Cruz Futebol Clube</cite>
            </blockquote>

            <h2>Lorem ipsum</h2>
            <p>{LOREM[0]}</p>
            <p>{LOREM[1]}</p>
          </article>

          <aside className="info-aside">
            <div className="info-facts">
              <h3>{p('quickFacts')}</h3>
              <dl>
                {facts.map((f) => (
                  <div className="row" key={f.k}>
                    <dt>{f.k}</dt>
                    <dd>{f.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>
      </div>

      {/* RELATED */}
      <section className="info-related">
        <div className="container">
          <h2 className="info-related-title">
            {p('related')} <em>—</em>
          </h2>
          <div className="info-cards">
            {[0, 1, 2].map((i) => (
              <article className="info-card" key={i}>
                <span className="info-card-idx">{String(i + 1).padStart(2, '0')}</span>
                <h3>Lorem ipsum dolor</h3>
                <p>Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.</p>
                <span className="info-card-more">{p('related')} →</span>
              </article>
            ))}
          </div>
        </div>
      </section>

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
