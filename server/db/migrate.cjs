/**
 * Migração idempotente do schema + seed do conteúdo atual (Supabase/Postgres).
 * Uso (local):  node --env-file=.env.local server/db/migrate.cjs
 * Em produção a integração Supabase-Vercel injeta as vars; rode quando precisar.
 *
 * Não contém segredos — lê tudo de process.env. Seguro de versionar.
 */
const fs = require('fs');
const path = require('path');
const postgres = require('postgres');

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
      id text primary key default 'main',
      data jsonb not null,
      updated_at timestamptz not null default now()
    )`;
    await sql`create table if not exists squad (
      id text primary key default 'main',
      data jsonb not null,
      updated_at timestamptz not null default now()
    )`;
    await sql`create table if not exists analytics_events (
      id bigint generated always as identity primary key,
      ts timestamptz not null default now(),
      type text not null,
      path text,
      session_id text,
      visitor_id text,
      device text,
      source text,
      duration_ms integer,
      cta_id text,
      label text,
      slug text,
      title text
    )`;
    await sql`create index if not exists analytics_events_ts_idx on analytics_events (ts)`;
    await sql`create index if not exists analytics_events_type_idx on analytics_events (type)`;
    console.log('schema ✓');

    const site = readJson('content/site.json');
    if (site) {
      await sql`insert into site_content (id, data) values ('main', ${sql.json(site)})
                on conflict (id) do nothing`;
      console.log('seed site_content ✓ (on conflict do nothing)');
    }
    const squad = readJson('content/squad.json');
    if (squad) {
      await sql`insert into squad (id, data) values ('main', ${sql.json(squad)})
                on conflict (id) do nothing`;
      console.log('seed squad ✓ (on conflict do nothing)');
    }

    const [{ count: sc }] = await sql`select count(*)::int as count from site_content`;
    const [{ count: sq }] = await sql`select count(*)::int as count from squad`;
    const [{ count: ev }] = await sql`select count(*)::int as count from analytics_events`;
    console.log(`rows → site_content:${sc} squad:${sq} analytics_events:${ev}`);
  } catch (e) {
    console.error('ERR', e.message);
    process.exitCode = 1;
  } finally {
    await sql.end({ timeout: 5 });
  }
})();
