import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import type { PeopleData } from '@/lib/site-pages';
import { Kicker } from './_shared';

function Bust() {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" aria-hidden="true">
      <circle cx="50" cy="36" r="19" />
      <path d="M14 100c2-24 17-37 36-37s34 13 36 37Z" />
    </svg>
  );
}

export async function People({
  sectionKey,
  titleKey,
  data,
}: {
  sectionKey: string;
  titleKey: string;
  locale: Locale;
  data: PeopleData;
}) {
  const t = await getTranslations('menu');

  return (
    <div className="sc-page">
      <header className="sc-dhero">
        <span className="sc-dhero-ghost" aria-hidden="true">
          SCFC
        </span>
        <div className="sc-wrap sc-dhero-inner sc-hero-in">
          <Kicker label={t(sectionKey)} />
          <h1 className="sc-dhero-title">{t(titleKey)}</h1>
          <p className="sc-dhero-lead">{data.lead}</p>
        </div>
      </header>

      <div className="sc-people">
        <div className="sc-wrap">
          {data.groups.map((g, i) => (
            <section className="sc-people-group" key={i}>
              <h2>{g.title}</h2>
              <div className="sc-people-grid">
                {g.members.map((m, j) => (
                  <article className="sc-person sc-reveal" key={j}>
                    <div className="sc-person-photo">
                      <Bust />
                    </div>
                    <div className="sc-person-body">
                      <span className="sc-person-role">{m.role}</span>
                      <h3 className="sc-person-name">{m.name}</h3>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <div className="sc-fill" aria-hidden="true" />
    </div>
  );
}
