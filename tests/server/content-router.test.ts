import { describe, it, expect } from 'vitest';
import { appRouter } from '@/server/routers/_app';
import { createContext } from '@/server/trpc';

describe('content router', () => {
  it('content.site returns the full site content', async () => {
    const caller = appRouter.createCaller(await createContext());
    const site = await caller.content.site();
    expect(site.hero.ctaUrl).toBeDefined();
    expect(site.matches.length).toBeGreaterThan(0);
  });
});
