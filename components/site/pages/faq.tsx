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
  const p = await getTranslations('page');
  void sectionKey;

  return (
    <div className="faq">
      <header className="faq-head">
        <div className="container">
          <span className="faq-eyebrow">{p('helpCenter')}</span>
          <h1 className="faq-title">{t(titleKey)}</h1>
          <p className="faq-intro">{data.intro}</p>
        </div>
      </header>

      <div className="faq-body">
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
