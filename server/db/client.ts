import postgres from 'postgres';

// Cliente Postgres (Supabase) singleton para runtime. Usa a URL POOLED (pgbouncer,
// porta 6543) com prepare:false — obrigatório no modo transaction do pgbouncer.
// Tudo aqui é tolerante a falha: se não há URL ou a conexão cai, getSql() devolve
// null e os stores caem no JSON empacotado (nada quebra com o DB vazio/ausente).

type Sql = ReturnType<typeof postgres>;

let _sql: Sql | null = null;
let _init = false;

function dbUrl(): string | undefined {
  return process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL || undefined;
}

export function hasDb(): boolean {
  return !!dbUrl();
}

export function getSql(): Sql | null {
  if (_init) return _sql;
  _init = true;
  // Durante o `next build` (prerender estático) NÃO conectamos no DB: usamos o
  // JSON empacotado como fallback. Evita esgotar o pooler com 100+ páginas em
  // paralelo e desacopla o build da disponibilidade do banco. Em runtime conecta.
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    _sql = null;
    return null;
  }
  const url = dbUrl();
  if (!url) {
    _sql = null;
    return null;
  }
  try {
    _sql = postgres(url, {
      ssl: 'require',
      prepare: false, // pgbouncer (transaction pooling) não suporta prepared statements
      max: 5,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  } catch {
    _sql = null;
  }
  return _sql;
}
