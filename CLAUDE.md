# Projeto: Site Santa Cruz FC

App **Next.js (App Router) bilíngue PT/EN** com site público, área do torcedor e admin próprio. Persistência **Supabase** (Postgres + Auth + Storage), DB-first com fallback para o JSON empacotado (`content/site.json`) — nada quebra com o banco fora.

## Regra zero — leia antes de qualquer coisa

**Antes de tocar em qualquer página, leia `BRAND.md`** — fonte da verdade visual (paleta, tipografia, escudo, narrativa) extraída do manual de marca oficial de 2025. Regra de ouro: **vermelho e preto nunca se tocam** — sempre branco/hairline entre eles (anéis brancos em botões vermelhos sobre fundo escuro, faixa branca antes do footer no dark, etc.).

Regra de temas: **dark e light têm estrutura CSS idêntica** (sombras, anéis, tamanhos) — só as cores mudam, via tokens. O dark é a fonte de verdade estrutural.

## Estrutura

- `app/[locale]/(site)/` — site público (home, elenco, notícias, torcedor, catch-all `[...path]` para as páginas internas por arquétipo).
- `app/[locale]/admin/` — admin (Supabase Auth + cookie HMAC; conteúdo, notícias, jogos, elenco, galeria, documentos, histórias, mensagens, usuários).
- `app/api/` — upload (Supabase Storage bucket `media`), tRPC, analytics, fan/me.
- `components/site/` e `components/admin/` — UI. `lib/` — i18n, helpers. `server/` — auth, content (ops puras + Server Actions), db, analytics.
- `app/globals.css` (site/admin/torcedor) e `app/internal.css` (páginas internas `.sc-*`, skins por seção + patterns de marca d'água).
- `messages/pt.json` / `en.json` — i18n (next-intl). Toda string nova entra nos DOIS.
- `server/db/migrate.cjs` — migração idempotente (`node --env-file=.env.local server/db/migrate.cjs`). **Rodar contra o banco exige aprovação explícita do usuário.**
- `content/site.json` — fallback de build; o runtime lê do Postgres (`site_content`).
- `legacy/` — HTML antigo (referência de layout, não editar).
- `.env.local` — credenciais Supabase locais (gitignored; produção usa as envs da Vercel).

## Títulos e datas históricas do Santa Cruz

Fonte: confirmado pelo usuário. Usar essas datas/títulos em qualquer referência (easter eggs, watermarks, copy):

- **1934** — Santa 7×0 Sport (maior diferença de gols no Clássico das Multidões)
- **1957, 1976, 1983** — **Tri-Supercampeonato Pernambucano** (feito exclusivo do clube, reunia vencedores dos turnos do estadual)
- **1972** — Inauguração do Estádio do Arruda
- **1979** — **Fita Azul** (excursão internacional invicta) ← NÃO 1973
- **2013** — Tri Campeão estadual + **Campeão da Série C** do Brasileirão
- **2015** — Campeão do **Centenário** do Campeonato Pernambucano
- **2016** — **Copa do Nordeste** ← NÃO 2006

## Convenções

- Idioma: português brasileiro nas copies (sem hífens em nomes próprios estrangeiros).
- Nada de bibliotecas pesadas; CSS puro (sem Tailwind nas páginas — o config existe mas o design system é manual).
- Dados reais só com fonte; placeholder honesto no resto; **nunca fabricar fato**.
- Imagens dinâmicas: posição de recorte vai no fragmento da URL (`#pos=x,y` → `lib/image-pos.ts` + `<PosImg>`).
- Verificação visual: Playwright local em `tmpplaywright-temp/` (`node tmpplaywright-temp/<script>.cjs`; npx falha — registry CodeArtifact privado).
- Testes: `npm test` (vitest) + `npm run typecheck` antes de todo commit.

## Build e deploy

- **Build com webpack** (`next build --webpack` — Turbopack quebra o middleware Edge na Vercel). Manter `middleware.ts` (não migrar para proxy.ts).
- Deploy: `npx vercel deploy --prod --yes` (team `meu-trato`, projeto `santa`).
- URL pública: <https://santa-ruby.vercel.app>
