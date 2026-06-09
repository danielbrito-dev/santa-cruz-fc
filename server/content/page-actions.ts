'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { SESSION_COOKIE, verifySessionToken } from '@/server/auth/session';
import { readSiteContent, writeSiteContent } from './store';
import { applySavePage } from './page-ops';
import type { PageInput } from './page-ops';

export type { PageInput };

type Result = { ok: true } | { ok: false; error: string };

export async function savePage(input: PageInput): Promise<Result> {
  const jar = await cookies();
  if (!verifySessionToken(jar.get(SESSION_COOKIE)?.value)) return { ok: false, error: 'unauthorized' };
  const res = await writeSiteContent(applySavePage(await readSiteContent(), input));
  if (res.ok) revalidatePath('/', 'layout');
  return res;
}
