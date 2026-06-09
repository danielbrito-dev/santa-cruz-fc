import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import type { LegalData } from '@/lib/site-pages';
import { Kicker } from './_shared';

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
    <div className="sc-page">
      <header className="sc-dhero sc-dhero--doc">
        <div className="sc-wrap sc-dhero-inner sc-hero-in">
          <Kicker label={`${t(sectionKey)} · ${p('document')}`} />
          <h1 className="sc-dhero-title">{t(titleKey)}</h1>
          <span className="sc-dhero-date">
            {p('updatedAt')} {date}
          </span>
        </div>
      </header>

      <div className="sc-legal">
        <div className="sc-wrap sc-legal-grid">
          <aside className="sc-legal-toc">
            <span>{p('onThisPage')}</span>
            <nav>
              {data.sections.map((s, i) => (
                <a key={i} href={`#s-${i}`}>
                  {s.heading}
                </a>
              ))}
            </nav>
          </aside>

          <article className="sc-legal-article">
            {data.sections.map((s, i) => (
              <section id={`s-${i}`} className="sc-legal-section sc-reveal" key={i}>
                <h2>{s.heading}</h2>
                {s.paragraphs.map((par, j) => (
                  <p key={j}>{par}</p>
                ))}
              </section>
            ))}
          </article>
        </div>
      </div>

      <div className="sc-fill" aria-hidden="true" />
    </div>
  );
}
