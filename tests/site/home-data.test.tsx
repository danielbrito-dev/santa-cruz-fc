import { describe, it, expect } from 'vitest';
import { getServerApi } from '@/lib/trpc/server';

describe('home data', () => {
  it('server api yields matches and news for the page', async () => {
    const api = await getServerApi();
    const content = await api.content.site();
    expect(content.matches.length).toBe(8);
    expect(content.news.some((n) => n.featured)).toBe(true);
  });
});
