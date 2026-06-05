import { describe, it, expect } from 'vitest';
import { applyCreate, applyUpdate, applyDelete } from '@/server/content/news-ops';
import type { NewsInput } from '@/server/content/news-ops';
import { SiteContentSchema } from '@/server/content/schema';
import type { SiteContent } from '@/server/content/types';

// ---------------------------------------------------------------------------
// Minimal fixture — enough fields to satisfy SiteContentSchema
// ---------------------------------------------------------------------------
const baseContent: SiteContent = {
  hero: {
    tagline: { pt: 'Coral não recua.', en: 'Coral never backs down.' },
    ctaLabel: { pt: 'Garantir ingresso', en: 'Get tickets' },
    ctaUrl: '#',
    backdrop: '/images/torcida1.jpg',
    titleLine1: { pt: 'Coral não', en: 'Coral never' },
    titleLine2: { pt: 'recua.', en: 'backs down.' },
  },
  matches: [],
  news: [
    {
      id: 'existing-1',
      slug: 'existing-1',
      tag: { pt: 'Destaque', en: 'Featured' },
      title: { pt: 'Notícia existente', en: 'Existing news' },
      excerpt: { pt: '', en: '' },
      body: { pt: '', en: '' },
      coverImage: '/images/cover.jpg',
      photoCount: 0,
      publishedAt: '2026-01-01T00:00:00',
      featured: true,
      position: 0,
      status: 'published',
    },
    {
      id: 'existing-2',
      slug: 'existing-2',
      tag: { pt: 'Futebol', en: 'Football' },
      title: { pt: 'Segunda notícia', en: 'Second news' },
      excerpt: { pt: '', en: '' },
      body: { pt: '', en: '' },
      coverImage: '/images/cover2.jpg',
      photoCount: 5,
      publishedAt: '2026-01-02T00:00:00',
      featured: false,
      position: 1,
      status: 'published',
    },
  ],
  banners: [],
  institutional: [],
  sponsors: [],
  social: [],
  footer: {
    brandBlurb: { pt: 'Blurb', en: 'Blurb' },
    columns: [],
    chantLine1: { pt: 'É', en: "It's" },
    chantEmphasis: { pt: 'tradição,', en: 'tradition,' },
    chantLine2: { pt: 'não é moda.', en: 'not a trend.' },
  },
};

const newInput: NewsInput = {
  slug: 'nova-noticia',
  tag: { pt: 'Base', en: 'Youth' },
  title: { pt: 'Nova notícia', en: 'New news' },
  excerpt: { pt: '', en: '' },
  body: { pt: 'Texto completo', en: 'Full text' },
  coverImage: '/images/new.jpg',
  photoCount: 0,
  featured: false,
  status: 'published',
  publishedAt: '2026-06-01T00:00:00',
};

// ---------------------------------------------------------------------------

describe('applyCreate', () => {
  it('appends a new item with incremented position', () => {
    const result = applyCreate(baseContent, newInput);
    expect(result.news).toHaveLength(3);
    const created = result.news[2];
    expect(created.position).toBe(2); // max(0,1) + 1
    expect(created.slug).toBe('nova-noticia');
    expect(created.status).toBe('published');
  });

  it('generates a unique id based on slug', () => {
    const r1 = applyCreate(baseContent, newInput);
    const r2 = applyCreate(baseContent, { ...newInput, slug: 'outra-noticia' });
    expect(r1.news[2].id).toContain('nova-noticia');
    expect(r2.news[2].id).toContain('outra-noticia');
  });

  it('preserves all existing news items', () => {
    const result = applyCreate(baseContent, newInput);
    expect(result.news[0].id).toBe('existing-1');
    expect(result.news[1].id).toBe('existing-2');
  });

  it('preserves other content blocks (sponsors, matches) unchanged', () => {
    const contentWithSponsors: SiteContent = {
      ...baseContent,
      sponsors: [{ id: 's1', name: 'Sponsor', logo: '/l.png', url: '#', tier: 'master', position: 0 }],
      matches: [
        {
          id: 'm1', competition: 'Pernambucano', comp: 'pernambucano',
          opponent: 'Náutico', opponentShort: 'NAU', isHome: true,
          status: { pt: 'FINAL', en: 'FINAL' }, scoreHome: 2, scoreAway: 0,
          matchCenterUrl: '#',
        },
      ],
    };
    const result = applyCreate(contentWithSponsors, newInput);
    expect(result.sponsors).toStrictEqual(contentWithSponsors.sponsors);
    expect(result.matches).toStrictEqual(contentWithSponsors.matches);
  });

  it('works with a draft status', () => {
    const result = applyCreate(baseContent, { ...newInput, status: 'draft' });
    expect(result.news[2].status).toBe('draft');
  });

  it('result passes SiteContentSchema validation', () => {
    const result = applyCreate(baseContent, newInput);
    expect(() => SiteContentSchema.parse(result)).not.toThrow();
  });
});

describe('applyUpdate', () => {
  it('replaces the item matching the given id', () => {
    const result = applyUpdate(baseContent, 'existing-2', {
      ...newInput,
      slug: 'existing-2-updated',
      title: { pt: 'Atualizado', en: 'Updated' },
    });
    const updated = result.news.find((n) => n.id === 'existing-2');
    expect(updated).toBeDefined();
    expect(updated!.title.pt).toBe('Atualizado');
    expect(updated!.slug).toBe('existing-2-updated');
  });

  it('preserves the id of the updated item', () => {
    const result = applyUpdate(baseContent, 'existing-2', newInput);
    const updated = result.news.find((n) => n.id === 'existing-2');
    expect(updated!.id).toBe('existing-2');
  });

  it('preserves the position of the updated item', () => {
    const result = applyUpdate(baseContent, 'existing-2', newInput);
    const updated = result.news.find((n) => n.id === 'existing-2');
    expect(updated!.position).toBe(1);
  });

  it('does not touch other news items', () => {
    const result = applyUpdate(baseContent, 'existing-2', newInput);
    const untouched = result.news.find((n) => n.id === 'existing-1');
    expect(untouched).toStrictEqual(baseContent.news[0]);
  });

  it('does not touch other content blocks', () => {
    const result = applyUpdate(baseContent, 'existing-1', newInput);
    expect(result.sponsors).toStrictEqual(baseContent.sponsors);
    expect(result.matches).toStrictEqual(baseContent.matches);
  });

  it('result passes SiteContentSchema validation', () => {
    const result = applyUpdate(baseContent, 'existing-1', newInput);
    expect(() => SiteContentSchema.parse(result)).not.toThrow();
  });
});

describe('applyDelete', () => {
  it('removes the item with the given id', () => {
    const result = applyDelete(baseContent, 'existing-1');
    expect(result.news).toHaveLength(1);
    expect(result.news[0].id).toBe('existing-2');
  });

  it('keeps all other news items intact', () => {
    const result = applyDelete(baseContent, 'existing-1');
    expect(result.news[0]).toStrictEqual(baseContent.news[1]);
  });

  it('does not touch other content blocks', () => {
    const result = applyDelete(baseContent, 'existing-1');
    expect(result.sponsors).toStrictEqual(baseContent.sponsors);
    expect(result.matches).toStrictEqual(baseContent.matches);
  });

  it('result passes SiteContentSchema validation', () => {
    const result = applyDelete(baseContent, 'existing-2');
    expect(() => SiteContentSchema.parse(result)).not.toThrow();
  });

  it('no-op for unknown id (returns content with all items)', () => {
    const result = applyDelete(baseContent, 'does-not-exist');
    expect(result.news).toHaveLength(2);
  });
});
