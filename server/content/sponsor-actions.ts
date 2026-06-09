'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { SESSION_COOKIE, verifySessionToken } from '@/server/auth/session';
import { readSiteContent, writeSiteContent } from './store';
import { applyCreateSponsor, applyUpdateSponsor, applyDeleteSponsor } from './sponsor-ops';
import type { SponsorInput } from './sponsor-ops';

export type { SponsorInput };

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

export async function createSponsor(input: SponsorInput): Promise<Result> {
  if (!(await guard())) return { ok: false, error: 'unauthorized' };
  return commit(applyCreateSponsor(await readSiteContent(), input));
}
export async function updateSponsor(id: string, input: SponsorInput): Promise<Result> {
  if (!(await guard())) return { ok: false, error: 'unauthorized' };
  return commit(applyUpdateSponsor(await readSiteContent(), id, input));
}
export async function deleteSponsor(id: string): Promise<Result> {
  if (!(await guard())) return { ok: false, error: 'unauthorized' };
  return commit(applyDeleteSponsor(await readSiteContent(), id));
}
