'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { SESSION_COOKIE, verifySessionToken } from '@/server/auth/session';
import { readSiteContent, writeSiteContent } from './store';
import {
  applyCreateMatch,
  applyUpdateMatch,
  applyDeleteMatch,
  applyUpsertClub,
  applyDeleteClub,
} from './match-ops';
import type { MatchInput, ClubInput } from './match-ops';

export type { MatchInput, ClubInput };

type Result = { ok: true } | { ok: false; error: string };

async function guard(): Promise<boolean> {
  const jar = await cookies();
  return !!verifySessionToken(jar.get(SESSION_COOKIE)?.value);
}

async function commit(next: Awaited<ReturnType<typeof readSiteContent>>): Promise<Result> {
  const res = await writeSiteContent(next);
  if (res.ok) revalidatePath('/', 'layout');
  return res;
}

export async function createMatch(input: MatchInput): Promise<Result> {
  if (!(await guard())) return { ok: false, error: 'unauthorized' };
  return commit(applyCreateMatch(await readSiteContent(), input));
}
export async function updateMatch(id: string, input: MatchInput): Promise<Result> {
  if (!(await guard())) return { ok: false, error: 'unauthorized' };
  return commit(applyUpdateMatch(await readSiteContent(), id, input));
}
export async function deleteMatch(id: string): Promise<Result> {
  if (!(await guard())) return { ok: false, error: 'unauthorized' };
  return commit(applyDeleteMatch(await readSiteContent(), id));
}
export async function upsertClub(input: ClubInput, id?: string): Promise<Result> {
  if (!(await guard())) return { ok: false, error: 'unauthorized' };
  return commit(applyUpsertClub(await readSiteContent(), input, id));
}
export async function deleteClub(id: string): Promise<Result> {
  if (!(await guard())) return { ok: false, error: 'unauthorized' };
  return commit(applyDeleteClub(await readSiteContent(), id));
}
