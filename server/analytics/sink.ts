import { promises as fs } from 'fs';
import path from 'path';
import type { StoredEvent } from './types';
import { getSql } from '@/server/db/client';

// Sink de eventos. DB-first (tabela analytics_events no Supabase). Se não houver DB,
// cai no JSONL local (dev). Em produção sem DB seria no-op — mas agora há DB.
const DIR = path.join(process.cwd(), 'content', 'analytics');
const FILE = path.join(DIR, 'events.jsonl');

const COLS = ['ts', 'type', 'path', 'session_id', 'visitor_id', 'device', 'source', 'duration_ms', 'cta_id', 'label', 'slug', 'title'] as const;

export async function recordEvents(events: StoredEvent[]): Promise<void> {
  if (!events.length) return;
  const sql = getSql();
  if (sql) {
    try {
      const rows = events.map((e) => ({
        ts: new Date(e.ts).toISOString(),
        type: e.type,
        path: e.path ?? null,
        session_id: e.sessionId ?? null,
        visitor_id: e.visitorId ?? null,
        device: e.device ?? null,
        source: e.source ?? null,
        duration_ms: e.durationMs ?? null,
        cta_id: e.id ?? null,
        label: e.label ?? null,
        slug: e.slug ?? null,
        title: e.title ?? null,
      }));
      await sql`insert into analytics_events ${sql(rows, ...COLS)}`;
      return;
    } catch {
      // cai no JSONL abaixo
    }
  }
  // Fallback dev (FS gravável): append JSONL.
  const line = events.map((e) => JSON.stringify(e)).join('\n') + '\n';
  try {
    await fs.mkdir(DIR, { recursive: true });
    await fs.appendFile(FILE, line, 'utf8');
  } catch {
    // produção sem DB e FS read-only → no-op
  }
}

export async function readEvents(): Promise<StoredEvent[]> {
  const sql = getSql();
  if (sql) {
    try {
      const r = await sql`select * from analytics_events order by ts asc limit 50000`;
      return r.map((row) => ({
        type: row.type,
        path: row.path,
        sessionId: row.session_id,
        visitorId: row.visitor_id,
        device: row.device,
        source: row.source ?? undefined,
        durationMs: row.duration_ms ?? undefined,
        id: row.cta_id ?? undefined,
        label: row.label ?? undefined,
        slug: row.slug ?? undefined,
        title: row.title ?? undefined,
        ts: new Date(row.ts).getTime(),
      })) as StoredEvent[];
    } catch {
      // cai no JSONL
    }
  }
  try {
    const raw = await fs.readFile(FILE, 'utf8');
    return raw
      .split('\n')
      .filter(Boolean)
      .map((l) => {
        try {
          return JSON.parse(l) as StoredEvent;
        } catch {
          return null;
        }
      })
      .filter((e): e is StoredEvent => e !== null);
  } catch {
    return [];
  }
}
