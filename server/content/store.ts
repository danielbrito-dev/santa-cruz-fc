import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { SiteContent } from './types';
import { SiteContentSchema } from './schema';

const CONTENT_PATH = path.join(process.cwd(), 'content', 'site.json');

export async function readSiteContent(file: string = CONTENT_PATH): Promise<SiteContent> {
  const raw = await fs.readFile(file, 'utf8');
  return JSON.parse(raw) as SiteContent;
}

export type WriteResult = { ok: true } | { ok: false; error: 'invalid' | 'readonly' | 'unknown' };

export async function writeSiteContent(content: unknown, file: string = CONTENT_PATH): Promise<WriteResult> {
  const parsed = SiteContentSchema.safeParse(content);
  if (!parsed.success) return { ok: false, error: 'invalid' };
  try {
    await fs.writeFile(file, JSON.stringify(parsed.data, null, 2) + '\n', 'utf8');
    return { ok: true };
  } catch (e: unknown) {
    const code = (e as NodeJS.ErrnoException)?.code;
    if (code === 'EROFS' || code === 'EACCES' || code === 'EPERM') return { ok: false, error: 'readonly' };
    return { ok: false, error: 'unknown' };
  }
}
