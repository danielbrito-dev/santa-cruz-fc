import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import type { DocumentsData } from '@/lib/site-pages';
import { Kicker, DownloadIcon } from './_shared';

export async function Documents({
  sectionKey,
  titleKey,
  data,
}: {
  sectionKey: string;
  titleKey: string;
  locale: Locale;
  data: DocumentsData;
}) {
  const t = await getTranslations('menu');
  const p = await getTranslations('page');

  return (
    <div className="sc-page">
      <header className="sc-dhero">
        <span className="sc-dhero-ghost" aria-hidden="true">
          PDF
        </span>
        <div className="sc-wrap sc-dhero-inner sc-hero-in">
          <Kicker label={`${t(sectionKey)} · ${p('downloads')}`} />
          <h1 className="sc-dhero-title">{t(titleKey)}</h1>
          <p className="sc-dhero-lead">{data.lead}</p>
        </div>
      </header>

      <div className="sc-docs">
        <div className="sc-wrap sc-wrap--narrow">
          <ul className="sc-doc-list">
            {data.items.map((it, i) => (
              <li key={i}>
                <a className="sc-doc sc-reveal" href={it.href}>
                  <span className="sc-doc-kind">{it.kind}</span>
                  <span className="sc-doc-info">
                    <span className="sc-doc-name">{it.title}</span>
                    {it.meta && <span className="sc-doc-meta">{it.meta}</span>}
                  </span>
                  <span className="sc-doc-dl">
                    {p('download')}
                    <DownloadIcon />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="sc-fill" aria-hidden="true" />
    </div>
  );
}
