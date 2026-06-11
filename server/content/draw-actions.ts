'use server';

import { randomInt } from 'node:crypto';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySessionToken } from '@/server/auth/session';
import { getFanUser } from '@/server/auth/fan';
import { getSql } from '@/server/db/client';
import type { DrawCriteria, DrawWinner } from './draw-store';

type Result = { ok: true } | { ok: false; error: string };
type DrawResult = { ok: true; winners: DrawWinner[]; poolSize: number } | { ok: false; error: string };

async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  return !!verifySessionToken(jar.get(SESSION_COOKIE)?.value);
}

/** Embaralhamento Fisher–Yates com crypto (sorteio imparcial). */
function pick<T>(pool: T[], count: number): T[] {
  const a = [...pool];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, Math.min(count, a.length));
}

// ── Admin ────────────────────────────────────────────────────────────────

export async function createDraw(input: {
  title: string;
  prize: string;
  mode: 'inscricao' | 'filtro';
  prompt?: string;
  criteria?: DrawCriteria;
}): Promise<Result> {
  if (!(await isAdmin())) return { ok: false, error: 'unauthorized' };
  const sql = getSql();
  if (!sql) return { ok: false, error: 'readonly' };
  const title = input.title.trim().slice(0, 160);
  const prize = input.prize.trim().slice(0, 200);
  if (!title || !prize) return { ok: false, error: 'invalid' };
  try {
    await sql`insert into draws (title, prize, mode, prompt, criteria)
              values (${title}, ${prize}, ${input.mode === 'filtro' ? 'filtro' : 'inscricao'},
                      ${input.prompt?.trim().slice(0, 400) || null},
                      ${input.criteria ? sql.json(input.criteria as unknown as Parameters<typeof sql.json>[0]) : null})`;
    return { ok: true };
  } catch {
    return { ok: false, error: 'unknown' };
  }
}

export async function deleteDraw(id: number): Promise<Result> {
  if (!(await isAdmin())) return { ok: false, error: 'unauthorized' };
  const sql = getSql();
  if (!sql) return { ok: false, error: 'readonly' };
  try {
    await sql`delete from draws where id = ${id}`;
    return { ok: true };
  } catch {
    return { ok: false, error: 'unknown' };
  }
}

/** Roda o sorteio: pool = inscritos (modo inscrição) ou base filtrada (modo filtro). */
export async function runDraw(id: number, count: number): Promise<DrawResult> {
  if (!(await isAdmin())) return { ok: false, error: 'unauthorized' };
  const sql = getSql();
  if (!sql) return { ok: false, error: 'readonly' };
  const n = Math.max(1, Math.min(100, Math.floor(count)));
  try {
    const drows = await sql`select * from draws where id = ${id} limit 1`;
    if (!drows.length) return { ok: false, error: 'not-found' };
    const draw = drows[0];
    if (draw.status === 'sorteado') return { ok: false, error: 'already-drawn' };

    let pool: DrawWinner[];
    if (draw.mode === 'inscricao') {
      const rows = await sql`
        select e.fan_id, e.answer, t.name, t.email
        from draw_entries e join public.torcedores t on t.id = e.fan_id
        where e.draw_id = ${id}`;
      pool = rows.map((r) => ({ fanId: String(r.fan_id), name: String(r.name), email: String(r.email), answer: (r.answer as string) || undefined }));
    } else {
      const c = (draw.criteria ?? {}) as DrawCriteria;
      const rows = await sql`
        select t.id, t.name, t.email
        from public.torcedores t
        left join fan_census fc on fc.fan_id = t.id
        where true
          ${c.city ? sql`and t.city ilike ${'%' + c.city + '%'}` : sql``}
          ${c.state ? sql`and upper(t.state) = ${c.state.toUpperCase()}` : sql``}
          ${c.phone ? sql`and coalesce(t.phone, '') <> ''` : sql``}
          ${c.censo ? sql`and fc.fan_id is not null` : sql``}
          ${c.socio ? sql`and fc.data->>'socio' = ${c.socio}` : sql``}`;
      pool = rows.map((r) => ({ fanId: String(r.id), name: String(r.name), email: String(r.email) }));
    }

    if (pool.length === 0) return { ok: false, error: 'empty-pool' };
    const winners = pick(pool, n);
    await sql`update draws set status = 'sorteado', winners = ${sql.json(winners as unknown as Parameters<typeof sql.json>[0])},
              pool_size = ${pool.length}, drawn_at = now() where id = ${id}`;
    return { ok: true, winners, poolSize: pool.length };
  } catch {
    return { ok: false, error: 'unknown' };
  }
}

// ── Torcedor ─────────────────────────────────────────────────────────────

/** Inscrição do torcedor logado num sorteio aberto (com resposta do desafio, se houver). */
export async function subscribeToDraw(id: number, answer?: string): Promise<Result> {
  const fan = await getFanUser();
  if (!fan) return { ok: false, error: 'unauthorized' };
  const sql = getSql();
  if (!sql) return { ok: false, error: 'readonly' };
  try {
    const drows = await sql`select mode, status, prompt from draws where id = ${id} limit 1`;
    if (!drows.length) return { ok: false, error: 'not-found' };
    const d = drows[0];
    if (d.mode !== 'inscricao' || d.status !== 'aberto') return { ok: false, error: 'closed' };
    const a = (answer ?? '').trim().slice(0, 600);
    if (d.prompt && !a) return { ok: false, error: 'answer-required' };
    await sql`insert into draw_entries (draw_id, fan_id, answer)
              values (${id}, ${fan.id}, ${a || null})
              on conflict (draw_id, fan_id) do update set answer = excluded.answer`;
    return { ok: true };
  } catch {
    return { ok: false, error: 'unknown' };
  }
}
