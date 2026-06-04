# Design — Plataforma Santa Cruz FC (site do torcedor + admin do clube)

> Data: 2026-06-04
> Layout escolhido pelo clube: **layout 10** (`index_10.html`).
> Autoridade visual: `BRAND.md` (deriva do manual oficial 2025). Em conflito, `BRAND.md` vence.

## 1. Objetivo

Transformar o site estático (`index_10.html`) numa plataforma com duas áreas:

- **Área do torcedor** — site público, bilíngue (PT-BR + EN), fiel ao layout 10 e à marca.
- **Área de administração do clube** — sistema administrativo com **múltiplos módulos** e **permissões por módulo**. O primeiro módulo é o de **marketing** (notícias, ordenação de destaques, edição do conteúdo do site).

O conteúdo de texto começa vindo de um **JSON** e migra para o banco quando o módulo de marketing entra no ar — sem reescrever o site.

## 2. Decisões de arquitetura (fechadas)

| Tema | Decisão |
| --- | --- |
| Estrutura | App único **Next.js (App Router)** servindo site público, API tRPC e admin. Deploy Vercel. |
| API | **tRPC v11** em Vercel Functions. |
| Banco | **Supabase Postgres**, acesso via **Drizzle ORM** (migrations versionadas). tRPC é o porteiro das queries. |
| Auth | **Supabase Auth** — OAuth **Google** + **e-mail/senha**. Sessão validada no servidor → `ctx.user`. |
| Autorização | Tabela `profiles` (1:1 com `auth.users`) + `module_permissions` (acesso por módulo). Admin do clube com módulos; marketing é um deles. |
| Mídia | **Supabase Storage** para imagens de notícias. |
| i18n | **PT-BR (padrão) + EN** via **next-intl**, rota por locale (`/`, `/en`). UI estática em catálogos; conteúdo dinâmico em **colunas JSON por idioma** (`{pt, en}`). |
| Estilo | **Tailwind CSS** com tokens do `BRAND.md`. |
| Testes | **Vitest** (unit/integration) + **Stryker** (mutation testing na lógica de domínio) + **Makefile** + CI opcional. |

## 3. Estrutura do repositório

```
santa/
├─ app/
│  ├─ [locale]/
│  │  ├─ (site)/              # público (torcedor): home + páginas
│  │  └─ admin/               # área do clube (protegida)
│  │     ├─ marketing/        # módulo: notícias, destaques, conteúdo
│  │     └─ usuarios/         # módulo: perfis & permissões (admin)
│  └─ api/trpc/[trpc]/        # handler tRPC
├─ server/
│  ├─ trpc.ts                 # init, context, middlewares (auth/permissão)
│  ├─ routers/                # news, highlights, content, matches, sponsors, auth, users
│  ├─ db/                     # client drizzle + schema + migrations
│  └─ content/                # camada de conteúdo (JSON ↔ DB)
├─ components/
│  ├─ site/                   # Header, Hero, MatchCalendar, NewsSection, ...
│  └─ admin/                  # shell, forms, tabela, ordenação
├─ lib/                       # supabase clients, brand tokens, i18n helpers
├─ messages/                  # pt.json, en.json (UI estática)
├─ content/site.json          # conteúdo inicial (fonte da verdade na Fase 1)
├─ tests/
├─ legacy/                     # index_*.html antigos (fora do build)
├─ Makefile
├─ stryker.conf.json
└─ drizzle.config.ts
```

Os `index_*.html` legados saem do build. `index_10.html` permanece como referência visual a portar.

## 4. Modelo de dados (Drizzle / Postgres)

Campos de texto traduzíveis são `jsonb` no formato `{ "pt": "...", "en": "..." }` (tipados em TS como `LocalizedText`).

- **`profiles`** — `id (=auth.users.id)`, `email`, `name`, `avatar_url`, `active (bool)`, `is_super_admin (bool)`, `created_at`.
- **`module_permissions`** — `id`, `profile_id`, `module ('marketing' | ...)`, `can_view (bool)`, `can_edit (bool)`. Super admin enxerga tudo sem linhas.
- **`news`** — `id`, `slug`, `title (LocalizedText)`, `excerpt (LocalizedText)`, `body (LocalizedText)`, `cover_image`, `tag (LocalizedText)`, `photo_count`, `status ('draft'|'published')`, `published_at`, `author_id`, `created_at`, `updated_at`.
- **`highlights`** — ordenação dos destaques da home: `id`, `news_id`, `position` (0 = featured, 1..n = grid).
- **`matches`** — calendário: `id`, `competition`, `opponent`, `is_home (bool)`, `kickoff (timestamp)`, `score_home`, `score_away`, `status ('scheduled'|'live'|'final')`, `match_center_url`, `position`.
- **`sponsors`** — `id`, `name`, `logo`, `url`, `tier ('master'|'fornecedor'|'apoio')`, `position`.
- **`institutional_cards`** — `id`, `eyebrow (LocalizedText)`, `title (LocalizedText)`, `image`, `cta_label (LocalizedText)`, `cta_url`, `size ('span'|'normal')`, `position`.
- **`banners`** — `id`, `eyebrow (LocalizedText)`, `title (LocalizedText)`, `image`, `cta_label (LocalizedText)`, `cta_url`, `position`.
- **`site_content`** — singletons chave→`jsonb` para o resto editável (hero, chant, stats, links do footer, redes sociais, textos institucionais). Chave estável + payload `LocalizedText`/config.

## 5. Camada de conteúdo (JSON → DB)

Interface única `ContentSource` com dois adaptadores:

- `JsonContentSource` — lê `content/site.json` (valores com chaves de locale).
- `DbContentSource` — lê via Drizzle.

O site público consome **sempre** a interface; trocar a fonte é mudar 1 binding. Em ambas, dado o locale ativo (next-intl), retorna o texto correto. Na Fase 3, um seed importa o `site.json` para o banco e viramos para o `DbContentSource`. Isso cumpre o requisito "textos vêm de um JSON até a rotina de admin existir" sem reescrever o site.

## 6. Autenticação e permissões

- Login via Supabase (Google + e-mail/senha). Helper de servidor valida a sessão e popula `ctx.user` (+ perfil e permissões).
- Primeiro acesso cria `profile` **inativo, sem permissões**; um admin ativa e concede acesso a módulos. Sem permissão = sem admin.
- Middlewares tRPC:
  - `protectedProcedure` — exige sessão.
  - `modulePermission(module, level)` — exige `can_view`/`can_edit` no módulo (super admin passa direto).
- `app/[locale]/admin` é protegido no layout (server) e a navegação só mostra módulos visíveis ao usuário.

## 7. Site público (torcedor)

Layout 10 decomposto em componentes React (CSS portado fiel, com tokens de marca):
`Header`/`Drawer`, `Hero`, `MatchCalendar` (carrossel), `NewsSection` (featured + grid), `BannerStrip`, `InstitutionalGrid`, `Sponsors` (master + grid), `SocialStrip`, `Footer` (com chant "É tradição, não é moda").

- SSR para SEO; conteúdo via `ContentSource` no locale ativo.
- Seletor de idioma do header passa a funcionar (PT/EN via next-intl).
- **Suposições:** Loja / Ingressos / TV Coral seguem como links externos por ora.
- Conformidade `BRAND.md`: vermelho exatamente `#DD0000`, Inter, preto e vermelho nunca se tocam (branco entre eles), escudo ≥ 50px e área de proteção respeitada, sem efeitos no escudo. Datas/títulos históricos conforme `CLAUDE.md`.

## 8. Admin do clube

Shell com navegação por módulos (mostra só o que o usuário pode ver).

**Módulo de marketing** (entrega inicial do admin):
- **Notícias** — lista + criar/editar/publicar, abas PT/EN, upload de capa (Supabase Storage), rascunho/publicado.
- **Destaques** — tela de ordenação (arrastar) do que aparece na home e em que ordem (`highlights.position`).
- **Conteúdo do site** — formulários PT/EN para hero, banners, cards institucionais, patrocinadores, calendário e textos do footer/chant/redes.

**Módulo de usuários (admin)** — gerenciar `profiles` (ativar) e conceder `module_permissions`.

## 9. Testes e qualidade

- **Vitest** — unit/integration: routers tRPC, camada de conteúdo, permissões, helpers de i18n e mapeamento `LocalizedText`.
- **Stryker** — mutation testing focado na **lógica de domínio** (`server/`, `content/`, permissões). UI fora do alvo inicial.
- **Makefile** — alvos: `dev`, `build`, `test`, `test-watch`, `coverage`, `mutation`, `lint`, `typecheck`, `db-generate`, `db-migrate`, `seed`.
- **CI (opcional)** — GitHub Actions roda `make test` (+ `make mutation` em PRs relevantes).

## 10. Fases de execução

Cada fase vira um spec + plano de implementação próprio.

- **Fase 0 — Fundação:** scaffold Next.js + tRPC + Drizzle + Supabase + Tailwind(tokens) + next-intl + infra de testes (Vitest/Stryker/Makefile) + `content/site.json` (layout 10, PT/EN).
- **Fase 1 — Site público:** portar layout 10 lendo do `JsonContentSource`, SSR, i18n PT/EN. **[entrega visível]**
- **Fase 2 — Auth + shell do admin:** login Supabase, `profiles` + `module_permissions`, guarda de rotas, módulo de usuários.
- **Fase 3 — Módulo de marketing:** CRUD de notícias + upload, ordenação de destaques, edição de conteúdo, seed JSON→DB e virada para `DbContentSource`.

**Início:** Fase 0 + Fase 1 (fundação + site público lendo do JSON).

## 11. Fora de escopo (por ora)

- Loja, ingressos, TV Coral, sócio (seguem como links externos).
- Idiomas além de PT/EN.
- Mutation testing de componentes de UI.
- Apps mobile (botões de App Store/Play seguem decorativos).
