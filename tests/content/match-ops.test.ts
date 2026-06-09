import { describe, it, expect } from 'vitest';
import {
  applyCreateMatch,
  applyUpdateMatch,
  applyDeleteMatch,
  applyUpsertClub,
  applyDeleteClub,
  COMP_LABELS,
  type MatchInput,
  type ClubInput,
} from '@/server/content/match-ops';
import type { SiteContent } from '@/server/content/types';

const base = { clubs: [], matches: [] } as unknown as SiteContent;

const matchInput: MatchInput = {
  comp: 'nordeste',
  opponent: 'Bahia',
  opponentShort: 'BAH',
  isHome: true,
  scoreHome: 2,
  scoreAway: 1,
  status: { pt: 'SÁB · FINAL', en: 'SAT · FINAL' },
  matchCenterUrl: '#',
};

const clubInput: ClubInput = { name: 'Sport', shortName: 'SPO', crestUrl: 'https://x/sport.png' };

describe('match-ops · matches', () => {
  it('cria partida com label de competição derivado de comp', () => {
    const next = applyCreateMatch(base, matchInput);
    expect(next.matches).toHaveLength(1);
    expect(next.matches[0].competition).toBe(COMP_LABELS.nordeste);
    expect(next.matches[0].opponent).toBe('Bahia');
    expect(next.matches[0].scoreHome).toBe(2);
    expect(next.matches[0].id).toContain('nordeste');
  });

  it('atualiza preservando o id', () => {
    const created = applyCreateMatch(base, matchInput);
    const id = created.matches[0].id;
    const next = applyUpdateMatch(created, id, { ...matchInput, scoreHome: 5, isHome: false });
    expect(next.matches[0].id).toBe(id);
    expect(next.matches[0].scoreHome).toBe(5);
    expect(next.matches[0].isHome).toBe(false);
  });

  it('exclui por id', () => {
    const created = applyCreateMatch(base, matchInput);
    const id = created.matches[0].id;
    expect(applyDeleteMatch(created, id).matches).toHaveLength(0);
  });
});

describe('match-ops · clubs', () => {
  it('cria clube novo quando sem id', () => {
    const next = applyUpsertClub(base, clubInput);
    expect(next.clubs).toHaveLength(1);
    expect(next.clubs[0].shortName).toBe('SPO');
    expect(next.clubs[0].id).toBe('sport');
  });

  it('atualiza clube existente quando com id', () => {
    const created = applyUpsertClub(base, clubInput);
    const id = created.clubs[0].id;
    const next = applyUpsertClub(created, { ...clubInput, crestUrl: null }, id);
    expect(next.clubs).toHaveLength(1);
    expect(next.clubs[0].crestUrl).toBeNull();
  });

  it('exclui clube por id', () => {
    const created = applyUpsertClub(base, clubInput);
    expect(applyDeleteClub(created, created.clubs[0].id).clubs).toHaveLength(0);
  });
});
