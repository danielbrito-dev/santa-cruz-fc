import { describe, it, expect } from 'vitest';
import { SITE_PAGES, getPageData } from '@/lib/site-pages';

const PHASE_A = [
  '/o-santa/historia',
  '/o-santa/precursor-da-inclusao',
  '/privacidade',
  '/cookies',
  '/termos-de-uso',
  '/ajuda',
];

describe('site-pages registry', () => {
  it('tem entrada para cada página da Fase A', () => {
    for (const href of PHASE_A) expect(SITE_PAGES[href]).toBeDefined();
  });
  it('toda entrada tem um archetype válido', () => {
    const valid = new Set([
      'editorial',
      'legal',
      'faq',
      'achievements',
      'people',
      'locations',
      'documents',
      'gallery',
      'listing',
      'landing',
      'form',
      'stories',
      'feature',
    ]);
    for (const data of Object.values(SITE_PAGES)) expect(valid.has(data.archetype)).toBe(true);
  });

  it('Títulos é achievements com dados reais (Fita Azul/Copa do Nordeste)', () => {
    const d = getPageData('/o-santa/titulos');
    expect(d?.archetype).toBe('achievements');
    expect(JSON.stringify(d)).toContain('Fita Azul');
  });
  it('Endereços é locations com o Arruda', () => {
    const d = getPageData('/o-santa/enderecos');
    expect(d?.archetype).toBe('locations');
    expect(JSON.stringify(d)).toContain('Arruda');
  });
  it('Diretoria é people', () => {
    expect(getPageData('/clube/diretoria')?.archetype).toBe('people');
  });
  it('getPageData devolve a entrada e undefined p/ href desconhecido', () => {
    expect(getPageData('/privacidade')?.archetype).toBe('legal');
    expect(getPageData('/nao-existe')).toBeUndefined();
  });
  it('História é um feature com dados reais (1914 / Fita Azul)', () => {
    const h = getPageData('/o-santa/historia');
    expect(h?.archetype).toBe('feature');
    expect(JSON.stringify(h)).toContain('1914');
    expect(JSON.stringify(h)).toContain('Fita Azul');
  });
});
