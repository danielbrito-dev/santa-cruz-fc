import { cookies } from 'next/headers';
import { getSql } from '@/server/db/client';
import { createSessionToken, verifySessionToken } from './session';
import { supabaseAdmin, supabaseAnon, hasSupabase } from './supabase';

// Sessão do TORCEDOR — cookie próprio (separado do admin), mesmo esquema HMAC.
export const FAN_COOKIE = 'scfc_fan';
const MAX_AGE_S = 60 * 60 * 24 * 30; // 30 dias

export interface FanUser {
  id: string;
  email: string;
  name: string;
  photo?: string;
  phone?: string;
  birthDate?: string;
  // endereço (preenchido via busca de CEP no perfil)
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}
export type Result = { ok: true } | { ok: false; error: string };

const norm = (e: string) => e.trim().toLowerCase();

function mapFan(r: Record<string, unknown>): FanUser {
  return {
    id: String(r.id),
    email: (r.email as string) ?? '',
    name: (r.name as string) || (r.email as string) || '',
    photo: (r.photo as string) || undefined,
    phone: (r.phone as string) || undefined,
    birthDate: r.birth_date ? new Date(r.birth_date as string).toISOString().slice(0, 10) : undefined,
    cep: (r.cep as string) || undefined,
    street: (r.street as string) || undefined,
    number: (r.number as string) || undefined,
    complement: (r.complement as string) || undefined,
    neighborhood: (r.neighborhood as string) || undefined,
    city: (r.city as string) || undefined,
    state: (r.state as string) || undefined,
  };
}


async function fanByEmail(email: string): Promise<FanUser | null> {
  const sql = getSql();
  if (!sql) return null;
  try {
    const rows = await sql`select id, email, name, photo, phone, city, birth_date, cep, street, number, complement, neighborhood, state from public.torcedores where lower(email) = ${norm(email)} limit 1`;
    return rows.length ? mapFan(rows[0]) : null;
  } catch {
    return null;
  }
}

async function fanById(id: string): Promise<FanUser | null> {
  const sql = getSql();
  if (!sql) return null;
  try {
    const rows = await sql`select id, email, name, photo, phone, city, birth_date, cep, street, number, complement, neighborhood, state from public.torcedores where id = ${id} limit 1`;
    return rows.length ? mapFan(rows[0]) : null;
  } catch {
    return null;
  }
}

/** Torcedor logado (cookie FAN → perfil em torcedores), ou null. */
export async function getFanUser(): Promise<FanUser | null> {
  const jar = await cookies();
  const s = verifySessionToken(jar.get(FAN_COOKIE)?.value);
  if (!s) return null;
  return fanByEmail(s.email);
}

async function setFanCookie(email: string) {
  const jar = await cookies();
  jar.set(FAN_COOKIE, createSessionToken(norm(email)), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE_S,
  });
}

export async function clearFanCookie() {
  const jar = await cookies();
  jar.delete(FAN_COOKIE);
}

/** Cadastro do torcedor (cria auth user kind=fan + perfil; loga em seguida). */
export async function signupFan(input: { email: string; name: string; password: string }): Promise<Result> {
  if (!hasSupabase()) return { ok: false, error: 'no-supabase' };
  if (!input.email || !input.name || !input.password || input.password.length < 8) return { ok: false, error: 'invalid' };
  const email = norm(input.email);
  const { data, error } = await supabaseAdmin().auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: { name: input.name, kind: 'fan' },
  });
  if (error) {
    return { ok: false, error: /exist|registered|already/i.test(error.message) ? 'exists' : error.message };
  }
  const sql = getSql();
  if (sql && data.user) {
    try {
      await sql`insert into public.torcedores (id, email, name) values (${data.user.id}, ${email}, ${input.name})
                on conflict (id) do update set email = excluded.email, name = excluded.name`;
    } catch {
      /* trigger já criou */
    }
  }
  await setFanCookie(email);
  return { ok: true };
}

/** Login do torcedor — exige que seja um torcedor (tem perfil), nunca um admin. */
export async function loginFan(email: string, password: string): Promise<Result> {
  const e = norm(email);
  if (!hasSupabase()) return { ok: false, error: 'no-supabase' };
  try {
    const { data, error } = await supabaseAnon().auth.signInWithPassword({ email: e, password });
    if (error || !data?.user) return { ok: false, error: 'invalid' };
  } catch {
    return { ok: false, error: 'unavailable' };
  }
  const fan = await fanByEmail(e);
  if (!fan) return { ok: false, error: 'not-fan' }; // credencial válida mas não é torcedor (ex.: admin)
  await setFanCookie(e);
  return { ok: true };
}

export interface FanProfilePatch {
  name?: string;
  photo?: string;
  phone?: string;
  birthDate?: string;
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

export async function updateFanProfile(patch: FanProfilePatch): Promise<Result> {
  const me = await getFanUser();
  if (!me) return { ok: false, error: 'unauthorized' };
  const sql = getSql();
  if (!sql) return { ok: false, error: 'no-db' };
  try {
    await sql`update public.torcedores set
      name = coalesce(${patch.name ?? null}, name),
      photo = ${patch.photo ?? null},
      phone = ${patch.phone ?? null},
      birth_date = ${patch.birthDate ? patch.birthDate : null},
      cep = ${patch.cep ?? null},
      street = ${patch.street ?? null},
      number = ${patch.number ?? null},
      complement = ${patch.complement ?? null},
      neighborhood = ${patch.neighborhood ?? null},
      city = ${patch.city ?? null},
      state = ${patch.state ?? null}
      where id = ${me.id}`;
    if (patch.name && hasSupabase()) {
      try {
        await supabaseAdmin().auth.admin.updateUserById(me.id, { user_metadata: { name: patch.name, kind: 'fan' } });
      } catch {
        /* secundário */
      }
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'unknown' };
  }
}

export { fanById };
