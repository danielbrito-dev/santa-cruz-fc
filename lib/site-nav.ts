// Single source of truth for the site navigation (header + drawer + internal routes).
// `key` fields resolve against the `menu` i18n namespace (messages/{pt,en}.json).
// Aligned with the marketing-campaign IA (2026-06).

export interface NavItem {
  key: string;
  href: string;
}
export interface NavSection {
  key: string;
  items: NavItem[];
}

export const SITE_NAV: NavSection[] = [
  {
    key: 'oSanta',
    items: [
      { key: 'historia', href: '/o-santa/historia' },
      { key: 'titulos', href: '/o-santa/titulos' },
      { key: 'artilheiros', href: '/o-santa/artilheiros' },
      { key: 'simbolos', href: '/o-santa/simbolos' },
      { key: 'precursorInclusao', href: '/o-santa/precursor-da-inclusao' },
      { key: 'consulados', href: '/o-santa/consulados' },
      { key: 'enderecos', href: '/o-santa/enderecos' },
    ],
  },
  {
    key: 'futebol',
    items: [
      { key: 'elencoProfissional', href: '/elenco' },
      { key: 'comissaoTecnica', href: '/elenco#comissao' },
      { key: 'categoriasBase', href: '/futebol/categorias-de-base' },
      { key: 'calendario', href: '/futebol/calendario' },
      { key: 'resultados', href: '/futebol/resultados' },
    ],
  },
  {
    key: 'vivaSanta',
    items: [
      { key: 'sejaSocio', href: 'https://socio-santacruz.futebolcard.com/' },
      { key: 'experiencias', href: '/viva-o-santa/experiencias' },
      { key: 'censo', href: '/viva-o-santa/censo' },
      { key: 'tvCoral', href: '/viva-o-santa/tv-coral' },
      { key: 'lojas', href: '/viva-o-santa/lojas' },
    ],
  },
  {
    key: 'midia',
    items: [
      { key: 'noticias', href: '/midia/noticias' },
      { key: 'flickr', href: '/midia/fotos' },
      { key: 'guiaPartida', href: '/midia/guia-da-partida' },
      { key: 'pressKit', href: '/midia/press-kit' },
      { key: 'conteudoImprensa', href: '/midia/conteudo-imprensa' },
    ],
  },
  {
    key: 'clube',
    items: [
      { key: 'diretoria', href: '/clube/diretoria' },
      { key: 'transparencia', href: '/clube/transparencia' },
      { key: 'estatuto', href: '/clube/estatuto' },
      { key: 'documentos', href: '/clube/documentos' },
      { key: 'relatorios', href: '/clube/relatorios' },
    ],
  },
  {
    key: 'contato',
    items: [
      { key: 'faleConosco', href: '/contato/fale-conosco' },
      { key: 'trabalheConosco', href: '/contato/trabalhe-conosco' },
      { key: 'ouvidoria', href: '/contato/ouvidoria' },
    ],
  },
  {
    key: 'historias',
    items: [
      { key: 'explorarHistorias', href: '/historias/explorar' },
      { key: 'enviarHistoria', href: '/historias/enviar' },
      { key: 'historiasDestaque', href: '/historias/destaque' },
      { key: 'historiasCidade', href: '/historias/por-cidade' },
      { key: 'historiasGeracao', href: '/historias/por-geracao' },
    ],
  },
];

/** hrefs with a dedicated route (NOT handled by the generic [...path] InfoPage). */
const DEDICATED_ROUTES = new Set(['/elenco']);

/** Standalone footer/legal pages (not in the main nav). Rendered by InfoPage too. */
export const EXTRA_PAGES: { key: string; href: string; sectionKey: string }[] = [
  { key: 'ajuda', href: '/ajuda', sectionKey: 'ajuda' },
  { key: 'contato', href: '/ajuda/contato', sectionKey: 'ajuda' },
  { key: 'contatoImprensa', href: '/ajuda/contato-imprensa', sectionKey: 'ajuda' },
  { key: 'privacidade', href: '/privacidade', sectionKey: 'ajuda' },
  { key: 'cookies', href: '/cookies', sectionKey: 'ajuda' },
  { key: 'termos', href: '/termos-de-uso', sectionKey: 'ajuda' },
];

/** True for hrefs we generate as a generic InfoPage (internal, no hash, not dedicated). */
function isGeneratedPage(href: string): boolean {
  return href.startsWith('/') && !href.includes('#') && !DEDICATED_ROUTES.has(href);
}

/** Path segments for every generic InfoPage leaf (nav + extra), for generateStaticParams. */
export const INFO_PAGE_PATHS: string[][] = [
  ...SITE_NAV.flatMap((s) => s.items)
    .map((i) => i.href)
    .filter(isGeneratedPage),
  ...EXTRA_PAGES.map((p) => p.href),
].map((href) => href.split('/').filter(Boolean));

/** Resolve a catch-all path to the i18n keys for its breadcrumb section + title. */
export function resolvePage(
  path: string[],
): { sectionKey: string; titleKey: string } | null {
  const href = '/' + path.join('/');
  for (const section of SITE_NAV) {
    const item = section.items.find((i) => i.href === href);
    if (item) return { sectionKey: section.key, titleKey: item.key };
  }
  const extra = EXTRA_PAGES.find((p) => p.href === href);
  if (extra) return { sectionKey: extra.sectionKey, titleKey: extra.key };
  return null;
}
