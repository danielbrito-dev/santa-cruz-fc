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
    timeZone: 'UTC',
  }).format(new Date(data.updatedAt));

  return (
    <div className="legal">
      {/* cabeçalho compacto — documento, não hero de revista */}
      <header className="legal-head">
        <div className="container">
          <span className="legal-eyebrow">
            {t(sectionKey)} · {p('document')}
          </span>
          <h1 className="legal-title">{t(titleKey)}</h1>
          <span className="legal-date">
            {p('updatedAt')} {date}
          </span>
        </div>
      </header>

      <div className="legal-body">
        <div className="container legal-grid">
          <aside className="legal-toc">
            <span className="legal-toc-label">{p('onThisPage')}</span>
            <nav>
              {data.sections.map((s, i) => (
                <a key={i} href={`#s-${i}`}>
                  {s.heading}
                </a>
              ))}
            </nav>
          </aside>

          <article className="legal-article">
            {data.sections.map((s, i) => (
              <section id={`s-${i}`} className="legal-section" key={i}>
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
