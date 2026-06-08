import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import type { FaqData } from '@/lib/site-pages';

export async function Faq({
  sectionKey,
  titleKey,
  data,
}: {
  sectionKey: string;
  titleKey: string;
  locale: Locale;
  data: FaqData;
}) {
  const t = await getTranslations('menu');

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
          <p className="info-lead">{data.intro}</p>
        </div>
      </header>

      <div className="info-main">
        <div className="container">
          <div className="faq-list">
            {data.items.map((it, i) => (
              <details className="faq-item" key={i}>
                <summary className="faq-q">{it.q}</summary>
                <div className="faq-a">{it.a}</div>
              </details>
            ))}
          </div>
        </div>
      </div>

      <div className="info-fill" aria-hidden="true" />
    </div>
  );
}
