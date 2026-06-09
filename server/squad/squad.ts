import data from '@/content/squad.json';
import type { LocalizedText } from '@/server/content/types';

export type PositionGroupKey =
  | 'goleiros'
  | 'laterais'
  | 'zagueiros'
  | 'volantes'
  | 'meias'
  | 'pontas'
  | 'centroavantes';

/** Ordem canônica de exibição das posições (do gol pro ataque). */
export const GROUP_ORDER: PositionGroupKey[] = [
  'goleiros',
  'laterais',
  'zagueiros',
  'volantes',
  'meias',
  'pontas',
  'centroavantes',
];

export interface Player {
  number: number;
  name: string;
  group: PositionGroupKey;
  photo: string;
  thumb?: string; // miniatura leve p/ o grid do elenco (cai em `photo` se ausente)
  bg?: string;    // cor exata do fundo da foto → hero da ficha funde com ela
  country: string;
  // Optional fields used by the athlete detail page.
  age?: number;
  birthDate?: string;
  birthPlace?: string;
  height?: string;
  joinedAt?: string;
  bio?: LocalizedText;
  stats?: PlayerStats; // números na Série C (Press Kit)
}

/** Números do jogador na competição (Press Kit). */
export interface PlayerStats {
  jogos: number;
  gols: number;
  assist: number;
}

export interface StaffMember {
  role: LocalizedText;
  name: string;
}

export interface Squad {
  season: string;
  players: Player[];
  staff: StaffMember[];
}

export interface PlayerGroup {
  key: PositionGroupKey;
  players: Player[];
}

// Import estático do JSON (resolveJsonModule). Sem I/O em runtime — empacotado no build.
const squad = data as unknown as Squad;

export function getSquad(): Squad {
  return squad;
}

/** Agrupa por posição na ordem de GROUP_ORDER; ordena por número; omite grupos vazios. */
export function groupPlayers(players: Player[]): PlayerGroup[] {
  return GROUP_ORDER.map((key) => ({
    key,
    players: players
      .filter((p) => p.group === key)
      .sort((a, b) => a.number - b.number),
  })).filter((g) => g.players.length > 0);
}

/** Slug a partir do nome (sem acentos, minúsculo, hifenizado) — usado na rota /elenco/[slug]. */
export function slugifyName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '') // strip combining diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function getPlayerBySlug(slug: string): Player | undefined {
  return getSquad().players.find((p) => slugifyName(p.name) === slug);
}
