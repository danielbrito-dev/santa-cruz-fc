'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView, trackPageTime, trackCta, trackNewsView } from '@/lib/analytics/track';

/** Remove o prefixo de locale para gravar caminhos agnósticos ('/', '/noticias'). */
function normalize(pathname: string): string {
  const p = pathname.replace(/^\/(pt|en)(?=\/|$)/, '');
  return p === '' ? '/' : p;
}
function isPrivate(pathname: string): boolean {
  return /\/admin(\/|$)|\/entrar(\/|$)|\/login(\/|$)/.test(pathname);
}

/**
 * Rastreia pageviews + tempo de página e cliques em CTAs/notícias (delegação:
 * qualquer elemento com [data-cta] ou [data-news]). Não rastreia o admin.
 */
export function AnalyticsTracker() {
  const pathname = usePathname();
  const ref = useRef<{ path: string; start: number; done: boolean }>({ path: '', start: 0, done: false });

  // Pageview + tempo de permanência
  useEffect(() => {
    if (typeof window === 'undefined' || isPrivate(pathname)) return;
    const path = normalize(pathname);
    ref.current = { path, start: performance.now(), done: false };
    trackPageView(path, document.title, document.referrer, document.documentElement.lang || undefined);
    return () => {
      const r = ref.current;
      if (r.path === path && !r.done) {
        r.done = true;
        trackPageTime(path, Math.round(performance.now() - r.start));
      }
    };
  }, [pathname]);

  // Finaliza tempo ao sair/ocultar a aba
  useEffect(() => {
    const finalize = () => {
      const r = ref.current;
      if (r.path && !r.done) {
        r.done = true;
        trackPageTime(r.path, Math.round(performance.now() - r.start));
      }
    };
    const onVis = () => {
      if (document.visibilityState === 'hidden') finalize();
    };
    window.addEventListener('pagehide', finalize);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('pagehide', finalize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  // Cliques delegados em CTAs e notícias
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const el = target?.closest?.('[data-cta],[data-news]') as HTMLElement | null;
      if (!el) return;
      const path = normalize(window.location.pathname);
      const cta = el.getAttribute('data-cta');
      if (cta) trackCta(cta, path, el.getAttribute('data-cta-label') || undefined);
      const news = el.getAttribute('data-news');
      if (news) trackNewsView(news, el.getAttribute('data-news-title') || undefined, path);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  return null;
}
