import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { SiteContent } from './types';
import { SiteContentSchema } from './schema';
import { getSql } from '@/server/db/client';
import bundled from '@/content/site.json';

const CONTENT_PATH = path.join(process.cwd(), 'content', 'site.json');

// Fallback empacotado (build-time): usado quando não há DB ou a tabela está vazia.
// Passa pelo schema p/ preencher defaults (ex.: pages/gallery/documents/stories).
const FALLBACK: SiteContent = (() => {
  const parsed = SiteContentSchema.safeParse(bundled);
  return parsed.success ? parsed.data : (bundled as unknown as SiteContent);
})();

/**
 * Lê o conteúdo do site.
 * - `file` informado → modo arquivo (usado em testes).
 * - sem `file` → DB-first; cai no JSON empacotado se o DB estiver vazio/indisponível.
 */
export async function readSiteContent(file?: string): Promise<SiteContent> {
  if (file) {
    const raw = await fs.readFile(file, 'utf8');
    return JSON.parse(raw) as SiteContent;
  }
  const sql = getSql();
  if (sql) {
    try {
      const rows = await sql`select data from site_content where id = 'main' limit 1`;
      if (rows.length) {
        const parsed = SiteContentSchema.safeParse(rows[0].data);
        if (parsed.success) return parsed.data;
        return rows[0].data as SiteContent;
      }
    } catch {
      // DB indisponível → fallback abaixo
    }
  }
  return FALLBACK;
}

export type WriteResult = { ok: true } | { ok: false; error: 'invalid' | 'readonly' | 'unknown' };

export async function writeSiteContent(content: unknown, file?: string): Promise<WriteResult> {
  const parsed = SiteContentSchema.safeParse(content);
  if (!parsed.success) return { ok: false, error: 'invalid' };

  if (file) {
    try {
      await fs.writeFile(file, JSON.stringify(parsed.data, null, 2) + '\n', 'utf8');
      return { ok: true };
    } catch (e: unknown) {
      const code = (e as NodeJS.ErrnoException)?.code;
      if (code === 'EROFS' || code === 'EACCES' || code === 'EPERM') return { ok: false, error: 'readonly' };
      return { ok: false, error: 'unknown' };
    }
  }

  const sql = getSql();
  if (!sql) return { ok: false, error: 'readonly' }; // sem DB configurado
  try {
    await sql`insert into site_content (id, data, updated_at) values ('main', ${sql.json(parsed.data as unknown as Parameters<typeof sql.json>[0])}, now())
              on conflict (id) do update set data = excluded.data, updated_at = now()`;
    return { ok: true };
  } catch {
    return { ok: false, error: 'unknown' };
  }
}

export { CONTENT_PATH };
