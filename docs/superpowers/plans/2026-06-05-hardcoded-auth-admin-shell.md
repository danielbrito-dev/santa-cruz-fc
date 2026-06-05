# Hardcoded Auth + Admin Shell — Implementation Plan

> Branch: `feat/admin-auth`. Execute task-by-task with review. Replaces Supabase auth temporarily with a hardcoded user; the auth layer is isolated so Supabase can swap in later (Phase 2 proper).

**Goal:** A functional login with a hardcoded user (real signed-cookie session) that gates a protected `/admin` shell (sidebar modules, dashboard, logout). No CRUD yet.

**Architecture:** Server-only credential constant + HMAC-signed httpOnly session cookie. The existing `/entrar` form calls a Next Server Action that verifies the credential, sets the cookie, and redirects to `/admin`. `app/[locale]/admin/layout.tsx` guards on the server (no session → redirect `/entrar`). Single hardcoded super-user → no permission system yet (module nav present, gating trivial).

**Tech:** Next 16 App Router (Server Actions, `cookies()` from `next/headers`), Node `crypto` HMAC (no new dep), next-intl, Vitest.

**Default credentials (change the constant later):** `admin@santacruz.fc` / `cobracoral1914`.

---

### Task AA1 — Session + dev-user (server/auth)
**Files:** create `server/auth/dev-user.ts`, `server/auth/session.ts`; test `tests/auth/session.test.ts`.
- `dev-user.ts`: `export const DEV_USER = { email: 'admin@santacruz.fc', password: 'cobracoral1914', name: 'Admin' }` + `export function verifyCredentials(email, password): boolean` (trim + case-insensitive email compare, exact password). Server-only (no 'use client'). Comment: `// TODO(Phase 2): replace with Supabase Auth`.
- `session.ts`: `SESSION_COOKIE='scfc_session'`. Use Node `crypto.createHmac('sha256', SECRET)` over a payload `email|issuedAt`; token = `base64url(payload).base64url(sig)`. `createSessionToken(email): string`, `verifySessionToken(token): {email}|null` (recompute HMAC, constant-time compare, reject if malformed/tampered). `SECRET` = a module constant (documented replaceable; ideally env `AUTH_SECRET` later — read `process.env.AUTH_SECRET ?? '<constant>'`). NO cookie I/O here (pure token funcs — testable).
- TDD test: valid token round-trips to the email; tampered/garbage token → null; wrong-signature → null.
- Commit.

### Task AA2 — Login Server Action wired to /entrar
**Files:** create `server/auth/actions.ts` ('use server'); modify `components/auth/login-form.tsx`; test `tests/auth/actions.test.ts` (verifyCredentials path) — note Server Actions that set cookies/redirect are hard to unit-test, so test the underlying `verifyCredentials` + token, and keep the action thin.
- `actions.ts`: `'use server'`. `export async function login(_prev, formData)`: read email/password, `verifyCredentials` → if ok: set cookie via `cookies().set(SESSION_COOKIE, createSessionToken(email), {httpOnly:true, sameSite:'lax', secure: production, path:'/'})` then `redirect('/admin')` (locale-aware redirect to `/${locale}/admin` — pass locale via a hidden field or the form; simplest: redirect to `/admin` and let middleware add locale, OR include locale hidden input). If bad: `return { error: 'invalid' }`. `export async function logout()`: clear cookie + `redirect('/entrar')`.
- `login-form.tsx`: wire the email/password submit to call `login` via `useActionState` (React 19) or a form `action`; keep client-side required/email validation first; show the action's `{error:'invalid'}` as a localized message (`auth.errInvalid` "E-mail ou senha incorretos" / "Incorrect email or password"). Google button stays the stub "soon". Add `auth.errInvalid` to both catalogs (parity).
- Commit.

### Task AA3 — Protected admin shell
**Files:** create `app/[locale]/admin/layout.tsx`, `app/[locale]/admin/page.tsx`, `app/[locale]/admin/marketing/page.tsx`, `app/[locale]/admin/usuarios/page.tsx`, `components/admin/admin-shell.tsx` (+ `admin-shell.client.tsx` if interactivity needed), `components/admin/logout-button.tsx` ('use client', calls logout action); modify `app/globals.css` (admin chrome CSS), `messages/{pt,en}.json` (admin namespace). Test `tests/admin/guard.test.ts` (getSession-style guard logic if extractable).
- `admin/layout.tsx` (server): read cookie via `cookies()`, `verifySessionToken`; if invalid → `redirect('/entrar')`. Else render the admin shell with `{children}`. `setRequestLocale`.
- Admin shell: sidebar (escudo + module nav: Dashboard, Marketing, Usuários — `Link`s, active state), topbar (logged-in name + `LogoutButton`), content area. Brand-styled, BOTH themes (use tokens), responsive (sidebar collapses on mobile). i18n `admin` namespace (dashboard, marketing, users, welcome, logout, soon...).
- `admin/page.tsx`: dashboard — welcome + cards linking to the modules.
- `marketing/page.tsx` + `usuarios/page.tsx`: placeholder "em breve" pages (the CRUD comes next).
- Commit.

### Task AA4 — Verification
- `npm run test` (all pass) + `npm run typecheck` + `npm run build` (success; `/pt/admin`, `/en/admin` etc.).
- Manual flow: `/entrar` → wrong creds shows error → correct creds → lands on `/admin` → nav works → logout → back to `/entrar`; `/admin` while logged out → redirects to `/entrar`. Both themes.
- BRAND.md check on admin chrome. Commit any fixes.

---
**Out of scope (next step):** real CRUD (news/highlights/content), Supabase, multi-user permissions.
