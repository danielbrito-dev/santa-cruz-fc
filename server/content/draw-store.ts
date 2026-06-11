import { getSql } from '@/server/db/client';

export type DrawMode = 'inscricao' | 'filtro';
export type DrawStatus = 'aberto' | 'sorteado';

export interface DrawCriteria {
  city?: string;
  state?: string;
  censo?: boolean; // exigir censo respondido
  socio?: string; // resposta do censo (sim | jafui | nao)
  phone?: boolean; // exigir telefone preenchido
}

export interface DrawWinner {
  fanId: string;
  name: string;
  email: string;
  answer?: string;
}

export interface Draw {
  id: number;
  title: string;
  prize: string;
  mode: DrawMode;
  prompt: string | null;
  criteria: DrawCriteria | null;
  status: DrawStatus;
  winners: DrawWinner[] | null;
  poolSize: number | null;
  createdAt: string;
  drawnAt: string | null;
  entries: number;
}

function mapDraw(r: Record<string, unknown>, entries = 0): Draw {
  return {
    id: Number(r.id),
    title: String(r.title),
    prize: String(r.prize),
    mode: (r.mode as DrawMode) ?? 'inscricao',
    prompt: (r.prompt as string) || null,
    criteria: (r.criteria as DrawCriteria) ?? null,
    status: (r.status as DrawStatus) ?? 'aberto',
    winners: (r.winners as DrawWinner[]) ?? null,
    poolSize: r.pool_size === null || r.pool_size === undefined ? null : Number(r.pool_size),
    createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
    drawnAt: r.drawn_at ? (r.drawn_at instanceof Date ? r.drawn_at.toISOString() : String(r.drawn_at)) : null,
    entries,
  };
}

/** Todos os sorteios + contagem de inscritos (admin). */
export async function listDraws(): Promise<Draw[]> {
  const sql = getSql();
  if (!sql) return [];
  try {
    const rows = await sql`
      select d.*, coalesce(e.n, 0) as n
      from draws d
      left join (select draw_id, count(*)::int as n from draw_entries group by draw_id) e on e.draw_id = d.id
      order by d.created_at desc`;
    return rows.map((r) => mapDraw(r, Number(r.n)));
  } catch {
    return [];
  }
}

export interface FanDraw extends Draw {
  myAnswer: string | null;
  subscribed: boolean;
}

/** Sorteios visíveis pro torcedor (modo inscrição) + estado da inscrição dele. */
export async function listDrawsForFan(fanId: string): Promise<FanDraw[]> {
  const sql = getSql();
  if (!sql) return [];
  try {
    const rows = await sql`
      select d.*, coalesce(e.n, 0) as n, me.answer as my_answer, (me.fan_id is not null) as subscribed
      from draws d
      left join (select draw_id, count(*)::int as n from draw_entries group by draw_id) e on e.draw_id = d.id
      left join draw_entries me on me.draw_id = d.id and me.fan_id = ${fanId}
      where d.mode = 'inscricao'
      order by (d.status = 'aberto') desc, d.created_at desc
      limit 30`;
    return rows.map((r) => ({
      ...mapDraw(r, Number(r.n)),
      myAnswer: (r.my_answer as string) ?? null,
      subscribed: r.subscribed === true,
    }));
  } catch {
    return [];
  }
}
