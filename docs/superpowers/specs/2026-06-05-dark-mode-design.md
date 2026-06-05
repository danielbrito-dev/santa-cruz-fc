# Design — Dark mode (tema escuro coerente + toggle no header)

> Data: 2026-06-05
> Projeto: Plataforma Santa Cruz FC (Next.js App Router, ver [roadmap](../../../memory)).
> Autoridade visual: `BRAND.md`. Referência de inspiração do escuro: `legacy/index_9.html` (hero preto).

## 1. Objetivo

Adicionar um **dark mode** ao site público, com o visual atual (layout 10) como **light/default** e um **botão no header** para alternar. O dark é um tema **coerente, escuro de ponta a ponta**, ancorado no hero preto do index9 (não uma cópia literal do index9, que tem seções de conteúdo brancas).

## 2. Decisões (fechadas com o usuário)

| Tema | Decisão |
| --- | --- |
| Implementação | Tema via atributo **`data-theme`** (`light`|`dark`) no `<html>`. Um único conjunto de componentes (os atuais) + overrides por `[data-theme="dark"]`. DRY, sem duplicar markup. |
| Padrão | **Light é o default.** Na primeira visita respeita `prefers-color-scheme`; a escolha pelo botão sobrepõe e persiste. |
| Persistência | `localStorage('theme')`. |
| No-flash | Script inline no `<head>`, antes do paint, resolve e aplica `data-theme`. |
| Dependência | **Nenhuma nova** (script próprio, não `next-themes`) — mantém o site leve. |
| Tom do dark | **Coerente/escuro em todo o site** (hero preto, seções near-black, footer escuro, texto branco, vermelho/dourado de acento). |
| Marca | `--red` permanece `#DD0000` nos dois temas; separação preto↔vermelho por branco preservada também no escuro. |

## 3. Arquitetura de tema

### 3.1 Resolução e no-flash
- Função pura `resolveTheme(stored, systemPrefersDark)`: retorna `stored` se for `'light'|'dark'`; senão `systemPrefersDark ? 'dark' : 'light'`.
- Script inline (string em `app/[locale]/layout.tsx`, dentro do `<head>` via `next/script` `beforeInteractive` ou um `<script dangerouslySetInnerHTML>`): lê `localStorage('theme')` + `matchMedia('(prefers-color-scheme: dark)')`, aplica `document.documentElement.dataset.theme`. Executa antes da hidratação → sem flash. O `<html>` **não** recebe `data-theme` no SSR (evita mismatch); o script o define no cliente antes do paint.

### 3.2 Tokens semânticos (globals.css)
Introduzir tokens de superfície que invertem por tema. Em `:root` recebem os valores **light = estado atual**; em `[data-theme="dark"]` recebem os valores **dark**. Refatorar APENAS as regras que hoje cravam superfícies claras para consumir os tokens.

| Token | Light (atual) | Dark |
| --- | --- | --- |
| `--page-bg` (reveal do body) | `var(--red)` | `#0B0B0B` |
| `--hero-bg` | gradiente dourado→branco | preto sólido (`#000`) |
| `--hero-text` | `var(--ink)` | `var(--white)` |
| `--panel` (social-strip, drawer, cookie, header rolado, `--bg-2` dos match cards) | `var(--white)` | `#141414` |
| `--panel-text` | `var(--ink)` | `var(--white)` |
| `--section-bg` (news/inst/sponsors — já escuras) | `var(--black)` | `#0E0E0E` |
| `--footer-bg` | `var(--red)` | `#0B0B0B` |
| `--line` (bordas) | `#E5E5E5` | `rgba(255,255,255,.14)` |
| `--red` | `#DD0000` | `#DD0000` (imutável) |
| `--gold` | `#C9B896` | `#C9B896` (acento) |

> Valores `#0B0B0B/#0E0E0E/#141414` são near-black para dar profundidade entre camadas; ajustáveis na fase de implementação (frontend-design).

### 3.3 Botão `ThemeToggle`
- Client component em `components/site/theme-toggle.tsx` (`'use client'`), montado no `header-right` (ao lado do `LocaleSwitcher`).
- Ícone **sol** (quando dark, oferece ir pra light) / **lua** (quando light). Lê o tema atual de `document.documentElement.dataset.theme` no mount; no clique alterna o atributo + grava `localStorage`.
- A11y: `<button>` real, `aria-label` localizado (`a11y.toggleTheme`), `aria-pressed`/estado refletido. Sem flash de ícone (estado inicial lido no mount; ícone neutro até montar para evitar mismatch).
- Estilo on-brand (Inter, sem efeito no escudo). Visível no mobile também (diferente dos links que somem).

## 4. Conformidade BRAND.md no escuro
No dark, vermelho passa a tocar superfícies near-black em mais lugares. Garantir a regra "preto nunca toca vermelho — branco separa":
- Manter anéis/contornos brancos existentes: `.btn-pill` (`box-shadow:0 0 0 1.5px var(--white)`), `.cookie-accept`, `.chant em` (white stroke), estrela `.s-red`.
- Onde o dark criar contato novo preto↔vermelho (ex.: `.hero-tag` vermelho sobre hero preto; stripe `.match::before` vermelho sobre card near-black), garantir a faixa/anel branco de separação.
- `--red` exatamente `#DD0000`; dourado/cinza só como acento. Checklist do `BRAND.md §6` roda também com `data-theme="dark"`.

## 5. i18n
- Adicionar `a11y.toggleTheme` (ex.: "Alternar tema" / "Toggle theme") a `messages/pt.json` e `messages/en.json` (paridade de chaves — teste existente exige shapes idênticos).

## 6. Testes (Vitest)
- `resolveTheme`: `'dark'`/`'light'` armazenado vence; sem armazenado → segue `prefers-color-scheme`; default light. (Lógica pura → bom alvo de mutation testing; incluir em `server/`? Não — é util de UI; testar via unit.)
- `ThemeToggle`: monta lendo `data-theme` atual; clique alterna o atributo no `documentElement` e persiste em `localStorage`; alterna o rótulo/ícone.
- Token test (leitura de `globals.css`): `[data-theme="dark"]` existe e define `--page-bg`/`--footer-bg` escuros; `--red:#DD0000` presente e inalterado; sem `#CF1715`.

## 7. Arquivos (previstos)
- Create: `lib/theme.ts` (`resolveTheme` + constantes), `components/site/theme-toggle.tsx`, `tests/site/theme-toggle.test.tsx`, `tests/lib/theme.test.ts`.
- Modify: `app/[locale]/layout.tsx` (script inline no-flash no `<head>`), `components/site/header.client.tsx` (montar `<ThemeToggle/>`), `app/globals.css` (tokens semânticos em `:root` + bloco `[data-theme="dark"]`; refatorar regras de superfícies claras p/ tokens), `messages/{pt,en}.json` (`a11y.toggleTheme`), `tests/brand-tokens.test.ts` (asserts do dark).

## 8. Fora de escopo
- Nenhum layout novo (index9 só inspira o dark; sem renderizar o index9 literal).
- Sem mudanças de conteúdo/seções.
- `next/image` (perf) segue como follow-up à parte.
- Tema por seção/usuário no admin (futuro; só light/dark global agora).

## 9. Implementação
A parte de paleta/superfícies do dark passa pela skill **frontend-design** (regra do projeto para mudanças estruturais de CSS). Cada item vira tarefa no plano (writing-plans).
