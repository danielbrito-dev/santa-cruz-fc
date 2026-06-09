import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import type { AchievementsData } from '@/lib/site-pages';
import { Kicker, Marquee } from './_shared';

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
    <div className="sc-page">
      <header className="sc-dhero">
        <span className="sc-dhero-ghost" aria-hidden="true">
          ★
        </span>
        <div className="sc-wrap sc-dhero-inner sc-hero-in">
          <Kicker label={t(sectionKey)} />
          <h1 className="sc-dhero-title">{t(titleKey)}</h1>
          <p className="sc-dhero-lead">{data.lead}</p>
        </div>
      </header>

      {data.stats && (
        <section className="sc-wrap" style={{ paddingBlock: 'clamp(8px,2vw,24px)' }}>
          <div className="sc-counters sc-reveal">
            {data.stats.map((s, i) => (
              <div className="sc-counter" key={i}>
                <strong>{s.value}</strong>
                <small>{s.label}</small>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.timeline && (
        <>
          <Marquee />
          <section className="sc-band sc-band-pad">
            <div className="sc-wrap">
              <div className="sc-shead sc-reveal">
                <h2>{t(titleKey)}</h2>
                <span className="idx">— {String(data.timeline.length).padStart(2, '0')}</span>
              </div>
              <ol className="sc-timeline">
                {data.timeline.map((it, i) => (
                  <li className="sc-tl sc-reveal" key={i}>
                    <span className="sc-tl-year">{it.year}</span>
                    <div className="sc-tl-body">
                      <h3>{it.title}</h3>
                      <p>{it.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        </>
      )}

      {data.ranking && (
        <section className="sc-ranking">
          <div className="sc-wrap sc-wrap--narrow">
            {data.rankingNote && <p className="sc-rank-note">{data.rankingNote}</p>}
            <ol className="sc-rank">
              {data.ranking.map((r) => (
                <li className="sc-reveal" key={r.pos}>
                  <span className="sc-rank-pos">{String(r.pos).padStart(2, '0')}</span>
                  <span className="sc-rank-name">{r.name}</span>
                  <span className="sc-rank-val">{r.value}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      <div className="sc-fill" aria-hidden="true" />
    </div>
  );
}
