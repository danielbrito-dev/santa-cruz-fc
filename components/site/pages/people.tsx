import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import type { PeopleData } from '@/lib/site-pages';

function Bust() {
  return (
    <span className="person-silhouette" aria-hidden="true">
      <svg viewBox="0 0 100 100" fill="currentColor">
        <circle cx="50" cy="38" r="20" />
        <path d="M16 100c2-22 16-34 34-34s32 12 34 34Z" />
      </svg>
    </span>
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
    <div className="info">
      <header className="people-head">
        <div className="container">
          <span className="people-eyebrow">{t(sectionKey)}</span>
          <h1 className="people-title">{t(titleKey)}</h1>
          <p className="people-lead">{data.lead}</p>
        </div>
      </header>

      <div className="info-main">
        <div className="container">
          {data.groups.map((g, i) => (
            <section className="people-group" key={i}>
              <h2 className="people-group-title">{g.title}</h2>
              <div className="people-grid">
                {g.members.map((m, j) => (
                  <article className="person-card" key={j}>
                    <div className="person-photo">
                      <Bust />
                    </div>
                    <span className="person-role">{m.role}</span>
                    <h3 className="person-name">{m.name}</h3>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <div className="info-fill" aria-hidden="true" />
    </div>
  );
}
