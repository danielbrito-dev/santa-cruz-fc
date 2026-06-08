# Páginas internas por arquétipo — Fase A (infra + Editorial/Legal/FAQ) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trocar o template único por um **registry de páginas + dispatch de arquétipos** na rota catch-all, e entregar os 3 primeiros arquétipos (**Editorial**, **Legal**, **FAQ**) com conteúdo real (História, Precursor da Inclusão, Privacidade, Cookies, Termos, Ajuda).

**Architecture:** `lib/site-pages.ts` mapeia `href → { archetype, ...data }` (union discriminada). A rota `[...path]` resolve o href no registry e renderiza o componente-arquétipo correspondente dentro do `SiteShell`; sem entrada → fallback Editorial genérico. Editorial é a versão data-driven do `info-page.tsx` atual (reusa o CSS `.info-*`). Legal e FAQ são novos componentes com CSS próprio. Light/dark via tokens; brand-safe.

**Tech Stack:** Next.js App Router, next-intl v4, TypeScript, Vitest + @testing-library/react.

**Fases B–D** (Conquistas, Pessoas, Documentos, Galeria, Listagem, Locais, Formulário, Landing, Histórias) terão planos próprios após A — o registry/tipos ficam concretos aqui primeiro.

---

## File Structure

**Criar:**
- `lib/site-pages.ts` — registry `SITE_PAGES` + tipos (`ArchetypeKey`, `PageData` union) + `getPageData(href)`.
- `components/site/pages/editorial.tsx` — arquétipo Editorial (data-driven).
- `components/site/pages/legal.tsx` — arquétipo Legal (documento jurídico).
- `components/site/pages/faq.tsx` — arquétipo FAQ (acordeão `<details>`).
- Testes: `tests/site/site-pages.test.ts`, `tests/site/pages/editorial.test.tsx`, `tests/site/pages/legal.test.tsx`, `tests/site/pages/faq.test.tsx`.

**Modificar:**
- `app/[locale]/(site)/[...path]/page.tsx` — dispatch por arquétipo.
- `app/globals.css` — CSS de `.legal-*` e `.faq-*` (Editorial reusa `.info-*`).
- `messages/pt.json`, `messages/en.json` — chaves `page.updatedAt`, `page.faqTitle`.
- `components/site/info-page.tsx` — **remover** após migrar (o Editorial substitui). Atualizar `tests/site/squad-page.test.tsx`? não (não usa). Conferir imports órfãos.

---

## Task 1: Registry de páginas (tipos + dados Fase A)

**Files:**
- Create: `lib/site-pages.ts`
- Test: `tests/site/site-pages.test.ts`

- [ ] **Step 1: Escrever o teste (falhando)**

`tests/site/site-pages.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { SITE_PAGES, getPageData } from '@/lib/site-pages';

const PHASE_A = [
  '/o-santa/historia',
  '/o-santa/precursor-da-inclusao',
  '/privacidade',
  '/cookies',
  '/termos-de-uso',
  '/ajuda',
];

describe('site-pages registry', () => {
  it('tem entrada para cada página da Fase A', () => {
    for (const href of PHASE_A) expect(SITE_PAGES[href]).toBeDefined();
  });
  it('toda entrada tem um archetype válido', () => {
    const valid = new Set(['editorial', 'legal', 'faq']);
    for (const data of Object.values(SITE_PAGES)) expect(valid.has(data.archetype)).toBe(true);
  });
  it('getPageData devolve a entrada e undefined p/ href desconhecido', () => {
    expect(getPageData('/o-santa/historia')?.archetype).toBe('editorial');
    expect(getPageData('/nao-existe')).toBeUndefined();
  });
  it('História traz fatos reais (1914)', () => {
    const h = getPageData('/o-santa/historia');
    expect(h?.archetype).toBe('editorial');
    if (h?.archetype === 'editorial') {
      expect(JSON.stringify(h.sections)).toContain('1914');
    }
  });
});
```

- [ ] **Step 2: Rodar pra ver falhar**

Run: `npx vitest run tests/site/site-pages.test.ts`
Expected: FAIL — `Cannot find module '@/lib/site-pages'`.

- [ ] **Step 3: Implementar o registry**

`lib/site-pages.ts`:
```ts
// Conteúdo estático de cada página interna + qual arquétipo a renderiza.
// Dados reais onde há base (CLAUDE.md/BRAND.md); placeholder honesto no resto.

export type ArchetypeKey =
  | 'editorial'
  | 'legal'
  | 'faq'
  | 'achievements'
  | 'people'
  | 'documents'
  | 'gallery'
  | 'listing'
  | 'locations'
  | 'form'
  | 'landing'
  | 'stories';

export interface EditorialData {
  archetype: 'editorial';
  lead: string;
  sections: { heading: string; paragraphs: string[] }[];
  quote?: { text: string; cite: string };
  facts?: { k: string; v: string }[];
}
export interface LegalData {
  archetype: 'legal';
  updatedAt: string; // ISO date
  sections: { heading: string; paragraphs: string[] }[];
}
export interface FaqData {
  archetype: 'faq';
  intro: string;
  items: { q: string; a: string }[];
}

// União estendida nas fases B–D com os demais arquétipos.
export type PageData = EditorialData | LegalData | FaqData;

const LEGAL_SECTIONS: LegalData['sections'] = [
  { heading: '1. Informações gerais', paragraphs: ['Este documento descreve, em linhas gerais, as práticas do Santa Cruz Futebol Clube no site oficial. Conteúdo de exemplo — substituir pelo texto jurídico definitivo.'] },
  { heading: '2. Dados coletados', paragraphs: ['Podemos coletar dados fornecidos voluntariamente (como nome e e-mail em formulários) e dados de navegação. Conteúdo de exemplo.'] },
  { heading: '3. Uso das informações', paragraphs: ['As informações são usadas para operar o site, responder contatos e melhorar a experiência do torcedor. Conteúdo de exemplo.'] },
  { heading: '4. Seus direitos', paragraphs: ['Você pode solicitar acesso, correção ou exclusão dos seus dados pelos canais de contato. Conteúdo de exemplo.'] },
  { heading: '5. Contato', paragraphs: ['Dúvidas sobre este documento podem ser enviadas pela página de Contato. Conteúdo de exemplo.'] },
];

export const SITE_PAGES: Record<string, PageData> = {
  '/o-santa/historia': {
    archetype: 'editorial',
    lead: 'Fundado em 3 de fevereiro de 1914, no bairro da Boa Vista, em Recife, o Santa Cruz nasceu da paixão de um grupo de jovens e se tornou um dos clubes mais queridos do Nordeste.',
    sections: [
      {
        heading: 'A fundação, em 1914',
        paragraphs: [
          'O Santa Cruz Futebol Clube foi fundado em 3 de fevereiro de 1914, no bairro da Boa Vista, em Recife, por um grupo de onze jovens. Entre eles, Teófilo de Carvalho, o "Lacraia", autor do primeiro escudo do clube.',
          'Das ruas do centro do Recife para o coração de Pernambuco, o tricolor de preto, branco e vermelho cresceu junto com a sua torcida — apelidada de "A Mais Apaixonada".',
        ],
      },
      {
        heading: 'A Cobra Coral e o Arruda',
        paragraphs: [
          'O apelido "Cobra Coral" — mascote do clube — faz referência às listras coral do uniforme tricolor. O Estádio do Arruda, casa do Santa, tornou-se um dos maiores palcos do futebol nordestino.',
          'Mais do que um clube, o Santa Cruz é um símbolo de pertencimento para milhões de torcedores.',
        ],
      },
    ],
    quote: { text: 'É tradição, não é moda.', cite: 'Torcida do Santa Cruz' },
  },
  '/o-santa/precursor-da-inclusao': {
    archetype: 'editorial',
    lead: 'Conhecido como "o clube do povo", o Santa Cruz carrega na sua história uma identidade popular e plural, abraçada por torcedores de todas as origens.',
    sections: [
      {
        heading: 'O clube do povo',
        paragraphs: [
          'Ao longo de mais de um século, o Santa Cruz construiu uma torcida marcada pela diversidade e pela paixão — "A Mais Apaixonada".',
          'Esta página reúne a trajetória do clube como espaço de pertencimento e inclusão. Conteúdo em construção — a ser detalhado com a curadoria histórica do clube.',
        ],
      },
    ],
  },
  '/privacidade': { archetype: 'legal', updatedAt: '2026-06-08', sections: LEGAL_SECTIONS },
  '/cookies': {
    archetype: 'legal',
    updatedAt: '2026-06-08',
    sections: [
      { heading: '1. O que são cookies', paragraphs: ['Cookies são pequenos arquivos armazenados no seu navegador para melhorar a experiência de navegação. Conteúdo de exemplo.'] },
      { heading: '2. Como usamos', paragraphs: ['Usamos cookies essenciais para o funcionamento do site e, com seu consentimento, cookies de preferência. Conteúdo de exemplo.'] },
      { heading: '3. Gerenciamento', paragraphs: ['Você pode gerenciar cookies nas configurações do seu navegador. Conteúdo de exemplo.'] },
    ],
  },
  '/termos-de-uso': {
    archetype: 'legal',
    updatedAt: '2026-06-08',
    sections: [
      { heading: '1. Aceitação', paragraphs: ['Ao acessar o site oficial do Santa Cruz, você concorda com estes termos. Conteúdo de exemplo.'] },
      { heading: '2. Uso do conteúdo', paragraphs: ['O conteúdo do site é de propriedade do clube e não pode ser reproduzido sem autorização. Conteúdo de exemplo.'] },
      { heading: '3. Responsabilidades', paragraphs: ['O clube se esforça para manter as informações corretas e atualizadas. Conteúdo de exemplo.'] },
    ],
  },
  '/ajuda': {
    archetype: 'faq',
    intro: 'Respostas rápidas para as dúvidas mais comuns dos torcedores. Conteúdo de exemplo — a ser revisado.',
    items: [
      { q: 'Como me torno Sócio Coral?', a: 'Acesse a página Seja Sócio no menu Viva o Santa e escolha o seu plano. Conteúdo de exemplo.' },
      { q: 'Onde compro ingressos?', a: 'Os ingressos são vendidos pelos canais oficiais divulgados antes de cada jogo. Conteúdo de exemplo.' },
      { q: 'Como falo com o clube?', a: 'Use a página Fale Conosco, no menu Contato. Conteúdo de exemplo.' },
    ],
  },
};

export function getPageData(href: string): PageData | undefined {
  return SITE_PAGES[href];
}
```

- [ ] **Step 4: Rodar pra ver passar**

Run: `npx vitest run tests/site/site-pages.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/site-pages.ts tests/site/site-pages.test.ts
git commit -m "feat(pages): registry de páginas internas (Editorial/Legal/FAQ Fase A)"
```

---

## Task 2: Arquétipo Editorial (data-driven)

**Files:**
- Create: `components/site/pages/editorial.tsx`
- Test: `tests/site/pages/editorial.test.tsx`

> Reusa o CSS `.info-*` já existente. Recebe `data: EditorialData`. Mantém o aside "Fatos rápidos" (default = fatos reais do clube; `data.facts` sobrescreve), pull-quote opcional e CTA Fita Azul.

- [ ] **Step 1: Escrever o teste (falhando)**

`tests/site/pages/editorial.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import pt from '@/messages/pt.json';

vi.mock('next-intl/server', () => ({
  getTranslations: async () => (key: string) => key,
}));

import { Editorial } from '@/components/site/pages/editorial';
import type { EditorialData } from '@/lib/site-pages';

const data: EditorialData = {
  archetype: 'editorial',
  lead: 'Lead de teste.',
  sections: [{ heading: 'Seção Um', paragraphs: ['Parágrafo A.', 'Parágrafo B.'] }],
  quote: { text: 'Citação coral.', cite: 'Torcida' },
};

describe('Editorial', () => {
  it('renderiza título, lead, seção e citação', async () => {
    const C = await Editorial({ sectionKey: 'oSanta', titleKey: 'historia', locale: 'pt', data });
    render(<NextIntlClientProvider locale="pt" messages={pt}>{C}</NextIntlClientProvider>);
    expect(screen.getByText('Lead de teste.')).toBeInTheDocument();
    expect(screen.getByText('Seção Um')).toBeInTheDocument();
    expect(screen.getByText('Parágrafo A.')).toBeInTheDocument();
    expect(screen.getByText(/Citação coral/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Rodar pra ver falhar**

Run: `npx vitest run tests/site/pages/editorial.test.tsx`
Expected: FAIL — módulo não existe.

- [ ] **Step 3: Implementar o Editorial**

`components/site/pages/editorial.tsx`:
```tsx
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import type { EditorialData } from '@/lib/site-pages';

export async function Editorial({
  sectionKey,
  titleKey,
  data,
}: {
  sectionKey: string;
  titleKey: string;
  locale: Locale;
  data: EditorialData;
}) {
  const t = await getTranslations('menu');
  const p = await getTranslations('page');

  const facts =
    data.facts ?? [
      { k: p('factFounded'), v: '1914' },
      { k: p('factStadium'), v: 'Arruda' },
      { k: p('factCity'), v: 'Recife · PE' },
      { k: p('factColors'), v: p('colorsValue') },
      { k: p('factMascot'), v: 'Cobra Coral' },
    ];

  return (
    <div className="info">
      <header className="info-hero">
        <div className="container info-hero-inner">
          <nav className="info-breadcrumb" aria-label="breadcrumb">
            <span>{t(sectionKey)}</span>
            <span className="info-breadcrumb-sep">/</span>
            <span className="info-breadcrumb-current">{t(titleKey)}</span>
          </nav>
          <h1 className="info-title">{t(titleKey)}</h1>
          <p className="info-lead">{data.lead}</p>
        </div>
      </header>

      <div className="info-main">
        <div className="container info-grid">
          <article className="info-content">
            {data.sections.map((s, i) => (
              <section key={i}>
                <h2>{s.heading}</h2>
                {s.paragraphs.map((par, j) => (
                  <p key={j}>{par}</p>
                ))}
              </section>
            ))}
            {data.quote && (
              <blockquote className="info-quote">
                “{data.quote.text}”<cite>{data.quote.cite}</cite>
              </blockquote>
            )}
          </article>

          <aside className="info-aside">
            <div className="info-facts">
              <h3>{p('quickFacts')}</h3>
              <dl>
                {facts.map((f) => (
                  <div className="row" key={f.k}>
                    <dt>{f.k}</dt>
                    <dd>{f.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>
      </div>

      <section className="info-cta">
        <div className="container info-cta-inner">
          <div>
            <span className="info-cta-eyebrow">{p('ctaEyebrow')}</span>
            <h2>{p('ctaTitle')}</h2>
            <p>{p('ctaText')}</p>
          </div>
          <a
            className="info-cta-btn"
            href="https://socio-santacruz.futebolcard.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {p('ctaButton')} →
          </a>
        </div>
      </section>

      <div className="info-fill" aria-hidden="true" />
    </div>
  );
}
```

> Nota: o quote usa `<cite>` (estilizado por `.info-quote cite`). As seções usam `.info-content h2`/`p` já existentes.

- [ ] **Step 4: Rodar pra ver passar**

Run: `npx vitest run tests/site/pages/editorial.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/site/pages/editorial.tsx tests/site/pages/editorial.test.tsx
git commit -m "feat(pages): arquétipo Editorial data-driven (reusa CSS .info-*)"
```

---

## Task 3: Arquétipo Legal

**Files:**
- Create: `components/site/pages/legal.tsx`
- Modify: `app/globals.css`
- Modify: `messages/pt.json`, `messages/en.json`
- Test: `tests/site/pages/legal.test.tsx`

- [ ] **Step 1: i18n `page.updatedAt`** (paridade PT/EN)

Em `messages/pt.json` namespace `page`, adicionar: `"updatedAt": "Atualizado em"`.
Em `messages/en.json` namespace `page`: `"updatedAt": "Updated on"`.

- [ ] **Step 2: Escrever o teste (falhando)**

`tests/site/pages/legal.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import pt from '@/messages/pt.json';

vi.mock('next-intl/server', () => ({
  getTranslations: async (ns: string) => {
    const m = pt as unknown as Record<string, Record<string, string>>;
    const s = m[ns] ?? {};
    return (key: string) => s[key] ?? key;
  },
}));

import { Legal } from '@/components/site/pages/legal';
import type { LegalData } from '@/lib/site-pages';

const data: LegalData = {
  archetype: 'legal',
  updatedAt: '2026-06-08',
  sections: [{ heading: '1. Teste', paragraphs: ['Texto jurídico de teste.'] }],
};

describe('Legal', () => {
  it('renderiza título, data e seção', async () => {
    const C = await Legal({ sectionKey: 'ajuda', titleKey: 'privacidade', locale: 'pt', data });
    render(<NextIntlClientProvider locale="pt" messages={pt}>{C}</NextIntlClientProvider>);
    expect(screen.getByText('1. Teste')).toBeInTheDocument();
    expect(screen.getByText('Texto jurídico de teste.')).toBeInTheDocument();
    expect(screen.getByText(/Atualizado em/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Rodar pra ver falhar**

Run: `npx vitest run tests/site/pages/legal.test.tsx`
Expected: FAIL — módulo não existe.

- [ ] **Step 4: Implementar o Legal**

`components/site/pages/legal.tsx`:
```tsx
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import type { LegalData } from '@/lib/site-pages';

export async function Legal({
  sectionKey,
  titleKey,
  locale,
  data,
}: {
  sectionKey: string;
  titleKey: string;
  locale: Locale;
  data: LegalData;
}) {
  const t = await getTranslations('menu');
  const p = await getTranslations('page');
  const date = new Intl.DateTimeFormat(locale === 'pt' ? 'pt-BR' : 'en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(data.updatedAt));

  return (
    <div className="info">
      <header className="info-hero">
        <div className="container info-hero-inner">
          <nav className="info-breadcrumb" aria-label="breadcrumb">
            <span>{t(sectionKey)}</span>
            <span className="info-breadcrumb-sep">/</span>
            <span className="info-breadcrumb-current">{t(titleKey)}</span>
          </nav>
          <h1 className="info-title">{t(titleKey)}</h1>
          <p className="info-lead">
            {p('updatedAt')} {date}
          </p>
        </div>
      </header>

      <div className="info-main">
        <div className="container">
          <article className="legal-doc">
            {data.sections.map((s, i) => (
              <section key={i} className="legal-section">
                <h2>{s.heading}</h2>
                {s.paragraphs.map((par, j) => (
                  <p key={j}>{par}</p>
                ))}
              </section>
            ))}
          </article>
        </div>
      </div>

      <div className="info-fill" aria-hidden="true" />
    </div>
  );
}
```

- [ ] **Step 5: CSS do Legal** — adicionar ao fim de `app/globals.css`:

```css
/* ===== arquétipo Legal (documento) ===== */
.legal-doc{max-width:74ch;margin:0 auto}
.legal-section{margin-bottom:30px}
.legal-section h2{
  font-size:clamp(16px,1.8vw,20px);font-weight:900;text-transform:uppercase;letter-spacing:-.01em;
  margin-bottom:10px;
}
.legal-section p{font-size:15px;line-height:1.8;opacity:.9;margin-bottom:12px}
```

- [ ] **Step 6: Rodar pra ver passar**

Run: `npx vitest run tests/site/pages/legal.test.tsx tests/i18n.test.ts`
Expected: PASS (legal + paridade i18n).

- [ ] **Step 7: Commit**

```bash
git add components/site/pages/legal.tsx app/globals.css messages/pt.json messages/en.json tests/site/pages/legal.test.tsx
git commit -m "feat(pages): arquétipo Legal (privacidade/cookies/termos)"
```

---

## Task 4: Arquétipo FAQ

**Files:**
- Create: `components/site/pages/faq.tsx`
- Modify: `app/globals.css`
- Test: `tests/site/pages/faq.test.tsx`

- [ ] **Step 1: Escrever o teste (falhando)**

`tests/site/pages/faq.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import pt from '@/messages/pt.json';

vi.mock('next-intl/server', () => ({
  getTranslations: async (ns: string) => {
    const m = pt as unknown as Record<string, Record<string, string>>;
    const s = m[ns] ?? {};
    return (key: string) => s[key] ?? key;
  },
}));

import { Faq } from '@/components/site/pages/faq';
import type { FaqData } from '@/lib/site-pages';

const data: FaqData = {
  archetype: 'faq',
  intro: 'Intro de teste.',
  items: [{ q: 'Pergunta um?', a: 'Resposta um.' }],
};

describe('Faq', () => {
  it('renderiza intro, pergunta e resposta', async () => {
    const C = await Faq({ sectionKey: 'ajuda', titleKey: 'ajuda', locale: 'pt', data });
    render(<NextIntlClientProvider locale="pt" messages={pt}>{C}</NextIntlClientProvider>);
    expect(screen.getByText('Intro de teste.')).toBeInTheDocument();
    expect(screen.getByText('Pergunta um?')).toBeInTheDocument();
    expect(screen.getByText('Resposta um.')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Rodar pra ver falhar**

Run: `npx vitest run tests/site/pages/faq.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implementar o FAQ**

`components/site/pages/faq.tsx`:
```tsx
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';
import type { FaqData } from '@/lib/site-pages';

export async function Faq({
  sectionKey,
  titleKey,
  data,
}: {
  sectionKey: string;
  titleKey: string;
  locale: Locale;
  data: FaqData;
}) {
  const t = await getTranslations('menu');

  return (
    <div className="info">
      <header className="info-hero">
        <div className="container info-hero-inner">
          <nav className="info-breadcrumb" aria-label="breadcrumb">
            <span>{t(sectionKey)}</span>
            <span className="info-breadcrumb-sep">/</span>
            <span className="info-breadcrumb-current">{t(titleKey)}</span>
          </nav>
          <h1 className="info-title">{t(titleKey)}</h1>
          <p className="info-lead">{data.intro}</p>
        </div>
      </header>

      <div className="info-main">
        <div className="container">
          <div className="faq-list">
            {data.items.map((it, i) => (
              <details className="faq-item" key={i}>
                <summary className="faq-q">{it.q}</summary>
                <div className="faq-a">{it.a}</div>
              </details>
            ))}
          </div>
        </div>
      </div>

      <div className="info-fill" aria-hidden="true" />
    </div>
  );
}
```

- [ ] **Step 4: CSS do FAQ** — adicionar ao fim de `app/globals.css`:

```css
/* ===== arquétipo FAQ (acordeão) ===== */
.faq-list{max-width:74ch;margin:0 auto;display:flex;flex-direction:column;gap:10px}
.faq-item{border:1px solid var(--line);border-radius:10px;background:var(--bg-2);overflow:hidden}
.faq-q{
  cursor:pointer;list-style:none;padding:18px 20px;
  font-size:15px;font-weight:800;display:flex;justify-content:space-between;align-items:center;
}
.faq-q::-webkit-details-marker{display:none}
.faq-q::after{content:"+";font-size:20px;font-weight:700;color:var(--red);line-height:1}
[data-theme="dark"] .faq-q::after{color:var(--gold)}
.faq-item[open] .faq-q::after{content:"–"}
.faq-a{padding:0 20px 18px;font-size:14.5px;line-height:1.7;opacity:.9}
```

- [ ] **Step 5: Rodar pra ver passar**

Run: `npx vitest run tests/site/pages/faq.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/site/pages/faq.tsx app/globals.css tests/site/pages/faq.test.tsx
git commit -m "feat(pages): arquétipo FAQ (acordeão CSS)"
```

---

## Task 5: Dispatch de arquétipo na rota catch-all

**Files:**
- Modify: `app/[locale]/(site)/[...path]/page.tsx`
- Delete: `components/site/info-page.tsx` (substituído pelo Editorial + fallback)

- [ ] **Step 1: Reescrever a rota para o dispatch**

`app/[locale]/(site)/[...path]/page.tsx`:
```tsx
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing, type Locale } from '@/lib/i18n/routing';
import { INFO_PAGE_PATHS, resolvePage } from '@/lib/site-nav';
import { getPageData } from '@/lib/site-pages';
import { SiteShell } from '@/components/site/site-shell';
import { Editorial } from '@/components/site/pages/editorial';
import { Legal } from '@/components/site/pages/legal';
import { Faq } from '@/components/site/pages/faq';

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    INFO_PAGE_PATHS.map((path) => ({ locale, path })),
  );
}

export default async function InternalPage({
  params,
}: {
  params: Promise<{ locale: Locale; path: string[] }>;
}) {
  const { locale, path } = await params;
  setRequestLocale(locale);

  const page = resolvePage(path);
  if (!page) notFound();

  const href = '/' + path.join('/');
  const data = getPageData(href);
  const common = { sectionKey: page.sectionKey, titleKey: page.titleKey, locale };

  // Fallback: páginas ainda sem conteúdo dedicado (fases B–D) → Editorial genérico.
  const fallback = {
    archetype: 'editorial' as const,
    lead: 'Conteúdo em construção.',
    sections: [{ heading: page.titleKey, paragraphs: ['Em breve.'] }],
  };
  const resolved = data ?? fallback;

  let body: React.ReactNode;
  switch (resolved.archetype) {
    case 'legal':
      body = <Legal {...common} data={resolved} />;
      break;
    case 'faq':
      body = <Faq {...common} data={resolved} />;
      break;
    case 'editorial':
    default:
      body = <Editorial {...common} data={resolved as Extract<typeof resolved, { archetype: 'editorial' }>} />;
  }

  return <SiteShell locale={locale}>{body}</SiteShell>;
}
```

> Nota: o fallback usa `t(titleKey)` como heading via i18n dentro do Editorial — aqui passamos a própria key como texto cru de heading só no fallback; é temporário até a página ganhar conteúdo nas fases B–D. (Aceitável: nenhuma página de produção fica em lorem; as não-migradas mostram "Conteúdo em construção / Em breve".)

- [ ] **Step 2: Apagar o `info-page.tsx` antigo**

```bash
git rm components/site/info-page.tsx
```
Conferir que nada mais importa `info-page` (a rota agora usa os arquétipos):
Run: `grep -rn "info-page" app components lib tests` → Expected: sem resultados.

- [ ] **Step 3: Typecheck + build**

Run: `npm run typecheck && npm run build`
Expected: compila; rotas internas geradas (PT/EN).

- [ ] **Step 4: Commit**

```bash
git add "app/[locale]/(site)/[...path]/page.tsx" components/site/info-page.tsx
git commit -m "feat(pages): dispatch de arquétipo na rota catch-all + fallback Editorial"
```

---

## Task 6: Verificação visual + suíte + deploy

- [ ] **Step 1: Suíte completa**

Run: `npx vitest run`
Expected: todos verdes (incl. i18n parity e os novos testes de arquétipo).

- [ ] **Step 2: Build + servir + screenshots Playwright** (light/dark) das páginas Fase A

Servir o build (`npm run start`) e, via `tmpplaywright-temp/node_modules` (Playwright local; `node tmpplaywright-temp/<script>.cjs`), screenshotar:
- `/o-santa/historia` (Editorial, light + dark)
- `/privacidade` (Legal)
- `/ajuda` (FAQ — abrir um item)

Conferir: conteúdo real da História aparece, Legal com seções numeradas + data, FAQ abre/fecha, brand-safe (sem vermelho tocando preto), light/dark coerentes.

- [ ] **Step 3: Deploy**

```bash
git push origin master
vercel deploy --prod --yes
```
Verificar 200 em `/o-santa/historia`, `/privacidade`, `/ajuda` (PT/EN).

---

## Self-Review

**1. Cobertura do spec (Fase A):** registry (Task 1) ✓; Editorial data-driven (Task 2) ✓; Legal (Task 3) ✓; FAQ (Task 4) ✓; dispatch por arquétipo no catch-all + fallback sem-lorem (Task 5) ✓; conteúdo real História + estrutura legal/faq (Task 1 dados) ✓. Arquétipos B–D explicitamente fora desta fase.

**2. Placeholders:** sem "TBD/implementar depois". Conteúdo de exemplo legal/faq está rotulado como exemplo (decisão do spec: placeholder honesto). História = dados reais. Fallback mostra "Conteúdo em construção", não lorem.

**3. Consistência de tipos:** `EditorialData`/`LegalData`/`FaqData` definidos na Task 1 e reusados igual nas Tasks 2–5; `PageData` union; `getPageData` retorna `PageData|undefined`; o dispatch faz narrowing por `archetype`. `Editorial`/`Legal`/`Faq` recebem `{sectionKey,titleKey,locale,data}` idêntico nos 3.

**Dependência:** o fallback (Task 5) referencia `page.titleKey` como heading cru — só no fallback temporário; páginas migradas (B–D) substituem por conteúdo real.
