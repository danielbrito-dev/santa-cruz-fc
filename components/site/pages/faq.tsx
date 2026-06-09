import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import type { FaqData } from '@/lib/site-pages';
import { Kicker, Marquee } from './_shared';

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
    <div className="sc-page">
      <header className="sc-dhero">
        <span className="sc-dhero-ghost" aria-hidden="true">
          ?
        </span>
        <div className="sc-wrap sc-dhero-inner sc-hero-in">
          <Kicker label={p('helpCenter')} />
          <h1 className="sc-dhero-title">{t(titleKey)}</h1>
          <p className="sc-dhero-lead">{data.intro}</p>
        </div>
      </header>

      <Marquee />

      <div className="sc-faq">
        <div className="sc-wrap">
          <div className="sc-faq-list">
            {data.items.map((it, i) => (
              <details className="sc-faq-item sc-reveal" key={i}>
                <summary className="sc-faq-q">{it.q}</summary>
                <div className="sc-faq-a">{it.a}</div>
              </details>
            ))}
          </div>
        </div>
      </div>

      <div className="sc-fill" aria-hidden="true" />
    </div>
  );
}
