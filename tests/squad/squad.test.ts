import { describe, it, expect } from 'vitest';
import { groupPlayers, GROUP_ORDER, slugifyName, getPlayerBySlug } from '@/server/squad/squad';
import type { Player } from '@/server/squad/squad';

const players: Player[] = [
  { number: 9, name: 'B', group: 'atacantes', photo: '', country: 'BRA' },
  { number: 1, name: 'A', group: 'goleiros', photo: '', country: 'BRA' },
  { number: 7, name: 'C', group: 'atacantes', photo: '', country: 'BRA' },
];

describe('groupPlayers', () => {
  it('ordena os grupos por GROUP_ORDER e omite grupos vazios', () => {
    const groups = groupPlayers(players);
    expect(groups.map((g) => g.key)).toEqual(['goleiros', 'atacantes']);
  });

  it('ordena os jogadores por número dentro do grupo', () => {
    const groups = groupPlayers(players);
    const ataque = groups.find((g) => g.key === 'atacantes')!;
    expect(ataque.players.map((p) => p.number)).toEqual([7, 9]);
  });

  it('GROUP_ORDER cobre as cinco posições do gol ao ataque', () => {
    expect(GROUP_ORDER).toEqual(['goleiros', 'laterais', 'zagueiros', 'meio-campistas', 'atacantes']);
  });
});

describe('slugifyName', () => {
  it('remove acentos, espaços e caixa', () => {
    expect(slugifyName('Léo Vieira')).toBe('leo-vieira');
    expect(slugifyName('Renatinho')).toBe('renatinho');
    expect(slugifyName('João Pedro')).toBe('joao-pedro');
  });
});

describe('getPlayerBySlug', () => {
  it('encontra o jogador pelo slug do nome', () => {
    const p = getPlayerBySlug('everaldo');
    expect(p?.name).toBe('Everaldo');
  });
  it('retorna undefined para slug inexistente', () => {
    expect(getPlayerBySlug('nao-existe')).toBeUndefined();
  });
});
