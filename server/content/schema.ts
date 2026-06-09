import { z } from 'zod';

const localized = z.object({ pt: z.string(), en: z.string() });

const match = z.object({
  id: z.string(), competition: z.string(),
  comp: z.enum(['pernambucano', 'nordeste', 'copa-br', 'serie-c']),
  opponent: z.string(), opponentShort: z.string(), isHome: z.boolean(),
  status: localized, scoreHome: z.number().nullable(), scoreAway: z.number().nullable(),
  matchCenterUrl: z.string(),
});
const club = z.object({
  id: z.string(), name: z.string(), shortName: z.string(),
  crestUrl: z.string().nullable(), rival: z.boolean().optional(),
});
const news = z.object({
  id: z.string(), slug: z.string(), tag: localized, title: localized, excerpt: localized,
  body: localized, coverImage: z.string(), photoCount: z.number(), publishedAt: z.string(),
  featured: z.boolean(), position: z.number(),
  status: z.enum(['draft', 'published', 'archived']),
});
const card = z.object({
  id: z.string(), eyebrow: localized, title: localized, image: z.string(),
  ctaLabel: localized, ctaUrl: z.string(), size: z.enum(['span', 'normal']), position: z.number(),
});
const sponsor = z.object({
  id: z.string(), name: z.string(), logo: z.string(), url: z.string(),
  tier: z.enum(['master', 'fornecedor', 'apoio']), position: z.number(),
});
const social = z.object({ id: z.string(), network: z.string(), url: z.string() });
const footerColumn = z.object({
  heading: localized, links: z.array(z.object({ label: localized, url: z.string() })),
});

export const SiteContentSchema = z.object({
  hero: z.object({
    tagline: localized, ctaLabel: localized, ctaUrl: z.string(), backdrop: z.string(),
    titleLine1: localized, titleLine2: localized,
  }),
  matches: z.array(match),
  clubs: z.array(club).default([]),
  news: z.array(news),
  banners: z.array(card),
  institutional: z.array(card),
  sponsors: z.array(sponsor),
  social: z.array(social),
  footer: z.object({
    brandBlurb: localized, columns: z.array(footerColumn),
    chantLine1: localized, chantEmphasis: localized, chantLine2: localized,
  }),
});
