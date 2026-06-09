/**
 * Pure (no I/O) helpers for squad CRUD (players + coaching staff).
 */
import type { Squad, Player, PlayerStats, PositionGroupKey } from './squad';

export interface PlayerInput {
  number: number;
  name: string;
  group: PositionGroupKey;
  country: string;
  photo: string;
  age?: number;
  birthDate?: string;
  stats?: PlayerStats;
}

export interface StaffInput {
  rolePt: string;
  roleEn: string;
  name: string;
}

function toPlayer(input: PlayerInput, prev?: Player): Player {
  // preserva campos não-editados pelo form (thumb/bg/bio/birthPlace/height/joinedAt)
  return {
    ...(prev ?? {}),
    number: input.number,
    name: input.name,
    group: input.group,
    country: input.country,
    photo: input.photo,
    age: input.age,
    birthDate: input.birthDate,
    stats: input.stats,
  } as Player;
}

// ── Players (identificados pelo número) ──────────────────────────────────────
export function applyCreatePlayer(squad: Squad, input: PlayerInput): Squad {
  return { ...squad, players: [...squad.players, toPlayer(input)] };
}
export function applyUpdatePlayer(squad: Squad, number: number, input: PlayerInput): Squad {
  return {
    ...squad,
    players: squad.players.map((p) => (p.number === number ? toPlayer(input, p) : p)),
  };
}
export function applyDeletePlayer(squad: Squad, number: number): Squad {
  return { ...squad, players: squad.players.filter((p) => p.number !== number) };
}

// ── Comissão técnica (identificada pelo índice) ──────────────────────────────
export function applyUpsertStaff(squad: Squad, input: StaffInput, index?: number): Squad {
  const member = { role: { pt: input.rolePt, en: input.roleEn }, name: input.name };
  if (index === undefined || index < 0 || index >= squad.staff.length) {
    return { ...squad, staff: [...squad.staff, member] };
  }
  return { ...squad, staff: squad.staff.map((m, i) => (i === index ? member : m)) };
}
export function applyDeleteStaff(squad: Squad, index: number): Squad {
  return { ...squad, staff: squad.staff.filter((_, i) => i !== index) };
}
