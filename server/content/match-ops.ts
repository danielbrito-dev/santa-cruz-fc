/**
 * Pure (no I/O) helpers for matches + clubs CRUD.
 * Separate from match-actions.ts so tests can import without 'use server'.
 */
import type { SiteContent, MatchItem, Club, LocalizedText } from './types';

export const COMP_LABELS: Record<MatchItem['comp'], string> = {
  pernambucano: 'Pernambucano',
  nordeste: 'Copa do Nordeste',
  'copa-br': 'Copa do Brasil',
  'serie-c': 'Série C',
};

export interface MatchInput {
  comp: MatchItem['comp'];
  opponent: string;
  opponentShort: string;
  isHome: boolean;
  scoreHome: number | null;
  scoreAway: number | null;
  status: LocalizedText;
  matchCenterUrl: string;
}

export interface ClubInput {
  name: string;
  shortName: string;
  crestUrl: string | null;
}

function slugId(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function fromInput(input: MatchInput): Omit<MatchItem, 'id'> {
  return {
    competition: COMP_LABELS[input.comp],
    comp: input.comp,
    opponent: input.opponent,
    opponentShort: input.opponentShort,
    isHome: input.isHome,
    status: input.status,
    scoreHome: input.scoreHome,
    scoreAway: input.scoreAway,
    matchCenterUrl: input.matchCenterUrl || '#',
  };
}

// ── Matches ──────────────────────────────────────────────────────────────────
export function applyCreateMatch(content: SiteContent, input: MatchInput): SiteContent {
  const id = `${input.comp}-${slugId(input.opponentShort) || 'x'}-${Date.now().toString(36)}`;
  const match: MatchItem = { id, ...fromInput(input) };
  return { ...content, matches: [...content.matches, match] };
}

export function applyUpdateMatch(content: SiteContent, id: string, input: MatchInput): SiteContent {
  const matches = content.matches.map((m) => (m.id !== id ? m : { ...m, id, ...fromInput(input) }));
  return { ...content, matches };
}

export function applyDeleteMatch(content: SiteContent, id: string): SiteContent {
  return { ...content, matches: content.matches.filter((m) => m.id !== id) };
}

// ── Clubs ────────────────────────────────────────────────────────────────────
export function applyUpsertClub(content: SiteContent, input: ClubInput, id?: string): SiteContent {
  const clubs = content.clubs ?? [];
  if (id) {
    return {
      ...content,
      clubs: clubs.map((c) =>
        c.id !== id ? c : { ...c, name: input.name, shortName: input.shortName, crestUrl: input.crestUrl },
      ),
    };
  }
  const newId = slugId(input.name || input.shortName) || `club-${Date.now().toString(36)}`;
  const club: Club = { id: newId, name: input.name, shortName: input.shortName, crestUrl: input.crestUrl };
  return { ...content, clubs: [...clubs, club] };
}

export function applyDeleteClub(content: SiteContent, id: string): SiteContent {
  return { ...content, clubs: (content.clubs ?? []).filter((c) => c.id !== id) };
}
