import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import type { LandingData } from '@/lib/site-pages';

export async function Landing({
  sectionKey,
  titleKey,
  data,
}: {
  sectionKey: string;
  titleKey: string;
  locale: Locale;
  data: LandingData;
}) {
  const t = await getTranslations('menu');
  const external = data.ctaHref.startsWith('http');

  return (
    <div className="landing">
      {/* hero ESCURO com CTA — cara de marketing, distinta do editorial claro */}
      <header className="landing-hero">
        <div className="container">
          <span className="landing-eyebrow">{t(sectionKey)}</span>
          <h1 className="landing-title">{t(titleKey)}</h1>
          <p className="landing-lead">{data.lead}</p>
          <a
            className="landing-cta"
            href={data.ctaHref}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {data.ctaLabel} →
          </a>
        </div>
      </header>

      <div className="landing-body">
        <div className="container landing-grid">
          {data.highlights.map((h, i) => (
            <article className="landing-card" key={i}>
              <span className="landing-card-idx">{String(i + 1).padStart(2, '0')}</span>
              <h3>{h.title}</h3>
              <p>{h.text}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="info-fill" aria-hidden="true" />
    </div>
  );
}
