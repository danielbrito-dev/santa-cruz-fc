import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import type { LegalData } from '@/lib/site-pages';

export async function Legal({
  sectionKey,
  titleKey,
  locale,
  data,
}: {
  sectionKey: string;
  titleKey: string;
  locale: Locale;
  data: LegalData;
}) {
  const t = await getTranslations('menu');
  const p = await getTranslations('page');
  const date = new Intl.DateTimeFormat(locale === 'pt' ? 'pt-BR' : 'en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC', // data ISO armazenada em UTC; evita off-by-one por fuso
  }).format(new Date(data.updatedAt));

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
          <p className="info-lead">
            {p('updatedAt')} {date}
          </p>
        </div>
      </header>

      <div className="info-main">
        <div className="container">
          <article className="legal-doc">
            {data.sections.map((s, i) => (
              <section key={i} className="legal-section">
                <h2>{s.heading}</h2>
                {s.paragraphs.map((par, j) => (
                  <p key={j}>{par}</p>
                ))}
              </section>
            ))}
          </article>
        </div>
      </div>

      <div className="info-fill" aria-hidden="true" />
    </div>
  );
}
