import type { Config } from 'drizzle-kit';

// Phase 2: schema + DATABASE_URL (Supabase) get wired here.
export default {
  schema: './server/db/schema.ts',
  out: './server/db/migrations',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL ?? '' },
} satisfies Config;
