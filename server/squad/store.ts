import { promises as fs } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import type { Squad } from './squad';
import { getSql } from '@/server/db/client';
import bundled from '@/content/squad.json';

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

const FALLBACK = bundled as unknown as Squad;

/**
 * Lê o elenco.
 * - `file` informado → modo arquivo (testes).
 * - sem `file` → DB-first; cai no JSON empacotado se o DB estiver vazio/indisponível.
 */
export async function readSquadFile(file?: string): Promise<Squad> {
  if (file) {
    const raw = await fs.readFile(file, 'utf8');
    return JSON.parse(raw) as Squad;
  }
  const sql = getSql();
  if (sql) {
    try {
      const rows = await sql`select data from squad where id = 'main' limit 1`;
      if (rows.length) return rows[0].data as Squad;
    } catch {
      // DB indisponível → fallback
    }
  }
  return FALLBACK;
}

export type WriteResult = { ok: true } | { ok: false; error: 'invalid' | 'readonly' | 'unknown' };

export async function writeSquadFile(squad: unknown, file?: string): Promise<WriteResult> {
  const parsed = SquadSchema.safeParse(squad);
  if (!parsed.success) return { ok: false, error: 'invalid' };

  if (file) {
    try {
      await fs.writeFile(file, JSON.stringify(parsed.data, null, 2) + '\n', 'utf8');
      return { ok: true };
    } catch (e: unknown) {
      const code = (e as NodeJS.ErrnoException)?.code;
      if (code === 'EROFS' || code === 'EACCES' || code === 'EPERM') return { ok: false, error: 'readonly' };
      return { ok: false, error: 'unknown' };
    }
  }

  const sql = getSql();
  if (!sql) return { ok: false, error: 'readonly' };
  try {
    await sql`insert into squad (id, data, updated_at) values ('main', ${sql.json(parsed.data as unknown as Parameters<typeof sql.json>[0])}, now())
              on conflict (id) do update set data = excluded.data, updated_at = now()`;
    return { ok: true };
  } catch {
    return { ok: false, error: 'unknown' };
  }
}

export { SQUAD_PATH };
