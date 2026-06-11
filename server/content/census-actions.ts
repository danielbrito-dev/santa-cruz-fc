'use server';

import { getFanUser } from '@/server/auth/fan';
import { getSql } from '@/server/db/client';
import { sanitizeCensus, CENSUS_QUESTIONS } from '@/lib/census';

type Result = { ok: true } | { ok: false; error: string };

/** Salva (upsert) as respostas do censo do torcedor logado. */
export async function saveCensusAction(input: Record<string, string>): Promise<Result> {
  const fan = await getFanUser();
  if (!fan) return { ok: false, error: 'unauthorized' };
  const sql = getSql();
  if (!sql) return { ok: false, error: 'readonly' };

  const answers = sanitizeCensus(input);
  if (Object.keys(answers).length < CENSUS_QUESTIONS.length) return { ok: false, error: 'incomplete' };

  try {
    await sql`insert into fan_census (fan_id, data, updated_at)
              values (${fan.id}, ${sql.json(answers)}, now())
              on conflict (fan_id) do update set data = excluded.data, updated_at = now()`;
    return { ok: true };
  } catch {
    return { ok: false, error: 'unknown' };
  }
}
