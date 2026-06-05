# Admin Redesign + News CRUD — Plan

> Branch `feat/admin-news-redesign`. Persistence = `content/site.json` (dev live; prod read-only → graceful message). **BRAND.md applies to the admin too:** Inter only, red `#DD0000`, black never touches red without white between, escudo ≥50px no effects, gold/gray accents only. Aesthetic: professional, on-brand, clarity > density. Use `frontend-design` for the UI tasks.

**Goal:** A redesigned, professional on-brand admin (shell, dashboard, content editor with better UX) PLUS a real **News CRUD** (list + add/edit/publish, PT/EN, cover, draft/published, featured) whose published items drive the public site.

---

### Task AR1 — News data model + store actions + public published-filter (backend, TDD)
**Files:** modify `server/content/types.ts` (NewsItem), `server/content/schema.ts`, `content/site.json` (migrate existing news), `components/site/news-section.tsx` (filter published); create `server/content/news-actions.ts` ('use server'); tests `tests/content/news-actions.test.ts` (+ adjust existing news tests).
- `NewsItem`: add `status: 'draft' | 'published'` and `body: LocalizedText`. Update `schema.ts` news shape (`status: z.enum(['draft','published'])`, `body: localized`).
- Migrate `content/site.json`: every existing news item gets `"status": "published"` and `"body": { "pt": "", "en": "" }`. (Keep counts: 1 featured + 5 grid.)
- `news-actions.ts` ('use server') — all session-guarded (verifySessionToken on SESSION_COOKIE; else `{ok:false,error:'unauthorized'}`), read current content via `readSiteContent`, mutate `content.news`, `writeSiteContent`, `revalidatePath('/','layout')`:
  - `createNews(input)`: build a NewsItem (generate id = slug + short suffix; position = max+1; defaults), push, save.
  - `updateNews(id, input)`: replace the matching item (preserve id), save.
  - `deleteNews(id)`: remove, save.
  - Return `{ok:true}` or `{ok:false,error}` (reuse store errors readonly/invalid/unknown + unauthorized). A pure helper `applyNews(content, op)` (no I/O) is the TDD target.
- `components/site/news-section.tsx`: render only `news.filter(n => n.status === 'published')` (featured + grid both filtered). Keep current layout. Drafts never appear publicly.
- Tests: pure `applyNews`/helpers — create adds with published default? (admin sets status), update preserves id + other items, delete removes; schema accepts the migrated site.json; public filter logic (a draft is excluded). Existing news-section test: pass status:'published' in fixtures so it still renders.
- Commit.

### Task AR2 — Admin redesign: shell + dashboard + content editor UX (frontend-design)
**Files:** modify `components/admin/admin-shell.tsx`, `components/admin/admin-nav.tsx`, `app/[locale]/admin/page.tsx` (dashboard), `components/admin/content-editor.tsx`, `app/globals.css` (admin CSS), messages as needed.
- **REQUIRED: `frontend-design` skill.** BRAND.md strict (Inter, #DD0000, white separation, escudo ≥50px no effects, gold accent). Professional club-admin feel; strong hierarchy; clarity.
- Refine the **shell**: cleaner sidebar (brand-aligned surface, clear active state with white-separated red accent), better topbar (page title/breadcrumb + user + logout + theme). Add a "Notícias" nav item (→ `/admin/noticias`) between Conteúdo and Usuários.
- Redesign the **dashboard** (`/admin/page.tsx`): real module tiles (Notícias, Conteúdo, Usuários) with a short description + a quick stat where cheap (e.g. published news count via `readSiteContent`) + primary action ("Nova notícia", "Editar conteúdo"). Welcoming, organized.
- Improve the **content editor UX**: replace the wall-of-fields with a clearer pattern — a left in-page section nav (Hero/Banners/Cards/Footer) or tabs, a single global language toggle (PT|EN) instead of side-by-side per field (less visual noise), sticky save with clear status. Keep preserving non-edited blocks. Keep both themes.
- Both themes; responsive; all tests green.
- Commit.

### Task AR3 — News admin UI: list + add/edit (frontend-design, follows AR2 design)
**Files:** create `app/[locale]/admin/noticias/page.tsx` (list), `app/[locale]/admin/noticias/nova/page.tsx` (create), `app/[locale]/admin/noticias/[id]/page.tsx` (edit), `components/admin/news-list.tsx`, `components/admin/news-form.tsx` ('use client'); modify globals.css; messages (`admin.news*`).
- **REQUIRED: `frontend-design` skill**, BRAND.md strict, reuse AR2's admin design language.
- **List** (`/admin/noticias`): a clean table/cards of news — cover thumb, title (PT), tag, **status badge** (draft/published, gold/red on white per BRAND.md), date, **featured** indicator; row actions Edit/Delete (delete with confirm); a prominent **"Nova notícia"** button. Empty state.
- **Form** (`nova` + `[id]`): a well-structured form (NOT a wall): title PT/EN, slug (auto from PT title, editable), tag PT/EN, excerpt PT/EN, body PT/EN (textarea), coverImage (path text field), photoCount (number), **featured** (toggle), **status** (draft/published segmented control), publishedAt (date). Group sensibly; global PT|EN language toggle; clear primary actions ("Salvar rascunho" / "Publicar"); validation (title required, slug format). Calls createNews/updateNews. Cancel → back to list. Delete on edit page.
- Wire to `news-actions.ts`. Bilingual UI; both themes; success/error messages (incl. readonly).
- Tests: `tests/admin/news-form.test.tsx` (renders fields; validation; submit calls create/update mock with the entered data; status/featured captured).
- Commit.

### Task AR4 — Verify + finish
- Full suite + typecheck + build (admin dynamic).
- Manual (dev): login → dashboard → Notícias → create a DRAFT (not on site) → publish (appears on site) → edit → delete; content editor new UX; both themes + locales; BRAND.md checklist on admin (red #DD0000, Inter, white separation, escudo). 
- Merge to master + deploy.

**Out of scope:** news detail/article page, image upload (path field), matches/sponsors editing, multi-user permissions, Supabase.
