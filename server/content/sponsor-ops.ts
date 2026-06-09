/**
 * Pure (no I/O) helpers for sponsors CRUD. Separate from actions so tests can import.
 */
import type { SiteContent, Sponsor } from './types';

export interface SponsorInput {
  name: string;
  logo: string;
  url: string;
  tier: Sponsor['tier'];
}

function slugId(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function applyCreateSponsor(content: SiteContent, input: SponsorInput): SiteContent {
  const maxPos = content.sponsors.reduce((m, s) => Math.max(m, s.position), -1);
  const id = `${slugId(input.name) || 'sponsor'}-${Date.now().toString(36)}`;
  const sponsor: Sponsor = {
    id,
    name: input.name,
    logo: input.logo,
    url: input.url,
    tier: input.tier,
    position: maxPos + 1,
  };
  return { ...content, sponsors: [...content.sponsors, sponsor] };
}

export function applyUpdateSponsor(content: SiteContent, id: string, input: SponsorInput): SiteContent {
  return {
    ...content,
    sponsors: content.sponsors.map((s) =>
      s.id !== id ? s : { ...s, name: input.name, logo: input.logo, url: input.url, tier: input.tier },
    ),
  };
}

export function applyDeleteSponsor(content: SiteContent, id: string): SiteContent {
  return { ...content, sponsors: content.sponsors.filter((s) => s.id !== id) };
}
