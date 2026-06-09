import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import type { DocumentsData } from '@/lib/site-pages';

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
    <div className="doc">
      <header className="doc-head">
        <div className="container">
          <span className="doc-eyebrow">
            {t(sectionKey)} · {p('downloads')}
          </span>
          <h1 className="doc-title">{t(titleKey)}</h1>
          <p className="doc-lead">{data.lead}</p>
        </div>
      </header>

      <div className="doc-body">
        <div className="container">
          <ul className="doc-list">
            {data.items.map((it, i) => (
              <li key={i}>
                <a className="doc-row" href={it.href}>
                  <span className="doc-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                      <path d="M14 3v5h5" />
                    </svg>
                  </span>
                  <span className="doc-info">
                    <span className="doc-name">{it.title}</span>
                    {it.meta && <span className="doc-meta">{it.meta}</span>}
                  </span>
                  <span className="doc-kind">{it.kind}</span>
                  <span className="doc-dl">{p('download')} →</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="info-fill" aria-hidden="true" />
    </div>
  );
}
