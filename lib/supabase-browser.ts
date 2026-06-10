'use client';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Cliente Supabase do navegador — usado APENAS no fluxo de convite (definir senha).
// Detecta a sessão vinda do link de convite (hash na URL) e permite updateUser.
let client: SupabaseClient | null = null;

export function supabaseBrowser(): SupabaseClient {
  if (client) return client;
  client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    { auth: { detectSessionInUrl: true, persistSession: true, autoRefreshToken: true, flowType: 'implicit' } },
  );
  return client;
}
