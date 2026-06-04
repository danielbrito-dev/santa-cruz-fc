import { describe, it, expect } from 'vitest';
import { resolveLocalized } from '@/server/content/localized';

describe('resolveLocalized', () => {
  const t = { pt: 'Notícias', en: 'News' };
  it('returns the value for the requested locale', () => {
    expect(resolveLocalized(t, 'en')).toBe('News');
  });
  it('falls back to pt when the locale value is missing', () => {
    expect(resolveLocalized({ pt: 'Só PT' } as any, 'en')).toBe('Só PT');
  });
  it('returns an explicit empty string without falling back to pt', () => {
    // Locks the `??` (not `||`) contract: "" is a valid, intentional translation.
    expect(resolveLocalized({ pt: 'Texto PT', en: '' }, 'en')).toBe('');
  });
  it('returns empty string when both locale and pt are absent', () => {
    // Covers the final `?? ''` fallback — ensures "" is returned, not undefined.
    expect(resolveLocalized({} as any, 'en')).toBe('');
  });
});
