import { describe, it, expect, afterAll } from 'vitest';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { readSiteContent, writeSiteContent } from '@/server/content/store';
import { SiteContentSchema } from '@/server/content/schema';

const TMP = path.join(process.cwd(), 'tests', '.tmp-site.json');

describe('content store', () => {
  afterAll(async () => { await fs.rm(TMP, { force: true }); });

  it('reads the real site.json (8 matches, 12 sponsors)', async () => {
    const c = await readSiteContent();
    expect(c.matches).toHaveLength(8);
    expect(c.sponsors).toHaveLength(12);
  });

  it('schema accepts the real site.json', async () => {
    const c = await readSiteContent();
    expect(SiteContentSchema.safeParse(c).success).toBe(true);
  });

  it('schema rejects malformed content', () => {
    expect(SiteContentSchema.safeParse({ hero: {} }).success).toBe(false);
  });

  it('write→read round-trips against a temp file', async () => {
    const c = await readSiteContent();
    c.hero.titleLine1.pt = 'TESTE';
    const res = await writeSiteContent(c, TMP);
    expect(res).toEqual({ ok: true });
    const back = await readSiteContent(TMP);
    expect(back.hero.titleLine1.pt).toBe('TESTE');
  });

  it('write returns {invalid} for malformed content', async () => {
    const res = await writeSiteContent({ nope: true }, TMP);
    expect(res).toEqual({ ok: false, error: 'invalid' });
  });
});
