import { describe, it, expect } from 'vitest';
import { resolveTheme, THEMES, THEME_STORAGE_KEY } from '@/lib/theme';

describe('resolveTheme', () => {
  it('uses a valid stored theme over system preference', () => {
    expect(resolveTheme('dark', false)).toBe('dark');
    expect(resolveTheme('light', true)).toBe('light');
  });
  it('falls back to system preference when nothing valid is stored', () => {
    expect(resolveTheme(null, true)).toBe('dark');
    expect(resolveTheme(null, false)).toBe('light');
    expect(resolveTheme('bogus', true)).toBe('dark');
  });
  it('defaults to light when no signal at all', () => {
    expect(resolveTheme(null, false)).toBe('light');
  });
  it('exposes the storage key and theme list', () => {
    expect(THEME_STORAGE_KEY).toBe('theme');
    expect(THEMES).toEqual(['light', 'dark']);
  });
});
