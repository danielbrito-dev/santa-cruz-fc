import { describe, it, expect } from 'vitest';
import { routing } from '@/lib/i18n/routing';
import pt from '@/messages/pt.json';
import en from '@/messages/en.json';

describe('i18n', () => {
  it('has pt as default and supports pt+en', () => {
    expect(routing.defaultLocale).toBe('pt');
    expect(routing.locales).toEqual(['pt', 'en']);
  });
  it('pt and en catalogs have identical key shapes', () => {
    const keys = (o: any, p = ''): string[] =>
      Object.entries(o).flatMap(([k, v]) =>
        v && typeof v === 'object' ? keys(v, `${p}${k}.`) : [`${p}${k}`]);
    expect(keys(pt).sort()).toEqual(keys(en).sort());
  });
});
