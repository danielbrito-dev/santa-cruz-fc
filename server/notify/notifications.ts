import { getSql } from '@/server/db/client';

export interface FanNotification {
  id: number;
  type: string;
  title: string;
  body: string | null;
  href: string | null;
  read: boolean;
  createdAt: string;
}

export interface NotifyInput {
  type: string;
  title: string;
  body?: string;
  href?: string;
}

/** Cria a mesma notificação para vários torcedores (insert em lote). */
export async function notifyFans(fanIds: string[], n: NotifyInput): Promise<void> {
  const sql = getSql();
  if (!sql || fanIds.length === 0) return;
  try {
    const rows = fanIds.map((id) => ({
      fan_id: id,
      type: n.type,
      title: n.title.slice(0, 200),
      body: n.body?.slice(0, 500) ?? null,
      href: n.href ?? null,
    }));
    await sql`insert into fan_notifications ${sql(rows, 'fan_id', 'type', 'title', 'body', 'href')}`;
  } catch {
    /* notificação é best-effort — nunca derruba a ação principal */
  }
}

/** Notifica TODOS os torcedores cadastrados. */
export async function notifyAllFans(n: NotifyInput): Promise<void> {
  const sql = getSql();
  if (!sql) return;
  try {
    const rows = await sql`select id from public.torcedores`;
    await notifyFans(rows.map((r) => String(r.id)), n);
  } catch {
    /* best-effort */
  }
}

export async function listNotifications(fanId: string, limit = 30): Promise<FanNotification[]> {
  const sql = getSql();
  if (!sql) return [];
  try {
    const rows = await sql`
      select id, type, title, body, href, read, created_at
      from fan_notifications where fan_id = ${fanId}
      order by created_at desc limit ${limit}`;
    return rows.map((r) => ({
      id: Number(r.id),
      type: String(r.type),
      title: String(r.title),
      body: (r.body as string) || null,
      href: (r.href as string) || null,
      read: r.read === true,
      createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
    }));
  } catch {
    return [];
  }
}

export async function unreadCount(fanId: string): Promise<number> {
  const sql = getSql();
  if (!sql) return 0;
  try {
    const rows = await sql`select count(*)::int as n from fan_notifications where fan_id = ${fanId} and read = false`;
    return Number(rows[0]?.n ?? 0);
  } catch {
    return 0;
  }
}
