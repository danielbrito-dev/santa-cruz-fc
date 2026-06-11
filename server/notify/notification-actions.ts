'use server';

import { getFanUser } from '@/server/auth/fan';
import { getSql } from '@/server/db/client';

type Result = { ok: true } | { ok: false; error: string };

/** Marca todas as notificações do torcedor logado como lidas. */
export async function markAllNotificationsRead(): Promise<Result> {
  const fan = await getFanUser();
  if (!fan) return { ok: false, error: 'unauthorized' };
  const sql = getSql();
  if (!sql) return { ok: false, error: 'readonly' };
  try {
    await sql`update fan_notifications set read = true where fan_id = ${fan.id} and read = false`;
    return { ok: true };
  } catch {
    return { ok: false, error: 'unknown' };
  }
}

/** Marca uma notificação como lida (ao clicar). */
export async function markNotificationRead(id: number): Promise<Result> {
  const fan = await getFanUser();
  if (!fan) return { ok: false, error: 'unauthorized' };
  const sql = getSql();
  if (!sql) return { ok: false, error: 'readonly' };
  try {
    await sql`update fan_notifications set read = true where id = ${id} and fan_id = ${fan.id}`;
    return { ok: true };
  } catch {
    return { ok: false, error: 'unknown' };
  }
}
