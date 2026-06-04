# Fundação + Site Público (Fase 0 + Fase 1) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold a Next.js (App Router) app on the existing `santa` repo and ship the layout-10 public site as bilingual (PT-BR + EN) React components reading content from a single `ContentSource` (JSON-backed), with Vitest + Stryker + Makefile test infrastructure in place.

**Architecture:** One Next.js app under `app/[locale]/` serves the public site (Phase 1) and later the admin (future phases). Static UI strings live in `messages/{pt,en}.json` (next-intl); dynamic site content lives in `content/site.json` with locale-keyed values (`{pt, en}`) and is read through a `ContentSource` interface (`JsonContentSource` now, `DbContentSource` later). A minimal tRPC scaffold wraps the same `ContentSource` so the pattern exists for the admin phases. The public site is server-rendered; the only client components are the interactive bits (drawer, smart header, calendar carousel).

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS, next-intl, tRPC v11, Vitest + @testing-library/react, Stryker (mutation testing), Make. Node 24, npm.

**Source of visual truth:** `index_10.html` (port faithfully). **Brand authority:** `BRAND.md` (`--red:#DD0000`, preto/branco/dourado, Inter; preto e vermelho nunca se tocam). Historical dates/titles per `CLAUDE.md`.

---

## File Structure

```
santa/
├─ app/
│  ├─ layout.tsx                 # root <html> shell, fonts, providers
│  ├─ [locale]/
│  │  ├─ layout.tsx              # locale provider (next-intl), <body> content
│  │  └─ (site)/page.tsx         # home (composes all sections)
│  └─ api/trpc/[trpc]/route.ts   # tRPC fetch handler
├─ components/site/              # Header, Drawer, Hero, MatchCalendar, NewsSection,
│                                #   BannerStrip, InstitutionalGrid, Sponsors,
│                                #   SocialStrip, Footer (+ their *.client.tsx where needed)
├─ server/
│  ├─ trpc.ts                    # tRPC init + context
│  ├─ routers/_app.ts            # root router
│  ├─ routers/content.ts         # content router (wraps ContentSource)
│  └─ content/
│     ├─ types.ts                # LocalizedText, ContentSource, SiteContent shapes
│     ├─ localized.ts            # resolveLocalized() helper
│     ├─ json-source.ts          # JsonContentSource
│     └─ index.ts                # getContentSource() binding
├─ lib/
│  ├─ i18n/                      # next-intl config (routing.ts, request.ts, navigation.ts)
│  └─ trpc/                      # client.ts (react), server.ts (server caller)
├─ messages/{pt,en}.json         # static UI strings
├─ content/site.json             # dynamic site content (layout 10, PT/EN)
├─ tests/                        # *.test.ts(x) (Vitest)
├─ legacy/                       # index_*.html + old static assets (out of build)
├─ middleware.ts                 # next-intl locale routing
├─ next.config.ts
├─ tailwind.config.ts
├─ postcss.config.mjs
├─ app/globals.css               # brand tokens + base styles + ported component CSS
├─ vitest.config.ts
├─ vitest.setup.ts
├─ stryker.conf.json
├─ drizzle.config.ts             # placeholder for Phase 2 (created, minimal)
├─ tsconfig.json
├─ Makefile
└─ package.json
```

> **Note on UI porting tasks (8–14):** "complete code" for a ported section means: copy the exact markup + CSS for the referenced `index_10.html` line range into the component / `globals.css`, preserving class names, and replace hardcoded text/images with values read from `ContentSource` + next-intl. The plan gives each component's TypeScript signature, the exact source line range to transplant, and the test. Do not invent new markup — transplant and parameterize.

---

## PHASE 0 — Foundation

### Task 1: Scaffold Next.js app + Vitest + move legacy files

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `next-env.d.ts`, `.gitignore` (update), `vitest.config.ts`, `vitest.setup.ts`, `app/layout.tsx`, `app/[locale]/(site)/page.tsx`
- Create dir: `legacy/`
- Move: `index_1.html`..`index_10.html`, `index.html`, `index_1.html`, `Santa Cruz Futebol Clube*`, `manual de marca/`, `*.pdf` previews → `legacy/` (keep `index_10.html` ALSO copied as reference; keep `images/` and `patrocinadores/` where they are — they will be served from `public/`)
- Test: `tests/smoke.test.ts`

- [ ] **Step 1: Initialize package.json and install deps**

Run:
```bash
npm init -y
npm pkg set name="santa-cruz-fc" private=true type="module"
npm install next@latest react@latest react-dom@latest
npm install next-intl @trpc/server@next @trpc/client@next @trpc/react-query@next @tanstack/react-query zod superjson
npm install -D typescript @types/react @types/react-dom @types/node
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 2: Add scripts to package.json**

Run:
```bash
npm pkg set scripts.dev="next dev" scripts.build="next build" scripts.start="next start" scripts.lint="next lint" scripts.typecheck="tsc --noEmit" scripts.test="vitest run" scripts.test:watch="vitest" scripts.coverage="vitest run --coverage"
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "legacy"]
}
```

- [ ] **Step 4: Create next.config.ts with next-intl plugin placeholder**

```ts
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./lib/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingExcludes: { '*': ['./legacy/**'] },
};

export default withNextIntl(nextConfig);
```

- [ ] **Step 5: Create vitest.config.ts and vitest.setup.ts**

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./', import.meta.url)) },
  },
});
```

`vitest.setup.ts`:
```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 6: Create minimal root + home so the app boots**

`app/layout.tsx`:
```tsx
import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
```

`app/[locale]/(site)/page.tsx`:
```tsx
export default function HomePage() {
  return <main>Santa Cruz FC</main>;
}
```

- [ ] **Step 7: Move legacy files out of the build**

Run (PowerShell):
```powershell
New-Item -ItemType Directory -Force legacy
Move-Item index.html, index_1.html, index_2.html, index_3.html, index_4.html, index_5.html, index_6.html, index_7.html, index_8.html, index_9.html legacy/ -Force
Copy-Item index_10.html legacy/ -Force
Move-Item index_10.html legacy/index_10_source.html -Force
Move-Item "Santa Cruz Futebol Clube - Recife PE _ Site Oficial _.html" legacy/ -Force
Move-Item "Santa Cruz Futebol Clube - Recife PE _ Site Oficial __files" legacy/ -Force
Move-Item "manual de marca" legacy/ -Force
Remove-Item nul -Force -ErrorAction SilentlyContinue
```
> `legacy/index_10_source.html` is the porting reference for Tasks 2 & 8–14.

- [ ] **Step 8: Move site images into `public/`**

Run (PowerShell):
```powershell
New-Item -ItemType Directory -Force public
Move-Item images public/ -Force
Move-Item patrocinadores public/ -Force
```
> Image paths in `site.json` will therefore be `/images/...` and `/patrocinadores/...`.

- [ ] **Step 9: Update .gitignore**

Append to `.gitignore`:
```
/node_modules
/.next
/coverage
/reports
/.stryker-tmp
*.tsbuildinfo
.env*.local
```

- [ ] **Step 10: Write smoke test**

`tests/smoke.test.ts`:
```ts
import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('runs the test runner', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 11: Run smoke test**

Run: `npm run test`
Expected: PASS (1 test).

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "chore: scaffold next.js app, move legacy static site, add vitest"
```

---

### Task 2: Tailwind + brand tokens + Inter + globals.css

**Files:**
- Create: `tailwind.config.ts`, `postcss.config.mjs`, `app/globals.css`
- Modify: `app/layout.tsx`
- Test: `tests/brand-tokens.test.ts`

- [ ] **Step 1: Install Tailwind**

Run:
```bash
npm install -D tailwindcss postcss autoprefixer
```

- [ ] **Step 2: Create postcss.config.mjs**

```js
export default { plugins: { tailwindcss: {}, autoprefixer: {} } };
```

- [ ] **Step 3: Create tailwind.config.ts with BRAND.md tokens**

```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        black: '#000000',
        white: '#FFFFFF',
        red: '#DD0000',     // BRAND.md exact red
        gold: '#C9B896',
        gray: '#D6D7D8',
        ink: '#0A0A0A',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      maxWidth: { container: '1320px' },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 4: Create app/globals.css with brand CSS variables + reset**

Transplant the `:root` token block and reset from `legacy/index_10_source.html` lines 12–47 into `app/globals.css`, prefixed with Tailwind directives. Top of file:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ===== tokens (BRAND.md) — transplanted from index_10 :root ===== */
:root{
  --black:#000000; --white:#FFFFFF; --red:#DD0000;
  --gold:#C9B896; --gray:#D6D7D8; --ink:#0A0A0A;
  --fita-azul:#0A1A3D; --ink-2:#3A3A3A; --muted:#6E6E6E;
  --line:#E5E5E5; --bg-2:#F5F5F5; --bg-3:#FAFAFA;
}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{font-family:'Inter',system-ui,sans-serif;background:#FFFFFF;color:#0A0A0A;-webkit-font-smoothing:antialiased;font-size:16px;line-height:1.5;min-height:100vh}
a{color:inherit;text-decoration:none}
img{display:block;max-width:100%}
button{font-family:inherit;cursor:pointer;border:none;background:none;color:inherit}
ul{list-style:none}
.container{max-width:1320px;margin:0 auto;padding:0 24px}
@media (max-width:768px){.container{padding:0 16px}}
```
> Component-specific CSS blocks (header, hero, news, …) are transplanted in their respective tasks (8–14), each appended to `globals.css` under a labeled section.

- [ ] **Step 5: Load Inter and globals in root layout**

Replace `app/layout.tsx`:
```tsx
import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], weight: ['300','400','600','700','800','900'], variable: '--font-inter' });

export default function RootLayout({ children }: { children: ReactNode }) {
  return <div className={inter.variable}>{children}</div>;
}
```
> The `<html>`/`<body>` tags are emitted by `app/[locale]/layout.tsx` (Task 3) so the lang attribute matches the locale.

- [ ] **Step 6: Write brand token test**

`tests/brand-tokens.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('brand tokens (BRAND.md compliance)', () => {
  const css = readFileSync('app/globals.css', 'utf8');
  it('uses the exact brand red #DD0000', () => {
    expect(css).toMatch(/--red:\s*#DD0000/i);
  });
  it('does not use the legacy cordel red #CF1715', () => {
    expect(css).not.toMatch(/#CF1715/i);
  });
});
```

- [ ] **Step 7: Run test**

Run: `npm run test -- tests/brand-tokens.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: tailwind + BRAND.md tokens + Inter + globals reset"
```

---

### Task 3: i18n with next-intl (PT-BR default + EN)

**Files:**
- Create: `lib/i18n/routing.ts`, `lib/i18n/navigation.ts`, `lib/i18n/request.ts`, `middleware.ts`, `messages/pt.json`, `messages/en.json`, `app/[locale]/layout.tsx`
- Modify: `app/[locale]/(site)/page.tsx`
- Test: `tests/i18n.test.ts`

- [ ] **Step 1: Define routing**

`lib/i18n/routing.ts`:
```ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['pt', 'en'],
  defaultLocale: 'pt',
  localePrefix: 'as-needed', // pt at '/', en at '/en'
});

export type Locale = (typeof routing.locales)[number];
```

`lib/i18n/navigation.ts`:
```ts
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
```

- [ ] **Step 2: Wire request config**

`lib/i18n/request.ts`:
```ts
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = routing.locales.includes(requested as any) ? requested! : routing.defaultLocale;
  return { locale, messages: (await import(`@/messages/${locale}.json`)).default };
});
```

- [ ] **Step 3: Create middleware**

`middleware.ts`:
```ts
import createMiddleware from 'next-intl/middleware';
import { routing } from './lib/i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/((?!api|_next|_vercel|images|patrocinadores|.*\\..*).*)'],
};
```

- [ ] **Step 4: Seed message catalogs**

`messages/pt.json`:
```json
{
  "nav": { "news": "Notícias", "calendar": "Calendário", "tvCoral": "TV Coral", "login": "Entrar", "tickets": "Ingressos", "shop": "Loja", "menu": "Menu" },
  "common": { "allNews": "Todas as notícias", "matchCenter": "Match Center", "becomeMember": "Seja Sócio Coral", "skipToContent": "Pular para o conteúdo" },
  "calendar": { "title": "Calendário" }
}
```
`messages/en.json`:
```json
{
  "nav": { "news": "News", "calendar": "Schedule", "tvCoral": "Coral TV", "login": "Sign in", "tickets": "Tickets", "shop": "Shop", "menu": "Menu" },
  "common": { "allNews": "All news", "matchCenter": "Match Center", "becomeMember": "Become a Member", "skipToContent": "Skip to content" },
  "calendar": { "title": "Schedule" }
}
```

- [ ] **Step 5: Create the locale layout (emits html/body)**

`app/[locale]/layout.tsx`:
```tsx
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/lib/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Use a translation in the home to prove wiring**

`app/[locale]/(site)/page.tsx`:
```tsx
import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('nav');
  return <main>{t('news')}</main>;
}
```

- [ ] **Step 7: Write i18n test**

`tests/i18n.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { routing } from '@/lib/i18n/routing';
import pt from '@/messages/pt.json';
import en from '@/messages/en.json';

describe('i18n', () => {
  it('has pt as default and supports pt+en', () => {
    expect(routing.defaultLocale).toBe('pt');
    expect(routing.locales).toEqual(['pt', 'en']);
  });
  it('pt and en catalogs have identical key shapes', () => {
    const keys = (o: any, p = ''): string[] =>
      Object.entries(o).flatMap(([k, v]) =>
        v && typeof v === 'object' ? keys(v, `${p}${k}.`) : [`${p}${k}`]);
    expect(keys(pt).sort()).toEqual(keys(en).sort());
  });
});
```

- [ ] **Step 8: Run test**

Run: `npm run test -- tests/i18n.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 9: Verify dev boot manually**

Run: `npm run dev` then open `http://localhost:3000` (shows "Notícias") and `http://localhost:3000/en` (shows "News"). Stop the server.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: next-intl i18n (pt default + en) with locale layout"
```

---

### Task 4: Content layer (LocalizedText + ContentSource + JsonContentSource)

**Files:**
- Create: `server/content/types.ts`, `server/content/localized.ts`, `server/content/json-source.ts`, `server/content/index.ts`, `content/site.json`
- Test: `tests/content/localized.test.ts`, `tests/content/json-source.test.ts`

- [ ] **Step 1: Define types**

`server/content/types.ts`:
```ts
import type { Locale } from '@/lib/i18n/routing';

export type LocalizedText = Record<Locale, string>;

export interface MatchItem {
  id: string; competition: string; comp: 'pernambucano' | 'nordeste' | 'copa-br';
  opponent: string; opponentShort: string; isHome: boolean;
  status: LocalizedText; scoreHome: number | null; scoreAway: number | null;
  matchCenterUrl: string;
}
export interface NewsItem {
  id: string; slug: string; tag: LocalizedText; title: LocalizedText;
  excerpt: LocalizedText; coverImage: string; photoCount: number;
  publishedAt: string; featured: boolean; position: number;
}
export interface CardItem {
  id: string; eyebrow: LocalizedText; title: LocalizedText; image: string;
  ctaLabel: LocalizedText; ctaUrl: string; size: 'span' | 'normal'; position: number;
}
export interface Sponsor { id: string; name: string; logo: string; url: string; tier: 'master' | 'fornecedor' | 'apoio'; position: number; }
export interface SocialLink { id: string; network: string; url: string; }
export interface FooterColumn { heading: LocalizedText; links: { label: LocalizedText; url: string }[]; }

export interface SiteContent {
  hero: { tagline: LocalizedText; ctaLabel: LocalizedText; ctaUrl: string; backdrop: string; titleLine1: LocalizedText; titleLine2: LocalizedText };
  matches: MatchItem[];
  news: NewsItem[];
  banners: CardItem[];
  institutional: CardItem[];
  sponsors: Sponsor[];
  social: SocialLink[];
  footer: { brandBlurb: LocalizedText; columns: FooterColumn[]; chantLine1: LocalizedText; chantEmphasis: LocalizedText; chantLine2: LocalizedText };
}

export interface ContentSource {
  getSiteContent(): Promise<SiteContent>;
}
```

- [ ] **Step 2: Write failing test for resolveLocalized**

`tests/content/localized.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { resolveLocalized } from '@/server/content/localized';

describe('resolveLocalized', () => {
  const t = { pt: 'Notícias', en: 'News' };
  it('returns the value for the requested locale', () => {
    expect(resolveLocalized(t, 'en')).toBe('News');
  });
  it('falls back to pt when the locale value is missing', () => {
    expect(resolveLocalized({ pt: 'Só PT' } as any, 'en')).toBe('Só PT');
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm run test -- tests/content/localized.test.ts`
Expected: FAIL ("Failed to resolve import" / resolveLocalized is not a function).

- [ ] **Step 4: Implement resolveLocalized**

`server/content/localized.ts`:
```ts
import type { Locale } from '@/lib/i18n/routing';
import type { LocalizedText } from './types';

export function resolveLocalized(text: LocalizedText, locale: Locale): string {
  return text[locale] ?? text.pt ?? '';
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run test -- tests/content/localized.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 6: Create content/site.json**

Build `content/site.json` by extracting the real content from `legacy/index_10_source.html`, giving every text field a `{ "pt": ..., "en": ... }` pair. Use these mappings (PT taken verbatim from the HTML; EN is the translation):
- `hero`: titleLine1 `{pt:"Coral não", en:"Coral never"}`, titleLine2 `{pt:"recua.", en:"backs down."}`, ctaLabel `{pt:"Garantir ingresso", en:"Get tickets"}`, ctaUrl `"#"`, backdrop `"/images/torcida1.jpg"`.
- `matches`: the 8 `<article class="match">` cards (lines 1233–1383). Map `data-comp`→`comp`, badge→`competition`, the status line→`status`, scores→`scoreHome/scoreAway` (null when absent), opponent name + 3-letter shield→`opponent`/`opponentShort`, `isHome` from which row has the `home` shield.
- `news`: featured (lines 1402–1411) → `featured:true, position:0`; the 5 grid items (1414–1472) → `position:1..5`. Map tag, title (h3/h4), coverImage (img src under `/images/...`), photoCount, publishedAt (featured has a date; grid items use the same date string or empty).
- `banners`: the 2 `banner-card` (1482–1500): eyebrow, title (strip `<br>`), ctaLabel, ctaUrl, image.
- `institutional`: the 4 `inst-card` (1513–1551): the 2 `span-rows` → `size:"span"`, the others `size:"normal"`; eyebrow, title, ctaLabel, ctaUrl, image.
- `sponsors`: master block (1560–1561) → tier `master`/`fornecedor`; grid (1565–1574) → tier `apoio`. name/logo/url from each `<img>`/`<a>`.
- `social`: the 6 links in `social-strip` (1582–1587): network + url.
- `footer`: brandBlurb (line 1597), the 4 columns (1599–1642) headings+links, chant (1662–1664): chantLine1 `{pt:"É",en:"It's"}`, chantEmphasis `{pt:"tradição",en:"tradition"}`, chantLine2 `{pt:", não é moda.",en:", not a trend."}`.

> Keep `id`s stable kebab-case strings (e.g. `"match-santa-nautico"`). This file is the Phase-1 source of truth and the Phase-3 seed input.

- [ ] **Step 7: Write failing test for JsonContentSource**

`tests/content/json-source.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { JsonContentSource } from '@/server/content/json-source';

describe('JsonContentSource', () => {
  const source = new JsonContentSource();
  it('loads site content from content/site.json', async () => {
    const c = await source.getSiteContent();
    expect(c.hero.titleLine1.pt).toBe('Coral não');
    expect(c.hero.titleLine1.en).toBeTruthy();
  });
  it('exposes a featured news item at position 0', async () => {
    const c = await source.getSiteContent();
    const featured = c.news.find((n) => n.featured);
    expect(featured).toBeDefined();
    expect(featured!.position).toBe(0);
  });
  it('has 8 matches and 12 sponsors', async () => {
    const c = await source.getSiteContent();
    expect(c.matches).toHaveLength(8);
    expect(c.sponsors).toHaveLength(12);
  });
});
```

- [ ] **Step 8: Run test to verify it fails**

Run: `npm run test -- tests/content/json-source.test.ts`
Expected: FAIL (JsonContentSource not found).

- [ ] **Step 9: Implement JsonContentSource + binding**

`server/content/json-source.ts`:
```ts
import type { ContentSource, SiteContent } from './types';
import data from '@/content/site.json';

export class JsonContentSource implements ContentSource {
  async getSiteContent(): Promise<SiteContent> {
    return data as unknown as SiteContent;
  }
}
```

`server/content/index.ts`:
```ts
import type { ContentSource } from './types';
import { JsonContentSource } from './json-source';

// Phase 1: JSON. Phase 3 swaps this binding to DbContentSource.
let instance: ContentSource | null = null;
export function getContentSource(): ContentSource {
  if (!instance) instance = new JsonContentSource();
  return instance;
}
```

- [ ] **Step 10: Run test to verify it passes**

Run: `npm run test -- tests/content/json-source.test.ts`
Expected: PASS (3 tests). Adjust the `site.json` counts if the HTML extraction differs, but it should be 8 matches / 12 sponsors.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: content layer (LocalizedText, ContentSource, JsonContentSource) + site.json"
```

---

### Task 5: tRPC scaffold (content router wrapping ContentSource)

**Files:**
- Create: `server/trpc.ts`, `server/routers/content.ts`, `server/routers/_app.ts`, `app/api/trpc/[trpc]/route.ts`, `lib/trpc/server.ts`, `lib/trpc/client.ts`
- Test: `tests/server/content-router.test.ts`

- [ ] **Step 1: Init tRPC + context**

`server/trpc.ts`:
```ts
import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { getContentSource } from './content';

export async function createContext() {
  return { content: getContentSource() };
}
export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({ transformer: superjson });
export const router = t.router;
export const publicProcedure = t.procedure;
```

- [ ] **Step 2: Content router**

`server/routers/content.ts`:
```ts
import { router, publicProcedure } from '../trpc';

export const contentRouter = router({
  site: publicProcedure.query(({ ctx }) => ctx.content.getSiteContent()),
});
```

`server/routers/_app.ts`:
```ts
import { router } from '../trpc';
import { contentRouter } from './content';

export const appRouter = router({ content: contentRouter });
export type AppRouter = typeof appRouter;
```

- [ ] **Step 3: Route handler**

`app/api/trpc/[trpc]/route.ts`:
```ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/routers/_app';
import { createContext } from '@/server/trpc';

const handler = (req: Request) =>
  fetchRequestHandler({ endpoint: '/api/trpc', req, router: appRouter, createContext });

export { handler as GET, handler as POST };
```

- [ ] **Step 4: Server caller + react client**

`lib/trpc/server.ts`:
```ts
import { appRouter } from '@/server/routers/_app';
import { createContext } from '@/server/trpc';

// Server Components read content directly via this caller (no HTTP round-trip).
export async function getServerApi() {
  return appRouter.createCaller(await createContext());
}
```

`lib/trpc/client.ts`:
```ts
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/server/routers/_app';

export const trpc = createTRPCReact<AppRouter>();
```

- [ ] **Step 5: Write failing test for the content router**

`tests/server/content-router.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { appRouter } from '@/server/routers/_app';
import { createContext } from '@/server/trpc';

describe('content router', () => {
  it('content.site returns the full site content', async () => {
    const caller = appRouter.createCaller(await createContext());
    const site = await caller.content.site();
    expect(site.hero.ctaUrl).toBeDefined();
    expect(site.matches.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 6: Run test**

Run: `npm run test -- tests/server/content-router.test.ts`
Expected: PASS (1 test).

- [ ] **Step 7: Typecheck the whole project**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: tRPC scaffold with content router wrapping ContentSource"
```

---

### Task 6: Stryker mutation testing + Makefile + drizzle placeholder

**Files:**
- Create: `stryker.conf.json`, `Makefile`, `drizzle.config.ts`
- Modify: `package.json` (add `mutation` script)
- Test: `make mutation` runs against domain logic

- [ ] **Step 1: Install Stryker**

Run:
```bash
npm install -D @stryker-mutator/core @stryker-mutator/vitest-runner
npm pkg set scripts.mutation="stryker run"
```

- [ ] **Step 2: Configure Stryker on domain logic only**

`stryker.conf.json`:
```json
{
  "$schema": "https://raw.githubusercontent.com/stryker-mutator/stryker-js/master/packages/api/schema/stryker-schema.json",
  "packageManager": "npm",
  "testRunner": "vitest",
  "reporters": ["html", "clear-text", "progress"],
  "coverageAnalysis": "perTest",
  "mutate": [
    "server/content/**/*.ts",
    "server/routers/**/*.ts",
    "!server/**/*.test.ts"
  ],
  "htmlReporter": { "fileName": "reports/mutation/index.html" },
  "thresholds": { "high": 80, "low": 60, "break": 50 }
}
```
> Mutation testing targets domain logic (content layer + routers) per the spec; UI is out of the initial mutation scope.

- [ ] **Step 3: Create the Makefile**

`Makefile`:
```makefile
.PHONY: dev build test test-watch coverage mutation lint typecheck db-generate db-migrate seed

dev:        ## run the dev server
	npm run dev
build:      ## production build
	npm run build
test:       ## run unit/integration tests once
	npm run test
test-watch: ## run tests in watch mode
	npm run test:watch
coverage:   ## test coverage report
	npm run coverage
mutation:   ## Stryker mutation testing (domain logic)
	npm run mutation
lint:       ## lint
	npm run lint
typecheck:  ## TypeScript typecheck
	npm run typecheck
db-generate: ## (Phase 2) drizzle: generate migration from schema
	npx drizzle-kit generate
db-migrate:  ## (Phase 2) drizzle: apply migrations
	npx drizzle-kit migrate
seed:        ## (Phase 3) import content/site.json into the DB
	npx tsx server/db/seed.ts
```
> `db-*` and `seed` targets are stubs that activate in later phases; they are listed now so the command surface is stable.

- [ ] **Step 4: Create drizzle.config.ts placeholder (Phase 2 ready)**

`drizzle.config.ts`:
```ts
import type { Config } from 'drizzle-kit';

// Phase 2: schema + DATABASE_URL (Supabase) get wired here.
export default {
  schema: './server/db/schema.ts',
  out: './server/db/migrations',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL ?? '' },
} satisfies Config;
```

- [ ] **Step 5: Run mutation testing**

Run: `make mutation`
Expected: Stryker runs, mutates `server/content` + `server/routers`, reports a mutation score, and does not break (score ≥ 50). If the score is below `break`, add unit tests in `tests/content` to kill surviving mutants before continuing.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: stryker mutation testing, Makefile, drizzle config placeholder"
```

---

## PHASE 1 — Public site (port layout 10, bilingual)

> **Pattern for Tasks 7–14:** each component is a Server Component receiving the already-resolved data for the active locale, unless it needs interactivity (then a sibling `*.client.tsx` marked `'use client'`). The home page (Task 14) loads `SiteContent` once via `getServerApi()` and the active `locale`, and passes slices down. CSS for each section is transplanted from `legacy/index_10_source.html` into a labeled block appended to `app/globals.css`. Static labels come from next-intl; dynamic text from `resolveLocalized(...)`.

### Task 7: Site shell wiring (home loads content + locale)

**Files:**
- Modify: `app/[locale]/(site)/page.tsx`
- Create: `components/site/types.ts`
- Test: `tests/site/home-data.test.tsx`

- [ ] **Step 1: Shared prop type for sections**

`components/site/types.ts`:
```ts
import type { Locale } from '@/lib/i18n/routing';
import type { SiteContent } from '@/server/content/types';
export interface SectionProps { content: SiteContent; locale: Locale; }
```

- [ ] **Step 2: Load content in the home page (placeholder render)**

`app/[locale]/(site)/page.tsx`:
```tsx
import { setRequestLocale } from 'next-intl/server';
import { getServerApi } from '@/lib/trpc/server';
import type { Locale } from '@/lib/i18n/routing';

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const api = await getServerApi();
  const content = await api.content.site();
  return <main data-testid="home" data-matches={content.matches.length} />;
}
```

- [ ] **Step 3: Write test that the home loads content**

`tests/site/home-data.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { getServerApi } from '@/lib/trpc/server';

describe('home data', () => {
  it('server api yields matches and news for the page', async () => {
    const api = await getServerApi();
    const content = await api.content.site();
    expect(content.matches.length).toBe(8);
    expect(content.news.some((n) => n.featured)).toBe(true);
  });
});
```

- [ ] **Step 4: Run test**

Run: `npm run test -- tests/site/home-data.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: home page loads SiteContent via server caller"
```

---

### Task 8: Header + Drawer

**Files:**
- Create: `components/site/header.tsx` (server), `components/site/header.client.tsx` (`'use client'`: smart-header scroll + drawer open/close), `components/site/locale-switcher.tsx` (`'use client'`)
- Modify: `app/globals.css` (append header + drawer CSS, lines 49–229 of source), `app/[locale]/(site)/page.tsx`
- Test: `tests/site/header.test.tsx`

- [ ] **Step 1: Transplant header + drawer CSS**

Append `legacy/index_10_source.html` lines 49–229 (`.site-header` … `.drawer-foot`) to `app/globals.css` under `/* ===== header + drawer ===== */`.

- [ ] **Step 2: Build the client behavior shell**

`components/site/header.client.tsx` — port the drawer open/close + smart-header logic from source lines 1671–1735 into a `'use client'` component that renders the `<header>` + `<aside class="drawer">` markup (source lines 1050–1164), using `next-intl`'s `useTranslations('nav')` for labels and `Link` from `@/lib/i18n/navigation` for internal links. Nav item labels (Clube/Futebol/Marketing/Imprensa submenus) come from `messages` (add the keys used). Logo: `/images/logo.png`.

- [ ] **Step 3: Locale switcher**

`components/site/locale-switcher.tsx`:
```tsx
'use client';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/lib/i18n/navigation';
import { routing } from '@/lib/i18n/routing';

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  return (
    <div className="header-lang">
      {routing.locales.map((l) => (
        <a key={l} className={l === locale ? 'active' : ''}
           onClick={() => router.replace(pathname, { locale: l })}>
          {l.toUpperCase()}
        </a>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Server wrapper + mount in page**

`components/site/header.tsx` renders `<HeaderClient/>` (server component boundary so it can be composed; keep it thin). Add `<Header />` as the first child of `<main>`/page (above the hero) in `page.tsx`.

- [ ] **Step 5: Write header test**

`tests/site/header.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import pt from '@/messages/pt.json';
import { HeaderClient } from '@/components/site/header.client';

describe('Header', () => {
  it('renders translated nav labels and the crest', () => {
    render(
      <NextIntlClientProvider locale="pt" messages={pt}>
        <HeaderClient />
      </NextIntlClientProvider>,
    );
    expect(screen.getByText('Notícias')).toBeInTheDocument();
    expect(screen.getByAltText(/Santa Cruz/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Run test**

Run: `npm run test -- tests/site/header.test.tsx`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: header + drawer + locale switcher (ported from layout 10)"
```

---

### Task 9: Hero + MatchCalendar

**Files:**
- Create: `components/site/hero.tsx` (server), `components/site/match-calendar.tsx` (server: cards), `components/site/match-calendar.client.tsx` (`'use client'`: carousel prev/next from source 1753–1777)
- Modify: `app/globals.css` (append hero + calendar CSS, lines 231–549), `app/[locale]/(site)/page.tsx`
- Test: `tests/site/hero.test.tsx`, `tests/site/match-calendar.test.tsx`

- [ ] **Step 1: Transplant hero + calendar CSS**

Append source lines 231–549 to `app/globals.css` under `/* ===== hero + calendar ===== */`. Include the SVG filter `<defs>` (grain) from lines 1166–1193 into `hero.tsx` markup (or a shared `components/site/svg-filters.tsx`).

- [ ] **Step 2: Hero component**

`components/site/hero.tsx` — port source lines 1196–1211. Signature:
```tsx
import type { SectionProps } from './types';
import { resolveLocalized } from '@/server/content/localized';
export function Hero({ content, locale }: SectionProps) { /* render hero-card from content.hero, backdrop img, title lines, CTA */ return (/* ported markup */ null); }
```
Title: `titleLine1` then `titleLine2`; keep the `<em>` red word styling by wrapping the emphasis token. CTA label via `resolveLocalized(content.hero.ctaLabel, locale)`.

- [ ] **Step 3: MatchCalendar (server cards + client carousel)**

`components/site/match-calendar.tsx` maps `content.matches` → `.match` cards (port markup from source 1233–1383, one card from data), wrapping the scroll area in `MatchCalendarClient` which holds the `calCarousel`/prev/next logic (source 1753–1777). Section title via `useTranslations('calendar')`. Home crest: `/images/logo.png`; opponent shield shows `opponentShort` or `<img>`.

- [ ] **Step 4: Mount hero+calendar in page**

In `page.tsx`, render `<section className="hero" id="calendario"><Hero .../><MatchCalendar .../></section>` after the header.

- [ ] **Step 5: Tests**

`tests/site/hero.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Hero } from '@/components/site/hero';

const content: any = { hero: { titleLine1:{pt:'Coral não',en:'Coral never'}, titleLine2:{pt:'recua.',en:'backs down.'}, ctaLabel:{pt:'Garantir ingresso',en:'Get tickets'}, ctaUrl:'#', backdrop:'/images/torcida1.jpg' } };

describe('Hero', () => {
  it('renders the localized tagline and CTA (pt)', () => {
    render(<Hero content={content} locale="pt" />);
    expect(screen.getByText(/Garantir ingresso/)).toBeInTheDocument();
  });
  it('renders English CTA when locale is en', () => {
    render(<Hero content={content} locale="en" />);
    expect(screen.getByText(/Get tickets/)).toBeInTheDocument();
  });
});
```

`tests/site/match-calendar.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import pt from '@/messages/pt.json';
import { MatchCalendar } from '@/components/site/match-calendar';

const content: any = { matches: [
  { id:'m1', comp:'pernambucano', competition:'Pernambucano', opponent:'Náutico', opponentShort:'NAU', isHome:true, status:{pt:'DOM 25 MAI · FINAL',en:'SUN MAY 25 · FINAL'}, scoreHome:2, scoreAway:0, matchCenterUrl:'#' },
]};

describe('MatchCalendar', () => {
  it('renders one card per match with opponent name', () => {
    render(<NextIntlClientProvider locale="pt" messages={pt}><MatchCalendar content={content} locale="pt" /></NextIntlClientProvider>);
    expect(screen.getByText('Náutico')).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Run tests**

Run: `npm run test -- tests/site/hero.test.tsx tests/site/match-calendar.test.tsx`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: hero + match calendar carousel (ported, bilingual)"
```

---

### Task 10: NewsSection (featured + grid)

**Files:**
- Create: `components/site/news-section.tsx`
- Modify: `app/globals.css` (append news CSS, lines 551–705), `app/[locale]/(site)/page.tsx`
- Test: `tests/site/news-section.test.tsx`

- [ ] **Step 1: Transplant news CSS**

Append source lines 551–705 to `app/globals.css` under `/* ===== news ===== */`.

- [ ] **Step 2: Build component from content**

`components/site/news-section.tsx` — port markup from source 1391–1476. Featured = `content.news.find(n => n.featured)`; grid = `content.news.filter(n => !n.featured).sort(by position)`. Section title via `useTranslations` (add `news.heading` keys: pt "Notícias do Clube" / en "Club News"; render the `<em>` second word styled). "Todas as notícias" via `common.allNews`. Each item: tag, title, photoCount label (pt "{n} fotos" / en "{n} photos" — use ICU plural in messages), coverImage.

- [ ] **Step 3: Mount in page (begin black-background block)**

Add `<NewsSection .../>` after the hero section in `page.tsx`.

- [ ] **Step 4: Test**

`tests/site/news-section.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import pt from '@/messages/pt.json';
import { NewsSection } from '@/components/site/news-section';

const content: any = { news: [
  { id:'f', slug:'f', featured:true, position:0, tag:{pt:'Destaque',en:'Featured'}, title:{pt:'Arruda lotado',en:'Packed Arruda'}, excerpt:{pt:'',en:''}, coverImage:'/images/estadio.jpg', photoCount:0, publishedAt:'2026-05-27' },
  { id:'a', slug:'a', featured:false, position:1, tag:{pt:'Futebol',en:'Football'}, title:{pt:'Patrick renova',en:'Patrick renews'}, excerpt:{pt:'',en:''}, coverImage:'/images/patrick.jpg', photoCount:24, publishedAt:'2026-05-26' },
]};

describe('NewsSection', () => {
  it('renders featured title and a grid item', () => {
    render(<NextIntlClientProvider locale="pt" messages={pt}><NewsSection content={content} locale="pt" /></NextIntlClientProvider>);
    expect(screen.getByText('Arruda lotado')).toBeInTheDocument();
    expect(screen.getByText('Patrick renova')).toBeInTheDocument();
  });
});
```
> Add to `messages/pt.json` & `en.json`: `"news": { "heading1": "Notícias", "heading2": "do Clube", "photos": "{count, plural, one {# foto} other {# fotos}}" }` (and EN equivalents). Keep key shapes identical across locales (Task 3 test enforces this).

- [ ] **Step 5: Run test**

Run: `npm run test -- tests/site/news-section.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: news section (featured + grid, bilingual, plural-aware)"
```

---

### Task 11: BannerStrip + InstitutionalGrid

**Files:**
- Create: `components/site/banner-strip.tsx`, `components/site/institutional-grid.tsx`
- Modify: `app/globals.css` (append banner CSS 772–826 + institutional CSS 707–770), `app/[locale]/(site)/page.tsx`
- Test: `tests/site/banner-strip.test.tsx`

- [ ] **Step 1: Transplant CSS**

Append source lines 707–770 (institutional) and 772–826 (banner) to `app/globals.css` under labeled sections.

- [ ] **Step 2: Components from content**

`banner-strip.tsx` maps `content.banners` (port markup 1478–1503). `institutional-grid.tsx` maps `content.institutional`, applying `inst-card span-rows` when `size==='span'` (port markup 1505–1554). Section title for institutional via messages (`identity.heading` pt "Identidade Coral"). Use `resolveLocalized` for eyebrow/title/ctaLabel.

- [ ] **Step 3: Mount in page**

Add `<BannerStrip/>` then `<InstitutionalGrid/>` after the news section.

- [ ] **Step 4: Test**

`tests/site/banner-strip.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BannerStrip } from '@/components/site/banner-strip';

const content: any = { banners: [
  { id:'b1', eyebrow:{pt:'Sócio Coral',en:'Membership'}, title:{pt:'Sua paixão é tricolor.',en:'Your passion is tricolor.'}, image:'/images/torcida.jpg', ctaLabel:{pt:'Seja sócio',en:'Join'}, ctaUrl:'#', size:'normal', position:0 },
]};

describe('BannerStrip', () => {
  it('renders banner title and CTA', () => {
    render(<BannerStrip content={content} locale="pt" />);
    expect(screen.getByText(/Sua paixão é tricolor/)).toBeInTheDocument();
    expect(screen.getByText(/Seja sócio/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 5: Run test**

Run: `npm run test -- tests/site/banner-strip.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: banner strip + institutional grid (ported, bilingual)"
```

---

### Task 12: Sponsors + SocialStrip

**Files:**
- Create: `components/site/sponsors.tsx`, `components/site/social-strip.tsx`
- Modify: `app/globals.css` (append sponsors CSS 828–867 + social-strip CSS 895–910), `app/[locale]/(site)/page.tsx`
- Test: `tests/site/sponsors.test.tsx`

- [ ] **Step 1: Transplant CSS**

Append source lines 828–867 (sponsors) and 895–910 (social strip) to `app/globals.css`.

- [ ] **Step 2: Components from content**

`sponsors.tsx`: split `content.sponsors` into `tier==='master'||'fornecedor'` (→ `.sponsors-master`) and `tier==='apoio'` (→ `.sponsors-grid`); port markup 1556–1577. `social-strip.tsx`: map `content.social` to the icon links; reuse the exact SVG paths from source 1582–1587 keyed by `network`.

- [ ] **Step 3: Mount in page**

Add `<Sponsors/>` then `<SocialStrip/>` after the institutional grid.

- [ ] **Step 4: Test**

`tests/site/sponsors.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sponsors } from '@/components/site/sponsors';

const content: any = { sponsors: [
  { id:'s1', name:'Bet da Sorte', logo:'/patrocinadores/betdasorte_master.png', url:'#', tier:'master', position:0 },
  { id:'s2', name:'Iquine', logo:'/patrocinadores/iquine.png', url:'#', tier:'apoio', position:1 },
]};

describe('Sponsors', () => {
  it('renders master and grid sponsors with alt text', () => {
    render(<Sponsors content={content} locale="pt" />);
    expect(screen.getByAltText('Bet da Sorte')).toBeInTheDocument();
    expect(screen.getByAltText('Iquine')).toBeInTheDocument();
  });
});
```

- [ ] **Step 5: Run test**

Run: `npm run test -- tests/site/sponsors.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: sponsors + social strip (ported from content)"
```

---

### Task 13: Footer (links + chant) + parallax

**Files:**
- Create: `components/site/footer.tsx`, `components/site/footer.client.tsx` (`'use client'`: parallax spacer from source 1737–1751)
- Modify: `app/globals.css` (append footer/parallax CSS 869–1044), `app/[locale]/(site)/page.tsx`
- Test: `tests/site/footer.test.tsx`

- [ ] **Step 1: Transplant CSS**

Append source lines 869–1044 to `app/globals.css` (includes `body{background:var(--red)}`, fixed footer, chant, footer-top/mid/bottom). The `body` background rule must live with the footer section so the parallax reveal works.

- [ ] **Step 2: Footer component from content**

`footer.tsx` — port markup 1591–1667. Brand blurb, the footer columns from `content.footer.columns` (heading + links), the chant (`chantLine1` + `<em>chantEmphasis</em>` + `chantLine2`), and the chant-meta stats (1914 / Tri 57·76·83 / Fita Azul 1979 — these are fixed historical facts per `CLAUDE.md`, not localized; keep as literals). App-store buttons stay decorative.

- [ ] **Step 3: Parallax client wrapper**

`footer.client.tsx` ports the footer-spacer logic (source 1737–1751): sets `document.body.style.paddingBottom` to footer height on ≥901px, disabled below. Wrap the footer so the effect runs after mount.

- [ ] **Step 4: Mount in page**

Add `<Footer/>` as the last element after the social strip.

- [ ] **Step 5: Test**

`tests/site/footer.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/site/footer';

const content: any = { footer: {
  brandBlurb:{pt:'Fundado em 1914.',en:'Founded in 1914.'},
  columns:[{ heading:{pt:'Clube',en:'Club'}, links:[{label:{pt:'História',en:'History'},url:'#'}] }],
  chantLine1:{pt:'É',en:"It's"}, chantEmphasis:{pt:'tradição',en:'tradition'}, chantLine2:{pt:', não é moda.',en:', not a trend.'},
}};

describe('Footer', () => {
  it('renders the chant and a footer link (pt)', () => {
    render(<Footer content={content} locale="pt" />);
    expect(screen.getByText('tradição')).toBeInTheDocument();
    expect(screen.getByText('História')).toBeInTheDocument();
  });
  it('shows the 1914 historical stat', () => {
    render(<Footer content={content} locale="pt" />);
    expect(screen.getByText('1914')).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Run test**

Run: `npm run test -- tests/site/footer.test.tsx`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: footer with chant + parallax reveal (ported, bilingual)"
```

---

### Task 14: Full home composition + metadata + verification

**Files:**
- Modify: `app/[locale]/(site)/page.tsx` (final composition), `app/[locale]/layout.tsx` (metadata)
- Test: `tests/site/home-integration.test.tsx`

- [ ] **Step 1: Compose the full page in order**

Final `page.tsx` renders, inside the loaded-content scope: `<Header/>`, `<section class="hero" id="calendario"><Hero/><MatchCalendar/></section>`, `<NewsSection/>`, `<BannerStrip/>`, `<InstitutionalGrid/>`, `<Sponsors/>`, `<SocialStrip/>`, `<Footer/>`. Pass `{content, locale}` to each.

- [ ] **Step 2: Localized SEO metadata**

In `app/[locale]/layout.tsx` add `generateMetadata` using `getTranslations` (add `meta.title`/`meta.description` to messages): pt "Santa Cruz Futebol Clube — Site Oficial". Set `<html lang={locale}>` (already done) and `metadataBase`.

- [ ] **Step 3: Integration test (home renders all sections)**

`tests/site/home-integration.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import pt from '@/messages/pt.json';
import { JsonContentSource } from '@/server/content/json-source';
import { Hero } from '@/components/site/hero';
import { NewsSection } from '@/components/site/news-section';
import { Footer } from '@/components/site/footer';

describe('home integration (real site.json)', () => {
  it('renders hero, news and footer from real content without throwing', async () => {
    const content = await new JsonContentSource().getSiteContent();
    const { container } = render(
      <NextIntlClientProvider locale="pt" messages={pt}>
        <Hero content={content} locale="pt" />
        <NewsSection content={content} locale="pt" />
        <Footer content={content} locale="pt" />
      </NextIntlClientProvider>,
    );
    expect(container.querySelector('.hero-title')).toBeTruthy();
    expect(container.querySelector('.news-feature')).toBeTruthy();
    expect(container.querySelector('.chant')).toBeTruthy();
  });
});
```

- [ ] **Step 4: Run the full suite + typecheck + build**

Run: `make test` then `npm run typecheck` then `npm run build`
Expected: all tests PASS, no type errors, production build succeeds.

- [ ] **Step 5: Manual brand checklist (BRAND.md §6) on `npm run dev`**

Verify on `/` and `/en`: red is `#DD0000`; only Inter; black and red never touch (white between, e.g. `.btn-pill` white ring, `.match::before` 2px white gap); crest ≥ 50px with protection margin; no shadow/blur/gradient on the crest; support colors (gold/gray) only in accent spots. Fix any violation before committing.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: compose full bilingual home + SEO metadata (layout 10 complete)"
```

---

## Self-Review (done while writing)

- **Spec coverage:** Next.js monorepo (Task 1) ✓; Tailwind+brand (Task 2) ✓; i18n PT/EN next-intl (Task 3) ✓; content layer JSON→DB-ready (Task 4) ✓; tRPC scaffold wrapping ContentSource (Task 5) ✓; Stryker+Makefile (Task 6) ✓; layout-10 public site componentized (Tasks 7–14) ✓; Supabase/Drizzle/auth/admin are explicitly **Phase 2–3** (out of this plan, drizzle.config placeholder seeded). JSON-keyed-by-locale content model ✓.
- **Placeholder scan:** infra tasks contain full code; UI tasks give signatures + exact source line ranges to transplant + concrete tests (no "TBD"/"similar to").
- **Type consistency:** `ContentSource.getSiteContent` / `SiteContent` / `LocalizedText` / `resolveLocalized` / `getContentSource` / `getServerApi` / `appRouter.content.site` used consistently across Tasks 4, 5, 7–14. `SectionProps = {content, locale}` is the single prop contract for all sections.
- **Note:** message keys added incrementally (Tasks 3, 8, 10, 11, 14) must keep identical shapes across `pt.json`/`en.json` — enforced by the Task 3 test; update both files together.
