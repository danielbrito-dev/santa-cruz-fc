/**
 * Migração idempotente: schema + seed do conteúdo + auth (Supabase) + storage.
 * Uso (local):  node --env-file=.env.local server/db/migrate.cjs
 * Não contém segredos — lê tudo de process.env. Seguro de versionar.
 */
const fs = require('fs');
const path = require('path');
const postgres = require('postgres');
const { createClient } = require('@supabase/supabase-js');

const url = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
if (!url) {
  console.error('Sem POSTGRES_URL_NON_POOLING/POSTGRES_URL no ambiente.');
  process.exit(1);
}
const sql = postgres(url, { ssl: 'require', max: 1 });

function readJson(rel) {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), rel), 'utf8'));
  } catch {
    return null;
  }
}

(async () => {
  try {
    await sql`create table if not exists site_content (
      id text primary key default 'main', data jsonb not null, updated_at timestamptz not null default now()
    )`;
    await sql`create table if not exists squad (
      id text primary key default 'main', data jsonb not null, updated_at timestamptz not null default now()
    )`;
    await sql`create table if not exists analytics_events (
      id bigint generated always as identity primary key,
      ts timestamptz not null default now(),
      type text not null, path text, session_id text, visitor_id text,
      device text, source text, duration_ms integer, cta_id text, label text, slug text, title text
    )`;
    await sql`create index if not exists analytics_events_ts_idx on analytics_events (ts)`;
    await sql`create index if not exists analytics_events_type_idx on analytics_events (type)`;

    // Perfil do admin — tabela NOSSA ligada ao auth.users do Supabase Auth.
    await sql`create table if not exists public.usuarios (
      id uuid primary key references auth.users(id) on delete cascade,
      email text,
      name text not null default '',
      role text not null default 'editor',
      active boolean not null default true,
      is_root boolean not null default false,
      created_at timestamptz not null default now()
    )`;
    await sql`alter table public.usuarios add column if not exists active boolean not null default true`;
    await sql`alter table public.usuarios add column if not exists is_root boolean not null default false`;
    await sql`alter table public.usuarios enable row level security`;
    await sql`do $$ begin
      create policy usuarios_read on public.usuarios for select to authenticated using (true);
    exception when duplicate_object then null; end $$`;
    // Trigger: ao criar usuário no Supabase Auth, cria o perfil em public.usuarios.
    await sql`create or replace function public.handle_new_user() returns trigger
      language plpgsql security definer set search_path = public as $$
      begin
        insert into public.usuarios (id, email, name, role)
        values (new.id, new.email,
          coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
          coalesce(new.raw_user_meta_data->>'role', 'editor'))
        on conflict (id) do nothing;
        return new;
      end; $$`;
    await sql`drop trigger if exists on_auth_user_created on auth.users`;
    await sql`create trigger on_auth_user_created after insert on auth.users
      for each row execute function public.handle_new_user()`;
    console.log('schema ✓ (site_content, squad, analytics_events, usuarios + trigger)');

    const site = readJson('content/site.json');
    if (site) await sql`insert into site_content (id, data) values ('main', ${sql.json(site)}) on conflict (id) do nothing`;
    const squad = readJson('content/squad.json');
    if (squad) await sql`insert into squad (id, data) values ('main', ${sql.json(squad)}) on conflict (id) do nothing`;
    console.log('seed conteúdo ✓');

    // ── Supabase Auth + Storage (Admin API) ──────────────────────────────
    const SUPA_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (SUPA_URL && SERVICE) {
      const admin = createClient(SUPA_URL, SERVICE, { auth: { persistSession: false } });

      // Bucket público de imagens.
      const { error: bErr } = await admin.storage.createBucket('media', {
        public: true,
        fileSizeLimit: '10MB',
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/svg+xml', 'image/gif'],
      });
      console.log(bErr ? `bucket media: ${bErr.message}` : 'bucket media ✓ (público)');

      // Usuário dono (idempotente).
      const { data: list } = await admin.auth.admin.listUsers();
      const owner = list?.users?.find((u) => u.email === 'admin@santacruz.fc');
      if (!owner) {
        const { error } = await admin.auth.admin.createUser({
          email: 'admin@santacruz.fc',
          password: 'cobracoral1914',
          email_confirm: true,
          user_metadata: { name: 'Admin', role: 'admin' },
        });
        console.log(error ? `owner: ${error.message}` : 'owner admin@santacruz.fc ✓ (role admin)');
      } else {
        console.log('owner já existe ✓');
      }
      // Marca o dono como root (protegido contra exclusão; só desativável por outro admin).
      await sql`update public.usuarios set is_root = true, role = 'admin' where email = 'admin@santacruz.fc'`;
      console.log('owner marcado como root ✓');
    } else {
      console.log('SUPABASE_URL/SERVICE_ROLE ausentes — pulando auth/storage.');
    }

    const [{ count: u }] = await sql`select count(*)::int as count from public.usuarios`;
    console.log(`usuarios: ${u}`);
  } catch (e) {
    console.error('ERR', e.message);
    process.exitCode = 1;
  } finally {
    await sql.end({ timeout: 5 });
  }
})();
