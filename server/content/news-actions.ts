'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { SESSION_COOKIE, verifySessionToken } from '@/server/auth/session';
import { readSiteContent, writeSiteContent } from './store';
import { applyCreate, applyUpdate, applyDelete, applyStatus } from './news-ops';
import type { NewsInput } from './news-ops';

export type { NewsInput };

type Result = { ok: true } | { ok: false; error: string };

async function guard(): Promise<boolean> {
  const jar = await cookies();
  return !!verifySessionToken(jar.get(SESSION_COOKIE)?.value);
}

export async function createNews(input: NewsInput): Promise<Result> {
  if (!(await guard())) return { ok: false, error: 'unauthorized' };
  const content = await readSiteContent();
  const res = await writeSiteContent(applyCreate(content, input));
  if (res.ok) revalidatePath('/', 'layout');
  return res;
}

export async function updateNews(id: string, input: NewsInput): Promise<Result> {
  if (!(await guard())) return { ok: false, error: 'unauthorized' };
  const content = await readSiteContent();
  const res = await writeSiteContent(applyUpdate(content, id, input));
  if (res.ok) revalidatePath('/', 'layout');
  return res;
}

export async function deleteNews(id: string): Promise<Result> {
  if (!(await guard())) return { ok: false, error: 'unauthorized' };
  const content = await readSiteContent();
  const res = await writeSiteContent(applyDelete(content, id));
  if (res.ok) revalidatePath('/', 'layout');
  return res;
}

export async function archiveNews(id: string): Promise<Result> {
  if (!(await guard())) return { ok: false, error: 'unauthorized' };
  const content = await readSiteContent();
  const res = await writeSiteContent(applyStatus(content, id, 'archived'));
  if (res.ok) revalidatePath('/', 'layout');
  return res;
}

export async function restoreNews(id: string): Promise<Result> {
  if (!(await guard())) return { ok: false, error: 'unauthorized' };
  const content = await readSiteContent();
  const res = await writeSiteContent(applyStatus(content, id, 'draft'));
  if (res.ok) revalidatePath('/', 'layout');
  return res;
}
