import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import type { AchievementsData } from '@/lib/site-pages';

export async function Achievements({
  sectionKey,
  titleKey,
  data,
}: {
  sectionKey: string;
  titleKey: string;
  locale: Locale;
  data: AchievementsData;
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
          <p className="info-lead">{data.lead}</p>
        </div>
      </header>

      {data.stats && (
        <div className="ach-stats">
          <div className="container ach-stats-grid">
            {data.stats.map((s, i) => (
              <div className="ach-stat" key={i}>
                <strong>{s.value}</strong>
                <small>{s.label}</small>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="info-main">
        <div className="container">
          {data.timeline && (
            <ol className="ach-timeline">
              {data.timeline.map((it, i) => (
                <li className="ach-tl-item" key={i}>
                  <span className="ach-tl-year">{it.year}</span>
                  <div className="ach-tl-body">
                    <h3>{it.title}</h3>
                    <p>{it.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}

          {data.ranking && (
            <div className="ach-ranking">
              {data.rankingNote && <p className="ach-note">{data.rankingNote}</p>}
              <ol className="ach-rank-list">
                {data.ranking.map((r) => (
                  <li className="ach-rank-row" key={r.pos}>
                    <span className="ach-rank-pos">{String(r.pos).padStart(2, '0')}</span>
                    <span className="ach-rank-name">{r.name}</span>
                    <span className="ach-rank-val">{r.value}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>

      <div className="info-fill" aria-hidden="true" />
    </div>
  );
}
