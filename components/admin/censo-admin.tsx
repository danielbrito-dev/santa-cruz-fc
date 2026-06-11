'use client';

import { useTranslations } from 'next-intl';
import { CENSUS_QUESTIONS } from '@/lib/census';
import type { CensusAggregate } from '@/server/content/census-store';

/** Agregados do Censo Coral — total + barras por opção de cada pergunta. */
export function CensoAdmin({ agg }: { agg: CensusAggregate }) {
  const t = useTranslations('admin');
  const tc = useTranslations('fanCensus');

  return (
    <div className="admin-page admin-page--wide">
      <div className="admin-page-head">
        <h1 className="admin-page-title">{t('censoTitle')}</h1>
        <p className="admin-page-sub">{t('censoDesc')} · {t('censoTotal', { count: agg.total })}</p>
      </div>

      {agg.total === 0 ? (
        <p className="admin-jogos-hint">{t('censoEmpty')}</p>
      ) : (
        <div className="adm-cns-grid">
          {CENSUS_QUESTIONS.map((q) => {
            const counts = agg.byQuestion[q.key] ?? {};
            const max = Math.max(1, ...q.options.map((o) => counts[o] ?? 0));
            return (
              <div className="admin-card adm-cns-card" key={q.key}>
                <h3 className="adm-cns-q">{tc(`q_${q.key}`)}</h3>
                <ul className="adm-cns-bars">
                  {q.options.map((o) => {
                    const n = counts[o] ?? 0;
                    const pct = agg.total ? Math.round((n / agg.total) * 100) : 0;
                    return (
                      <li key={o} className="adm-cns-row">
                        <span className="adm-cns-label">{tc(`o_${q.key}_${o}`)}</span>
                        <span className="adm-cns-track" aria-hidden="true">
                          <i style={{ width: `${Math.round((n / max) * 100)}%` }} />
                        </span>
                        <span className="adm-cns-val">{n} · {pct}%</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
