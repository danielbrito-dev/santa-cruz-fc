/** Pure helper: upsert de conteúdo editável de página institucional (content.pages). */
import type { SiteContent, PageContent } from './types';

export type PageInput = PageContent;

export function applySavePage(content: SiteContent, input: PageInput): SiteContent {
  const pages = content.pages.some((p) => p.href === input.href)
    ? content.pages.map((p) => (p.href === input.href ? input : p))
    : [...content.pages, input];
  return { ...content, pages };
}
