import { cookies } from 'next/headers';
import { getSql } from '@/server/db/client';
import { SESSION_COOKIE, verifySessionToken } from './session';
import { supabaseAdmin, supabaseAnon, hasSupabase } from './supabase';
import { DEV_USER } from './dev-user';

export type Role = 'admin' | 'editor';
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  active: boolean;
  isRoot: boolean;
  createdAt?: string;
}
export type Result = { ok: true } | { ok: false; error: string };

const norm = (e: string) => e.trim().toLowerCase();
const asRole = (r: unknown): Role => (r === 'admin' ? 'admin' : 'editor');

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://santa-ruby.vercel.app').replace(/\/$/, '');
}

/** Verifica a senha via Supabase Auth. Só em falha de rede cai no DEV_USER. */
export async function verifyCredentials(email: string, password: string): Promise<boolean> {
  const e = norm(email);
  if (hasSupabase()) {
    try {
      const { data, error } = await supabaseAnon().auth.signInWithPassword({ email: e, password });
      return !error && !!data?.user;
    } catch {
      /* indisponível → fallback */
    }
  }
  return e === DEV_USER.email && password === DEV_USER.password;
}

/** Conta ativa? (checado no login, depois da senha). Default true se não houver perfil. */
export async function isUserActive(email: string): Promise<boolean> {
  const sql = getSql();
  if (!sql) return true;
  try {
    const rows = await sql`select active from public.usuarios where lower(email) = ${norm(email)} limit 1`;
    if (!rows.length) return true; // sem perfil (ex.: DEV_USER) → permite
    return rows[0].active !== false;
  } catch {
    return true;
  }
}

function mapRow(r: Record<string, unknown>): AdminUser {
  return {
    id: String(r.id),
    email: (r.email as string) ?? '',
    name: (r.name as string) || (r.email as string) || '',
    role: asRole(r.role),
    active: r.active !== false,
    isRoot: r.is_root === true,
    createdAt: r.created_at ? new Date(r.created_at as string).toISOString() : undefined,
  };
}

async function findUserByEmail(email: string): Promise<AdminUser | null> {
  const sql = getSql();
  if (!sql) return null;
  try {
    const rows = await sql`select id, email, name, role, active, is_root, created_at from public.usuarios where lower(email) = ${norm(email)} limit 1`;
    return rows.length ? mapRow(rows[0]) : null;
  } catch {
    return null;
  }
}

export async function getUserById(id: string): Promise<AdminUser | null> {
  const sql = getSql();
  if (!sql) return null;
  try {
    const rows = await sql`select id, email, name, role, active, is_root, created_at from public.usuarios where id = ${id} limit 1`;
    return rows.length ? mapRow(rows[0]) : null;
  } catch {
    return null;
  }
}

/** Usuário da sessão (cookie HMAC → perfil). Retorna null se inativo (trava o acesso). */
export async function getSessionUser(): Promise<AdminUser | null> {
  const jar = await cookies();
  const s = verifySessionToken(jar.get(SESSION_COOKIE)?.value);
  if (!s) return null;
  const found = await findUserByEmail(s.email);
  if (found) return found.active ? found : null;
  // Sessão válida sem perfil (DEV_USER de emergência) → admin root.
  return { id: 'dev', email: s.email, name: DEV_USER.name, role: 'admin', active: true, isRoot: true };
}

export async function listUsers(): Promise<AdminUser[]> {
  const sql = getSql();
  if (!sql) return [];
  try {
    const rows = await sql`select id, email, name, role, active, is_root, created_at from public.usuarios order by is_root desc, created_at asc`;
    return rows.map((r) => mapRow(r));
  } catch {
    return [];
  }
}

/** Convida um novo usuário por e-mail (Supabase envia o link; perfil criado pelo trigger). */
export async function inviteUser(input: { email: string; name: string; role: Role }): Promise<Result> {
  if (!hasSupabase()) return { ok: false, error: 'no-supabase' };
  const email = norm(input.email);
  const { error } = await supabaseAdmin().auth.admin.inviteUserByEmail(email, {
    data: { name: input.name, role: input.role },
    redirectTo: `${siteUrl()}/pt/definir-senha`,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function updateUser(id: string, patch: { name?: string; role?: Role }): Promise<Result> {
  const sql = getSql();
  if (!sql) return { ok: false, error: 'no-db' };
  try {
    await sql`update public.usuarios set name = coalesce(${patch.name ?? null}, name), role = coalesce(${patch.role ?? null}, role) where id = ${id}`;
    if (hasSupabase()) {
      try {
        await supabaseAdmin().auth.admin.updateUserById(id, { user_metadata: { name: patch.name, role: patch.role } });
      } catch {
        /* metadata secundário */
      }
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'unknown' };
  }
}

export async function setActive(id: string, active: boolean): Promise<Result> {
  const sql = getSql();
  if (!sql) return { ok: false, error: 'no-db' };
  try {
    await sql`update public.usuarios set active = ${active} where id = ${id}`;
    return { ok: true };
  } catch {
    return { ok: false, error: 'unknown' };
  }
}

export async function setPassword(id: string, password: string): Promise<Result> {
  if (!hasSupabase()) return { ok: false, error: 'no-supabase' };
  const { error } = await supabaseAdmin().auth.admin.updateUserById(id, { password });
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function deleteUser(id: string): Promise<Result> {
  if (!hasSupabase()) return { ok: false, error: 'no-supabase' };
  const { error } = await supabaseAdmin().auth.admin.deleteUser(id);
  return error ? { ok: false, error: error.message } : { ok: true };
}
