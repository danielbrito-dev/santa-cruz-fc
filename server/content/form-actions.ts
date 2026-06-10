'use server';

import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySessionToken } from '@/server/auth/session';
import { getSql } from '@/server/db/client';

type Result = { ok: true } | { ok: false; error: string };

const MAX_FIELDS = 12;
const MAX_KEY = 40;
const MAX_VALUE = 4000;

/** Envio público dos formulários do site — persiste em form_submissions. */
export async function submitSiteForm(page: string, fields: Record<string, string>): Promise<Result> {
  const sql = getSql();
  if (!sql) return { ok: false, error: 'readonly' };

  const p = (page ?? '').trim().slice(0, 80);
  const entries = Object.entries(fields ?? {})
    .slice(0, MAX_FIELDS)
    .map(([k, v]) => [String(k).trim().slice(0, MAX_KEY), String(v ?? '').trim().slice(0, MAX_VALUE)] as const)
    .filter(([k, v]) => k && v);
  if (!p || entries.length === 0) return { ok: false, error: 'invalid' };

  try {
    await sql`insert into form_submissions (page, data)
              values (${p}, ${sql.json(Object.fromEntries(entries))})`;
    return { ok: true };
  } catch {
    return { ok: false, error: 'unknown' };
  }
}

async function guard(): Promise<boolean> {
  const jar = await cookies();
  return !!verifySessionToken(jar.get(SESSION_COOKIE)?.value);
}

export async function setFormSubmissionRead(id: number, read: boolean): Promise<Result> {
  if (!(await guard())) return { ok: false, error: 'unauthorized' };
  const sql = getSql();
  if (!sql) return { ok: false, error: 'readonly' };
  try {
    await sql`update form_submissions set read = ${read} where id = ${id}`;
    return { ok: true };
  } catch {
    return { ok: false, error: 'unknown' };
  }
}

export async function deleteFormSubmission(id: number): Promise<Result> {
  if (!(await guard())) return { ok: false, error: 'unauthorized' };
  const sql = getSql();
  if (!sql) return { ok: false, error: 'readonly' };
  try {
    await sql`delete from form_submissions where id = ${id}`;
    return { ok: true };
  } catch {
    return { ok: false, error: 'unknown' };
  }
}
