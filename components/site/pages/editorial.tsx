import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import type { EditorialData } from '@/lib/site-pages';

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

  return (
    <div className="info">
      <header className="info-hero">
        <div className="container info-hero-inner">
          <nav className="info-breadcrumb" aria-label="breadcrumb">
            <span>{t(sectionKey)}</span>
            <span className="info-breadcrumb-sep">/</span>
            <span className="info-breadcrumb-current">{t(titleKey)}</span>
          </nav>
          <h1 className="info-title">{t(titleKey)}</h1>
          <p className="info-lead">{data.lead}</p>
        </div>
      </header>

      <div className="info-main">
        <div className="container">
          <article className="info-content">
            {data.sections.map((s, i) => (
              <section key={i}>
                <h2>{s.heading}</h2>
                {s.paragraphs.map((par, j) => (
                  <p key={j}>{par}</p>
                ))}
              </section>
            ))}
            {data.quote && (
              <blockquote className="info-quote">
                “{data.quote.text}”<cite>{data.quote.cite}</cite>
              </blockquote>
            )}
          </article>
        </div>
      </div>

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
