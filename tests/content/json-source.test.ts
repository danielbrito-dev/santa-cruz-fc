import { describe, it, expect, beforeEach } from 'vitest';
import { JsonContentSource } from '@/server/content/json-source';
import { getContentSource } from '@/server/content/index';

describe('JsonContentSource', () => {
  const source = new JsonContentSource();
  it('loads site content from content/site.json', async () => {
    const c = await source.getSiteContent();
    expect(c.hero.titleLine1.pt).toBe('Coral não');
    expect(c.hero.titleLine1.en).toBeTruthy();
  });
  it('exposes a featured news item at position 0', async () => {
    const c = await source.getSiteContent();
    const featured = c.news.find((n) => n.featured);
    expect(featured).toBeDefined();
    expect(featured!.position).toBe(0);
  });
  it('has 4 matches and 12 sponsors', async () => {
    const c = await source.getSiteContent();
    expect(c.matches).toHaveLength(4);
    expect(c.sponsors).toHaveLength(12);
  });
});

describe('getContentSource singleton', () => {
  it('returns the same instance on repeated calls (singleton contract)', () => {
    const a = getContentSource();
    const b = getContentSource();
    // If the singleton guard were replaced with `if (true)`, a new instance
    // would be created on every call and this assertion would fail.
    expect(a).toBe(b);
  });
});
