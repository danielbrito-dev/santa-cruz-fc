import { readEvents } from './sink';
import { readSiteContent } from '@/server/content/store';
import type { AnalyticsSummary, StoredEvent } from './types';

const nf = new Intl.NumberFormat('pt-BR');
const DAY = 86_400_000;

const PAGE_LABELS: Record<string, string> = {
  '/': 'Início',
  '/noticias': 'Notícias',
  '/elenco': 'Elenco',
  '/futebol/calendario': 'Calendário',
  '/futebol/resultados': 'Resultados',
  '/o-santa/historia': 'História',
  '/o-santa/titulos': 'Títulos',
  '/o-santa/artilheiros': 'Artilheiros',
  '/historias/explorar': 'Histórias',
};
const SOURCE_KEY: Record<string, string> = {
  search: 'srcSearch',
  direct: 'srcDirect',
  social: 'srcSocial',
  referral: 'srcReferral',
};
const CTA_LABELS: Record<string, string> = { sejaSocio: 'Seja Sócio', lojas: 'Lojas', ingressos: 'Ingressos' };

function fmtTime(ms: number): string {
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}m${String(r).padStart(2, '0')}s` : `${r}s`;
}
function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
function pct(parts: { key: string; n: number }[]): { key: string; pct: number }[] {
  const total = parts.reduce((a, b) => a + b.n, 0) || 1;
  return parts.map((p) => ({ key: p.key, pct: Math.round((p.n / total) * 100) }));
}

function demoSummary(newsTitles: string[]): AnalyticsSummary {
  const views = [18420, 12310, 9870, 7640, 5210];
  const fallback = ['Santa Cruz vence clássico no Arruda', 'Reforço chega para a Série C', 'Ingressos à venda', 'Base coral conquista título', 'Sócio-torcedor bate recorde'];
  const titles = (newsTitles.length ? newsTitles : fallback).slice(0, 5);
  return {
    source: 'demo',
    kpis: [
      { key: 'kpiVisits', value: '84.230', delta: '+12%', good: true },
      { key: 'kpiUniques', value: '52.180', delta: '+9%', good: true },
      { key: 'kpiPageviews', value: '312.540', delta: '+15%', good: true },
      { key: 'kpiAvgTime', value: '2m48s', delta: '+4%', good: true },
      { key: 'kpiBounce', value: '38%', delta: '-3%', good: true },
      { key: 'kpiMembers', value: '1.240', delta: '+21%', good: true },
    ],
    series: [42, 38, 51, 47, 63, 58, 71, 66, 59, 74, 69, 82, 77, 90],
    sources: [
      { key: 'srcSearch', pct: 41 },
      { key: 'srcDirect', pct: 34 },
      { key: 'srcSocial', pct: 19 },
      { key: 'srcReferral', pct: 6 },
    ],
    devices: [
      { key: 'devMobile', pct: 78 },
      { key: 'devDesktop', pct: 19 },
      { key: 'devTablet', pct: 3 },
    ],
    topPages: [
      { label: 'Início', v: 128000 },
      { label: 'Notícias', v: 74000 },
      { label: 'Elenco', v: 41000 },
      { label: 'Calendário', v: 33000 },
      { label: 'História', v: 21000 },
      { label: 'Seja Sócio', v: 18000 },
    ],
    topNews: titles.map((title, i) => ({ title, v: views[i] ?? 1000 })),
    ctas: [
      { label: 'Seja Sócio', v: 1240 },
      { label: 'Ingressos', v: 980 },
      { label: 'Lojas', v: 760 },
      { label: 'App', v: 420 },
    ],
  };
}

function liveSummary(events: StoredEvent[], news: { slug: string; title: string }[]): AnalyticsSummary {
  const pv = events.filter((e) => e.type === 'page_view');
  const pt = events.filter((e) => e.type === 'page_time' && typeof e.durationMs === 'number');
  const cta = events.filter((e) => e.type === 'cta_click');

  const visits = new Set(pv.map((e) => e.sessionId)).size;
  const uniques = new Set(pv.map((e) => e.visitorId)).size;
  const pageviews = pv.length;
  const avgMs = pt.length ? pt.reduce((a, b) => a + (b.durationMs || 0), 0) / pt.length : 0;

  const perSession: Record<string, number> = {};
  pv.forEach((e) => (perSession[e.sessionId] = (perSession[e.sessionId] || 0) + 1));
  const sessCount = Object.keys(perSession).length || 1;
  const bounced = Object.values(perSession).filter((c) => c <= 1).length;
  const bouncePct = Math.round((bounced / sessCount) * 100);

  const memberClicks = cta.filter((e) => (e.id || '').toLowerCase().includes('socio')).length;

  const kpis = [
    { key: 'kpiVisits', value: nf.format(visits) },
    { key: 'kpiUniques', value: nf.format(uniques) },
    { key: 'kpiPageviews', value: nf.format(pageviews) },
    { key: 'kpiAvgTime', value: fmtTime(avgMs) },
    { key: 'kpiBounce', value: `${bouncePct}%` },
    { key: 'kpiMembers', value: nf.format(memberClicks) },
  ];

  const today = Date.now();
  const series = Array.from({ length: 14 }, (_, i) => {
    const start = startOfDay(today - (13 - i) * DAY);
    const end = start + DAY;
    return pv.filter((e) => e.ts >= start && e.ts < end).length;
  });

  const srcCounts: Record<string, number> = {};
  pv.forEach((e) => {
    const s = e.source;
    if (s && s !== 'internal') {
      const k = SOURCE_KEY[s] || 'srcReferral';
      srcCounts[k] = (srcCounts[k] || 0) + 1;
    }
  });
  const sources = pct(Object.entries(srcCounts).map(([key, n]) => ({ key, n }))).sort((a, b) => b.pct - a.pct);

  const devCounts: Record<string, number> = { mobile: 0, desktop: 0, tablet: 0 };
  pv.forEach((e) => (devCounts[e.device] = (devCounts[e.device] || 0) + 1));
  const devices = pct([
    { key: 'devMobile', n: devCounts.mobile },
    { key: 'devDesktop', n: devCounts.desktop },
    { key: 'devTablet', n: devCounts.tablet },
  ]);

  const pageCounts: Record<string, number> = {};
  pv.forEach((e) => {
    let p = e.path || '/';
    if (p.length > 1) p = p.replace(/\/$/, '');
    pageCounts[p] = (pageCounts[p] || 0) + 1;
  });
  const topPages = Object.entries(pageCounts)
    .map(([p, v]) => ({ label: PAGE_LABELS[p] ?? p, v }))
    .sort((a, b) => b.v - a.v)
    .slice(0, 6);

  const newsCounts: Record<string, number> = {};
  pv.forEach((e) => {
    const m = /^\/noticias\/([^/?#]+)/.exec(e.path || '');
    if (m) newsCounts[m[1]] = (newsCounts[m[1]] || 0) + 1;
  });
  events
    .filter((e) => e.type === 'news_view' && e.slug)
    .forEach((e) => (newsCounts[e.slug!] = (newsCounts[e.slug!] || 0) + 1));
  const newsBySlug = new Map(news.map((n) => [n.slug, n.title]));
  const topNews = Object.entries(newsCounts)
    .map(([slug, v]) => ({ title: newsBySlug.get(slug) ?? slug, v }))
    .sort((a, b) => b.v - a.v)
    .slice(0, 5);

  const ctaCounts: Record<string, number> = {};
  const ctaLabel: Record<string, string> = {};
  cta.forEach((e) => {
    const id = e.id || 'cta';
    ctaCounts[id] = (ctaCounts[id] || 0) + 1;
    if (e.label) ctaLabel[id] = e.label;
  });
  const ctas = Object.entries(ctaCounts)
    .map(([id, v]) => ({ label: ctaLabel[id] ?? CTA_LABELS[id] ?? id, v }))
    .sort((a, b) => b.v - a.v)
    .slice(0, 6);

  return { source: 'live', kpis, series, sources, devices, topPages, topNews, ctas };
}

/** Resumo para o dashboard. Lê eventos persistidos (dev); cai no demo se não houver. */
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const events = await readEvents();
  const content = await readSiteContent().catch(() => null);
  const news = (content?.news ?? [])
    .filter((n) => n.status === 'published')
    .map((n) => ({ slug: n.slug, title: n.title.pt }));
  if (events.length < 1) return demoSummary(news.map((n) => n.title));
  return liveSummary(events, news);
}
