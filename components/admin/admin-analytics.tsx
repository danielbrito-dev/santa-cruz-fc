import { getTranslations } from 'next-intl/server';
import type { AnalyticsSummary } from '@/server/analytics/types';

const SRC_COLOR: Record<string, string> = {
  srcSearch: 'var(--red)',
  srcDirect: '#5C6066',
  srcSocial: 'var(--gold)',
  srcReferral: '#A2A7AD',
};

function donut(sources: AnalyticsSummary['sources']): string {
  let acc = 0;
  const stops = sources.map((s) => {
    const from = acc;
    acc += s.pct;
    return `${SRC_COLOR[s.key] ?? '#9aa0a6'} ${from}% ${acc}%`;
  });
  return stops.length ? `conic-gradient(${stops.join(', ')})` : 'var(--bg-2)';
}

export async function AdminAnalytics({ summary }: { summary: AnalyticsSummary }) {
  const t = await getTranslations('admin');
  const maxSeries = Math.max(1, ...summary.series);
  const maxPage = Math.max(1, ...summary.topPages.map((p) => p.v));
  const maxCta = Math.max(1, ...summary.ctas.map((c) => c.v));
  const maxNews = Math.max(1, ...summary.topNews.map((n) => n.v));
  const isLive = summary.source === 'live';

  return (
    <section className="adm-an">
      <div className="adm-an-head">
        <h2 className="adm-an-title">{t('analyticsTitle')}</h2>
        <div className="adm-an-head-meta">
          <span className="adm-an-period">{t('last30')}</span>
          <span className={`admin-badge ${isLive ? 'admin-badge--stat' : 'admin-badge--soon'}`}>
            {isLive ? t('liveData') : t('demoData')}
          </span>
        </div>
      </div>

      {/* KPIs */}
      <div className="adm-kpis">
        {summary.kpis.map((k) => (
          <div className="adm-kpi" key={k.key}>
            <span className="adm-kpi-label">{t(k.key)}</span>
            <strong className="adm-kpi-value">{k.value}</strong>
            {k.delta && <span className={`adm-kpi-delta${k.good ? ' up' : ' down'}`}>{k.delta}</span>}
          </div>
        ))}
      </div>

      <div className="adm-an-grid">
        {/* Gráfico de acessos */}
        <div className="adm-card adm-an-chart">
          <span className="adm-an-card-title">{t('chartAccesses')}</span>
          <div className="adm-bars" role="img" aria-label={t('chartAccesses')}>
            {summary.series.map((v, i) => (
              <span key={i} className="adm-bar" style={{ height: `${(v / maxSeries) * 100}%` }} />
            ))}
          </div>
        </div>

        {/* Origem do tráfego */}
        <div className="adm-card adm-an-sources">
          <span className="adm-an-card-title">{t('trafficSources')}</span>
          {summary.sources.length === 0 ? (
            <p className="adm-empty">{t('noData')}</p>
          ) : (
            <div className="adm-an-sources-row">
              <div className="adm-donut" style={{ background: donut(summary.sources) }} aria-hidden="true">
                <span />
              </div>
              <ul className="adm-legend">
                {summary.sources.map((s) => (
                  <li key={s.key}>
                    <i style={{ background: SRC_COLOR[s.key] ?? '#9aa0a6' }} />
                    {t(s.key)} <strong>{s.pct}%</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="adm-an-grid">
        {/* Páginas mais vistas */}
        <div className="adm-card">
          <span className="adm-an-card-title">{t('topPages')}</span>
          {summary.topPages.length === 0 ? (
            <p className="adm-empty">{t('noData')}</p>
          ) : (
            <ul className="adm-rank">
              {summary.topPages.map((p) => (
                <li key={p.label}>
                  <span className="adm-rank-label">{p.label}</span>
                  <span className="adm-rank-bar"><i style={{ width: `${(p.v / maxPage) * 100}%` }} /></span>
                  <span className="adm-rank-val">{p.v.toLocaleString('pt-BR')}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Notícias mais lidas */}
        <div className="adm-card">
          <span className="adm-an-card-title">{t('topNews')}</span>
          {summary.topNews.length === 0 ? (
            <p className="adm-empty">{t('noData')}</p>
          ) : (
            <ul className="adm-rank">
              {summary.topNews.map((n) => (
                <li key={n.title}>
                  <span className="adm-rank-label" title={n.title}>{n.title}</span>
                  <span className="adm-rank-bar"><i style={{ width: `${(n.v / maxNews) * 100}%` }} /></span>
                  <span className="adm-rank-val">{n.v.toLocaleString('pt-BR')} {t('views')}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="adm-an-grid">
        {/* Dispositivos */}
        <div className="adm-card">
          <span className="adm-an-card-title">{t('devices')}</span>
          <ul className="adm-rank adm-rank--devices">
            {summary.devices.map((d) => (
              <li key={d.key}>
                <span className="adm-rank-label">{t(d.key)}</span>
                <span className="adm-rank-bar"><i style={{ width: `${d.pct}%` }} /></span>
                <span className="adm-rank-val">{d.pct}%</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cliques nos CTAs */}
        <div className="adm-card">
          <span className="adm-an-card-title">{t('ctaClicks')}</span>
          {summary.ctas.length === 0 ? (
            <p className="adm-empty">{t('noData')}</p>
          ) : (
            <ul className="adm-rank">
              {summary.ctas.map((c) => (
                <li key={c.label}>
                  <span className="adm-rank-label">{c.label}</span>
                  <span className="adm-rank-bar"><i style={{ width: `${(c.v / maxCta) * 100}%`, background: 'var(--gold)' }} /></span>
                  <span className="adm-rank-val">{c.v.toLocaleString('pt-BR')}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
