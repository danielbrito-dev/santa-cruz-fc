// Cliente único de tracking. As telas chamam estas funções; o transporte
// (sendBeacon → /api/track) fica isolado aqui. Na infra, o endpoint grava no DB.

const VKEY = 'sc_vid';
const SKEY = 'sc_sid';

function uid(): string {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    /* noop */
  }
  return 'x' + Math.abs(Date.now() ^ (Math.random() * 1e9)).toString(36);
}
function visitorId(): string {
  try {
    let v = localStorage.getItem(VKEY);
    if (!v) {
      v = uid();
      localStorage.setItem(VKEY, v);
    }
    return v;
  } catch {
    return 'anon';
  }
}
function sessionId(): string {
  try {
    let v = sessionStorage.getItem(SKEY);
    if (!v) {
      v = uid();
      sessionStorage.setItem(SKEY, v);
    }
    return v;
  } catch {
    return 'anon';
  }
}

type Payload = Record<string, unknown> & { type: string; path: string };

function send(body: Payload): void {
  if (typeof window === 'undefined') return;
  const data = JSON.stringify({ ...body, sessionId: sessionId(), visitorId: visitorId() });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', new Blob([data], { type: 'application/json' }));
      return;
    }
  } catch {
    /* cai no fetch */
  }
  try {
    void fetch('/api/track', { method: 'POST', body: data, headers: { 'content-type': 'application/json' }, keepalive: true });
  } catch {
    /* best-effort */
  }
}

export function trackPageView(path: string, title?: string, referrer?: string, locale?: string): void {
  send({ type: 'page_view', path, title, referrer, locale });
}
export function trackPageTime(path: string, durationMs: number): void {
  send({ type: 'page_time', path, durationMs });
}
export function trackCta(id: string, path: string, label?: string): void {
  send({ type: 'cta_click', id, path, label });
}
export function trackNewsView(slug: string, title: string | undefined, path: string): void {
  send({ type: 'news_view', slug, title, path });
}
