'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { SESSION_COOKIE, verifySessionToken } from '@/server/auth/session';
import { readSquadFile, writeSquadFile } from './store';
import {
  applyCreatePlayer,
  applyUpdatePlayer,
  applyDeletePlayer,
  applyUpsertStaff,
  applyDeleteStaff,
} from './squad-ops';
import type { PlayerInput, StaffInput } from './squad-ops';

export type { PlayerInput, StaffInput };

type Result = { ok: true } | { ok: false; error: string };

async function guard(): Promise<boolean> {
  const jar = await cookies();
  return !!verifySessionToken(jar.get(SESSION_COOKIE)?.value);
}

async function commit(next: Awaited<ReturnType<typeof readSquadFile>>): Promise<Result> {
  const res = await writeSquadFile(next);
  if (res.ok) revalidatePath('/', 'layout');
  return res;
}

export async function createPlayer(input: PlayerInput): Promise<Result> {
  if (!(await guard())) return { ok: false, error: 'unauthorized' };
  return commit(applyCreatePlayer(await readSquadFile(), input));
}
export async function updatePlayer(number: number, input: PlayerInput): Promise<Result> {
  if (!(await guard())) return { ok: false, error: 'unauthorized' };
  return commit(applyUpdatePlayer(await readSquadFile(), number, input));
}
export async function deletePlayer(number: number): Promise<Result> {
  if (!(await guard())) return { ok: false, error: 'unauthorized' };
  return commit(applyDeletePlayer(await readSquadFile(), number));
}
export async function upsertStaff(input: StaffInput, index?: number): Promise<Result> {
  if (!(await guard())) return { ok: false, error: 'unauthorized' };
  return commit(applyUpsertStaff(await readSquadFile(), input, index));
}
export async function deleteStaff(index: number): Promise<Result> {
  if (!(await guard())) return { ok: false, error: 'unauthorized' };
  return commit(applyDeleteStaff(await readSquadFile(), index));
}
