'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { SESSION_COOKIE, verifySessionToken } from '@/server/auth/session';
import { readSiteContent, writeSiteContent } from './store';
import {
  applyCreateImage, applyUpdateImage, applyDeleteImage,
  applyCreateDoc, applyUpdateDoc, applyDeleteDoc,
  applyCreateStory, applyUpdateStory, applyDeleteStory,
} from './site-extras-ops';
import type { GalleryInput, DocInput, StoryInput } from './site-extras-ops';

export type { GalleryInput, DocInput, StoryInput };

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

// Galeria
export async function createImage(input: GalleryInput): Promise<Result> {
  if (!(await guard())) return { ok: false, error: 'unauthorized' };
  return commit(applyCreateImage(await readSiteContent(), input));
}
export async function updateImage(id: string, input: GalleryInput): Promise<Result> {
  if (!(await guard())) return { ok: false, error: 'unauthorized' };
  return commit(applyUpdateImage(await readSiteContent(), id, input));
}
export async function deleteImage(id: string): Promise<Result> {
  if (!(await guard())) return { ok: false, error: 'unauthorized' };
  return commit(applyDeleteImage(await readSiteContent(), id));
}

// Documentos
export async function createDoc(input: DocInput): Promise<Result> {
  if (!(await guard())) return { ok: false, error: 'unauthorized' };
  return commit(applyCreateDoc(await readSiteContent(), input));
}
export async function updateDoc(id: string, input: DocInput): Promise<Result> {
  if (!(await guard())) return { ok: false, error: 'unauthorized' };
  return commit(applyUpdateDoc(await readSiteContent(), id, input));
}
export async function deleteDoc(id: string): Promise<Result> {
  if (!(await guard())) return { ok: false, error: 'unauthorized' };
  return commit(applyDeleteDoc(await readSiteContent(), id));
}

// Histórias
export async function createStory(input: StoryInput): Promise<Result> {
  if (!(await guard())) return { ok: false, error: 'unauthorized' };
  return commit(applyCreateStory(await readSiteContent(), input));
}
export async function updateStory(id: string, input: StoryInput): Promise<Result> {
  if (!(await guard())) return { ok: false, error: 'unauthorized' };
  return commit(applyUpdateStory(await readSiteContent(), id, input));
}
export async function deleteStory(id: string): Promise<Result> {
  if (!(await guard())) return { ok: false, error: 'unauthorized' };
  return commit(applyDeleteStory(await readSiteContent(), id));
}
