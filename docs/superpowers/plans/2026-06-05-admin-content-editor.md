# Admin Content Editor (first CRUD) + live ContentSource — Plan

> Branch `feat/admin-content`. Persistence = `content/site.json` (zero infra). Dev = live CRUD; prod Vercel FS is read-only → writes fail gracefully (edit local + deploy). The public site already reads via `ContentSource` → reads the same JSON.

**Goal:** Admins edit the site's institutional content (Hero, Banners, Institutional cards, Footer texts — PT/EN) in `/admin/conteudo`; saving writes `content/site.json`; the public site reads the same file (live in dev).

---

### Task CC1 — ContentSource read/write + zod schema (foundational, TDD)
**Files:** create `server/content/schema.ts`, `server/content/store.ts`; modify `server/content/json-source.ts`, `next.config.ts`; tests `tests/content/store.test.ts`. Keep existing content tests green.
- `schema.ts`: a zod schema mirroring `SiteContent` (LocalizedText = `{pt:string,en:string}`; hero/matches/news/banners/institutional/sponsors/social/footer per `server/content/types.ts`). Export `SiteContentSchema`. Used to validate writes.
- `store.ts`:
  - `const CONTENT_PATH = path.join(process.cwd(), 'content', 'site.json')`.
  - `async function readSiteContent(file = CONTENT_PATH): Promise<SiteContent>` — `fs.readFile` + `JSON.parse` (server-only; reflects edits at runtime in dev).
  - `async function writeSiteContent(content: SiteContent, file = CONTENT_PATH): Promise<{ ok: true } | { ok: false; error: 'invalid' | 'readonly' | 'unknown' }>` — validate with `SiteContentSchema.safeParse`; on invalid return `{ok:false,error:'invalid'}`; else `fs.writeFile(file, JSON.stringify(content, null, 2))` in try/catch — catch `EROFS`/`EACCES` → `{ok:false,error:'readonly'}`, other → `{ok:false,error:'unknown'}`; success → `{ok:true}`. (The `file` param injectable for tests.)
- `json-source.ts`: `JsonContentSource.getSiteContent()` now `return readSiteContent()` (remove the static `import data from '@/content/site.json'`). Keep the class + `getContentSource()` binding.
- `next.config.ts`: add `outputFileTracingIncludes: { '/[locale]/admin/**': ['./content/site.json'], '/[locale]/**': ['./content/site.json'] }` so the runtime fs read finds the file in the serverless bundle.
- Tests (`tests/content/store.test.ts`): (a) `readSiteContent()` returns content with 8 matches / 12 sponsors (real file); (b) `SiteContentSchema` accepts the real site.json and REJECTS a malformed object (e.g., hero missing); (c) write→read round-trip against a TEMP file (write a tweaked copy to `tests/.tmp-site.json`, read it back, assert the tweak; clean up) — do NOT write the real site.json in tests. Existing `tests/content/json-source.test.ts` must still pass (it calls getSiteContent → now fs read; works in vitest from repo root).
- Commit.

### Task CC2 — Admin "Conteúdo do site" editor (frontend-design)
**Files:** create `app/[locale]/admin/conteudo/page.tsx` (server: loads current content), `components/admin/content-editor.tsx` ('use client': the form), `server/content/actions.ts` ('use server': `saveContent`); modify `components/admin/admin-nav.tsx` (+ "Conteúdo" item → `/admin/conteudo`), `messages/{pt,en}.json` (admin.content* keys), `app/globals.css` (editor CSS). Use the `frontend-design` skill.
- `conteudo/page.tsx`: guard inherited from admin layout; `getServerApi().content.site()` (or `readSiteContent()`) → pass current content to `<ContentEditor initial={content} />`.
- `ContentEditor`: a form with sections (Hero, Banners[2], Institutional[4], Footer) — each editable field has PT + EN inputs (tabs or side-by-side); image fields are text inputs (path) for now. A single "Salvar" button. On submit: call `saveContent(updatedContent)` server action via `useTransition`; show success (`admin.contentSaved`) or error — map `error:'invalid'`→validation msg, `error:'readonly'`→`admin.contentReadonly` ("Em produção a edição não persiste (ambiente read-only). Edite localmente e faça deploy."). Bilingual UI labels, both themes, BRAND.md (red save button white ring). Keep it organized (accordions/sections) so the big form is manageable.
- `actions.ts` ('use server'): `saveContent(content)` → re-check session (import verifySessionToken + cookies; reject if no session) → `writeSiteContent(content)` → revalidate the public pages (`revalidatePath('/', 'layout')` or the locale paths) so the site reflects → return the result.
- Add `admin.content` (nav "Conteúdo"/"Content"), `admin.contentTitle`, section labels, field labels, `admin.save`, `admin.contentSaved`, `admin.contentReadonly`, `admin.contentInvalid` to BOTH catalogs (parity).
- Commit.

### Task CC3 — Verify the site reads the CRUD + E2E
- `npm run test` + `typecheck` + `build` (all green; admin dynamic).
- Manual (dev): log in → /admin/conteudo → change a hero/footer text → Salvar → open the public home (dev) → the change shows. Confirm both themes + both locales. Confirm save action requires a session (guarded). Confirm a malformed/readonly path returns the right message.
- Commit any fixes.

**Out of scope (next):** News CRUD, highlights ordering, matches/sponsors editing, image upload.
