import { promises as fs } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import type { Squad } from './squad';

const SQUAD_PATH = path.join(process.cwd(), 'content', 'squad.json');

const localized = z.object({ pt: z.string(), en: z.string() });
const player = z.object({
  number: z.number(),
  name: z.string(),
  group: z.enum(['goleiros', 'laterais', 'zagueiros', 'volantes', 'meias', 'pontas', 'centroavantes']),
  photo: z.string(),
  thumb: z.string().optional(),
  bg: z.string().optional(),
  country: z.string(),
  age: z.number().optional(),
  birthDate: z.string().optional(),
  birthPlace: z.string().optional(),
  height: z.string().optional(),
  joinedAt: z.string().optional(),
  bio: localized.optional(),
  stats: z.object({ jogos: z.number(), gols: z.number(), assist: z.number() }).optional(),
});
const staff = z.object({ role: localized, name: z.string() });
export const SquadSchema = z.object({
  season: z.string(),
  players: z.array(player),
  staff: z.array(staff),
});

/** Lê o elenco do arquivo (runtime) — usado pelo admin. */
export async function readSquadFile(file: string = SQUAD_PATH): Promise<Squad> {
  const raw = await fs.readFile(file, 'utf8');
  return JSON.parse(raw) as Squad;
}

export type WriteResult = { ok: true } | { ok: false; error: 'invalid' | 'readonly' | 'unknown' };

export async function writeSquadFile(squad: unknown, file: string = SQUAD_PATH): Promise<WriteResult> {
  const parsed = SquadSchema.safeParse(squad);
  if (!parsed.success) return { ok: false, error: 'invalid' };
  try {
    await fs.writeFile(file, JSON.stringify(parsed.data, null, 2) + '\n', 'utf8');
    return { ok: true };
  } catch (e: unknown) {
    const code = (e as NodeJS.ErrnoException)?.code;
    if (code === 'EROFS' || code === 'EACCES' || code === 'EPERM') return { ok: false, error: 'readonly' };
    return { ok: false, error: 'unknown' };
  }
}
