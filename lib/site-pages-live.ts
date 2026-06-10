import type { SiteContent } from '@/server/content/types';
import { readSiteContent } from '@/server/content/store';
import { getPageData, EDITABLE_PAGES, type PageData, type ListingData } from './site-pages';

// Overlay RUNTIME sobre o registry estático: as partes derivadas do store
// (galeria, documentos, histórias, notícias, jogos, overrides de Páginas) são
// recalculadas a partir do conteúdo vivo (DB-first). Em falha, vale o estático.

const DOC_PAGES: Record<string, string> = {
  '/clube/transparencia': 'transparencia',
  '/clube/estatuto': 'estatuto',
  '/clube/documentos': 'documentos',
  '/clube/relatorios': 'relatorios',
  '/midia/guia-da-partida': 'guia-da-partida',
  '/midia/press-kit': 'press-kit',
  '/midia/conteudo-imprensa': 'conteudo-imprensa',
};
const MATCH_LISTINGS = new Set(['/futebol/calendario', '/futebol/resultados']);
const EDITABLE = new Set(EDITABLE_PAGES.map((p) => p.href));

function newsItems(c: SiteContent): ListingData['items'] {
  return c.news
    .filter((n) => n.status === 'published')
    .map((n) => ({
      tag: n.tag.pt,
      title: n.title.pt,
      meta: n.publishedAt.slice(0, 10).split('-').reverse().join('/'),
      href: `/noticias/${n.slug}`,
    }));
}
function matchItems(c: SiteContent): ListingData['items'] {
  return c.matches.map((m) => ({
    group: m.competition,
    tag: m.competition,
    title: m.isHome ? `Santa Cruz × ${m.opponent}` : `${m.opponent} × Santa Cruz`,
    meta: m.scoreHome != null && m.scoreAway != null ? `${m.scoreHome} – ${m.scoreAway}` : 'A definir',
  }));
}

export async function getPageDataLive(href: string): Promise<PageData | undefined> {
  const base = getPageData(href);
  if (!base) return base;

  let c: SiteContent;
  try {
    c = await readSiteContent();
  } catch {
    return base;
  }

  if (base.archetype === 'gallery' && href === '/midia/fotos') {
    return { ...base, images: c.gallery.map((g) => ({ src: g.src, alt: g.alt })) };
  }
  if (base.archetype === 'documents' && DOC_PAGES[href]) {
    const page = DOC_PAGES[href];
    const items = c.documents
      .filter((d) => d.page === page)
      .map((d) => ({ title: d.title, kind: d.kind, meta: d.meta || undefined, href: d.href }));
    return { ...base, items };
  }
  if (base.archetype === 'stories') {
    const stories = c.stories
      .filter((s) => s.status === 'published')
      .map((s) => ({ author: s.author, city: s.city, generation: s.generation, excerpt: s.excerpt, featured: s.featured }));
    return { ...base, stories };
  }
  if (base.archetype === 'listing' && href === '/midia/noticias') {
    return { ...base, items: newsItems(c) };
  }
  if (base.archetype === 'listing' && MATCH_LISTINGS.has(href)) {
    return { ...base, items: matchItems(c) };
  }
  if (base.archetype === 'editorial' && EDITABLE.has(href)) {
    const ov = c.pages.find((p) => p.href === href);
    return ov ? { ...base, lead: ov.lead, sections: ov.sections } : base;
  }
  return base;
}
