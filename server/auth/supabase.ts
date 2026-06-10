import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Clientes Supabase server-side. Nunca usados no client (service role é secreto).
const URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

export function hasSupabase(): boolean {
  return !!(URL && SERVICE);
}

/** Service role — gerência de usuários + storage (bypass RLS). */
export function supabaseAdmin(): SupabaseClient {
  return createClient(URL as string, SERVICE as string, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Anon — usado só para verificar credenciais (signInWithPassword). */
export function supabaseAnon(): SupabaseClient {
  return createClient(URL as string, ANON as string, { auth: { persistSession: false, autoRefreshToken: false } });
}
