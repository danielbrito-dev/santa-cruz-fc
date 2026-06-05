'use server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { SESSION_COOKIE, verifySessionToken } from '@/server/auth/session';
import { writeSiteContent } from './store';
import type { SiteContent } from './types';

export async function saveContent(
  content: SiteContent,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const jar = await cookies();
  if (!verifySessionToken(jar.get(SESSION_COOKIE)?.value)) {
    return { ok: false, error: 'unauthorized' };
  }
  const res = await writeSiteContent(content);
  if (!res.ok) return res;
  // reflect on the public site (dev: live; prod SSG: next build)
  revalidatePath('/', 'layout');
  return { ok: true };
}
