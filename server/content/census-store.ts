import { getSql } from '@/server/db/client';
import { CENSUS_QUESTIONS, type CensusAnswers } from '@/lib/census';

/** Resposta do torcedor (ou null se ainda não respondeu / sem DB). */
export async function getCensusByFan(fanId: string): Promise<CensusAnswers | null> {
  const sql = getSql();
  if (!sql) return null;
  try {
    const rows = await sql`select data from fan_census where fan_id = ${fanId} limit 1`;
    return rows.length ? (rows[0].data as CensusAnswers) : null;
  } catch {
    return null;
  }
}

export interface CensusAggregate {
  total: number;
  byQuestion: Record<string, Record<string, number>>;
}

/** Agregado para o admin: total de respondentes + contagem por opção. */
export async function aggregateCensus(): Promise<CensusAggregate> {
  const empty: CensusAggregate = { total: 0, byQuestion: {} };
  const sql = getSql();
  if (!sql) return empty;
  try {
    const rows = await sql`select data from fan_census`;
    const byQuestion: Record<string, Record<string, number>> = {};
    for (const q of CENSUS_QUESTIONS) {
      byQuestion[q.key] = Object.fromEntries(q.options.map((o) => [o, 0]));
    }
    for (const r of rows) {
      const d = (r.data ?? {}) as Record<string, string>;
      for (const q of CENSUS_QUESTIONS) {
        const v = d[q.key];
        if (v && v in byQuestion[q.key]) byQuestion[q.key][v]++;
      }
    }
    return { total: rows.length, byQuestion };
  } catch {
    return empty;
  }
}
