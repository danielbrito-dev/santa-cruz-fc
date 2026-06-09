import { getTranslations } from 'next-intl/server';
import type { NewsItem } from '@/server/content/types';

// Dados de DEMONSTRAÇÃO (mock). Na etapa de infra, ligar analytics real
// (Vercel Web Analytics ou tabela de eventos no banco).
const KPIS: { key: string; value: string; delta: string; good: boolean }[] = [
  { key: 'kpiVisits', value: '84.230', delta: '+12%', good: true },
  { key: 'kpiUniques', value: '52.180', delta: '+9%', good: true },
  { key: 'kpiPageviews', value: '312.540', delta: '+15%', good: true },
  { key: 'kpiAvgTime', value: '2m48s', delta: '+4%', good: true },
  { key: 'kpiBounce', value: '38%', delta: '-3%', good: true },
  { key: 'kpiMembers', value: '1.240', delta: '+21%', good: true },
];
const SERIES = [42, 38, 51, 47, 63, 58, 71, 66, 59, 74, 69, 82, 77, 90];
const SOURCES = [
  { key: 'srcSearch', pct: 41, color: 'var(--red)' },
  { key: 'srcDirect', pct: 34, color: 'var(--ink)' },
  { key: 'srcSocial', pct: 19, color: 'var(--gold)' },
  { key: 'srcReferral', pct: 6, color: '#9aa0a6' },
];
const DEVICES = [
  { key: 'devMobile', pct: 78 },
  { key: 'devDesktop', pct: 19 },
  { key: 'devTablet', pct: 3 },
];
const TOP_PAGES = [
  { label: 'Início', v: 128000 },
  { label: 'Notícias', v: 74000 },
  { label: 'Elenco', v: 41000 },
  { label: 'Calendário', v: 33000 },
  { label: 'História', v: 21000 },
  { label: 'Seja Sócio', v: 18000 },
];
const CTAS = [
  { label: 'Seja Sócio', v: 1240 },
  { label: 'Ingressos', v: 980 },
  { label: 'Loja', v: 760 },
  { label: 'App', v: 420 },
];
const NEWS_VIEWS = [18420, 12310, 9870, 7640, 5210];

function donut(): string {
  let acc = 0;
  const stops = SOURCES.map((s) => {
    const from = acc;
    acc += s.pct;
    return `${s.color} ${from}% ${acc}%`;
  });
  return `conic-gradient(${stops.join(', ')})`;
}

export async function AdminAnalytics({ news }: { news: NewsItem[] }) {
  const t = await getTranslations('admin');
  const maxSeries = Math.max(...SERIES);
  const topNews = [...news]
    .filter((n) => n.status === 'published')
    .sort((a, b) => a.position - b.position)
    .slice(0, 5);
  const maxPage = Math.max(...TOP_PAGES.map((p) => p.v));
  const maxCta = Math.max(...CTAS.map((c) => c.v));

  return (
    <section className="adm-an">
      <div className="adm-an-head">
        <h2 className="adm-an-title">{t('analyticsTitle')}</h2>
        <div className="adm-an-head-meta">
          <span className="adm-an-period">{t('last30')}</span>
          <span className="admin-badge admin-badge--soon">{t('demoData')}</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="adm-kpis">
        {KPIS.map((k) => (
          <div className="adm-kpi" key={k.key}>
            <span className="adm-kpi-label">{t(k.key)}</span>
            <strong className="adm-kpi-value">{k.value}</strong>
            <span className={`adm-kpi-delta${k.good ? ' up' : ' down'}`}>{k.delta}</span>
          </div>
        ))}
      </div>

      <div className="adm-an-grid">
        {/* Gráfico de acessos */}
        <div className="adm-card adm-an-chart">
          <span className="adm-an-card-title">{t('chartAccesses')}</span>
          <div className="adm-bars" role="img" aria-label={t('chartAccesses')}>
            {SERIES.map((v, i) => (
              <span key={i} className="adm-bar" style={{ height: `${(v / maxSeries) * 100}%` }} />
            ))}
          </div>
        </div>

        {/* Origem do tráfego */}
        <div className="adm-card adm-an-sources">
          <span className="adm-an-card-title">{t('trafficSources')}</span>
          <div className="adm-an-sources-row">
            <div className="adm-donut" style={{ background: donut() }} aria-hidden="true">
              <span />
            </div>
            <ul className="adm-legend">
              {SOURCES.map((s) => (
                <li key={s.key}>
                  <i style={{ background: s.color }} />
                  {t(s.key)} <strong>{s.pct}%</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="adm-an-grid">
        {/* Páginas mais vistas */}
        <div className="adm-card">
          <span className="adm-an-card-title">{t('topPages')}</span>
          <ul className="adm-rank">
            {TOP_PAGES.map((p) => (
              <li key={p.label}>
                <span className="adm-rank-label">{p.label}</span>
                <span className="adm-rank-bar"><i style={{ width: `${(p.v / maxPage) * 100}%` }} /></span>
                <span className="adm-rank-val">{p.v.toLocaleString('pt-BR')}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Notícias mais lidas (títulos reais) */}
        <div className="adm-card">
          <span className="adm-an-card-title">{t('topNews')}</span>
          <ul className="adm-rank">
            {topNews.length === 0 ? (
              <li><span className="adm-rank-label" style={{ color: 'var(--muted)' }}>—</span></li>
            ) : topNews.map((n, i) => (
              <li key={n.id}>
                <span className="adm-rank-label" title={n.title.pt}>{n.title.pt}</span>
                <span className="adm-rank-val">{(NEWS_VIEWS[i] ?? 1000).toLocaleString('pt-BR')} {t('views')}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="adm-an-grid">
        {/* Dispositivos */}
        <div className="adm-card">
          <span className="adm-an-card-title">{t('devices')}</span>
          <ul className="adm-rank adm-rank--devices">
            {DEVICES.map((d) => (
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
          <ul className="adm-rank">
            {CTAS.map((c) => (
              <li key={c.label}>
                <span className="adm-rank-label">{c.label}</span>
                <span className="adm-rank-bar"><i style={{ width: `${(c.v / maxCta) * 100}%`, background: 'var(--gold)' }} /></span>
                <span className="adm-rank-val">{c.v.toLocaleString('pt-BR')}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
