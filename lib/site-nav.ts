// Single source of truth for the site navigation (header + drawer + internal routes).
// `key` fields resolve against the `menu` i18n namespace (messages/{pt,en}.json).

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
    key: 'clube',
    items: [
      { key: 'diretoria', href: '/clube/diretoria' },
      { key: 'consulados', href: '/clube/consulados' },
      { key: 'simbolos', href: '/clube/simbolos' },
      { key: 'endereco', href: '/clube/endereco' },
      { key: 'transparencia', href: '/clube/transparencia' },
    ],
  },
  {
    key: 'historia',
    items: [
      { key: 'oComeco', href: '/historia/o-comeco' },
      { key: 'titulos', href: '/historia/titulos' },
      { key: 'artilheiros', href: '/historia/artilheiros' },
      { key: 'precursorInclusao', href: '/historia/precursor-da-inclusao' },
    ],
  },
  {
    key: 'futebol',
    items: [{ key: 'elencoComissao', href: '/elenco' }],
  },
  {
    key: 'marketing',
    items: [
      { key: 'censo', href: '/marketing/censo' },
      { key: 'lojas', href: '/marketing/lojas' },
      { key: 'tvCoral', href: '/marketing/tv-coral' },
      { key: 'experiencias', href: '/marketing/experiencias' },
    ],
  },
  {
    key: 'imprensa',
    items: [
      { key: 'noticias', href: '/imprensa/noticias' },
      { key: 'fotos', href: '/imprensa/fotos' },
      { key: 'presskit', href: '/imprensa/presskit' },
      { key: 'fichaJogo', href: '/imprensa/ficha-de-jogo' },
    ],
  },
  {
    key: 'contato',
    items: [
      { key: 'faleConosco', href: '/contato/fale-conosco' },
      { key: 'trabalheConosco', href: '/contato/trabalhe-conosco' },
    ],
  },
];

/** hrefs that have a dedicated route (NOT handled by the generic [...path] InfoPage). */
const DEDICATED_ROUTES = new Set(['/elenco']);

/** Path segments for every generic InfoPage leaf (used by generateStaticParams). */
export const INFO_PAGE_PATHS: string[][] = SITE_NAV.flatMap((s) => s.items)
  .filter((i) => !DEDICATED_ROUTES.has(i.href))
  .map((i) => i.href.split('/').filter(Boolean));

/** Resolve a catch-all path (e.g. ['clube','diretoria']) to its nav section + item. */
export function findNavLeaf(
  path: string[],
): { section: NavSection; item: NavItem } | null {
  const href = '/' + path.join('/');
  for (const section of SITE_NAV) {
    const item = section.items.find((i) => i.href === href);
    if (item) return { section, item };
  }
  return null;
}
