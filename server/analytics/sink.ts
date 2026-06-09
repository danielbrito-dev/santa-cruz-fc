import { promises as fs } from 'fs';
import path from 'path';
import type { StoredEvent } from './types';

// Sink de eventos. DEV: append em JSONL (loop completo visível localmente).
// PROD: FS é somente-leitura na Vercel → no-op até a etapa de infra.
// Na infra, trocar recordEvents/readEvents por insert/select no banco.
const DIR = path.join(process.cwd(), 'content', 'analytics');
const FILE = path.join(DIR, 'events.jsonl');

export async function recordEvents(events: StoredEvent[]): Promise<void> {
  if (!events.length) return;
  const line = events.map((e) => JSON.stringify(e)).join('\n') + '\n';
  try {
    await fs.mkdir(DIR, { recursive: true });
    await fs.appendFile(FILE, line, 'utf8');
  } catch {
    // produção (read-only) — ignora silenciosamente até existir o banco.
  }
}

export async function readEvents(): Promise<StoredEvent[]> {
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
