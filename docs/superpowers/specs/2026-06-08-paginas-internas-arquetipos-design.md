# Design — Páginas internas por arquétipo (conteúdo condizente com cada menu)

> Data: 2026-06-08
> Projeto: Plataforma Santa Cruz FC (Next.js App Router, bilíngue PT/EN, light/dark).
> Autoridade visual: `BRAND.md`. Fatos do clube: `CLAUDE.md` + `BRAND.md`.

## 1. Objetivo

Substituir o template genérico único (`InfoPage`, hero + lorem) por **layouts condizentes com cada menu**: cada página interna passa a usar um **arquétipo** apropriado ao seu tipo de conteúdo, preenchido com **dados reais do clube onde há base autoritativa** (não lorem em tudo) e **placeholder honesto** onde não dá pra saber sem inventar (diretoria atual, placares, fotos). É uma **rodada de frontend** — sem Supabase/CRM; features de dados (Calendário, Resultados, Histórias) ficam como páginas estáticas representativas, prontas pra plugar backend depois.

## 2. Decisões (fechadas com o usuário)

| Tema | Decisão |
| --- | --- |
| Escopo | **Só frontend.** Backend (Supabase/CRM, envio de histórias, calendário ao vivo) fica para builds separados. |
| Conteúdo | **Dados reais onde conhecidos** (história, títulos, símbolos, endereços, press kit, notícias do `site.json`); placeholder **claro** no resto. Nunca fabricar fato falso (ex.: nomes de diretoria → "A definir"/genéricos). |
| Abordagem | **Arquétipos reutilizáveis** (não 30 designs únicos). Cada href de menu → 1 arquétipo + dados. |
| Marca | `BRAND.md` em tudo: Inter, preto/branco/vermelho `#DD0000`, dourado/cinza pontual, escudo sem efeitos, **preto e vermelho nunca se tocam (branco separa)**. Light/dark via tokens. |
| Idioma | PT/EN (paridade de chaves i18n exigida pelo teste). Conteúdo longo/lorem pode ser igual nos dois; rótulos via i18n. |

## 3. Arquitetura

Hoje: `app/[locale]/(site)/[...path]/page.tsx` → `resolvePage(path)` → **um** `InfoPage`. Passa a:

- **`lib/site-pages.ts`** — registry: `Record<href, { archetype: ArchetypeKey; data: PageData }>`. Fonte única do conteúdo de cada página interna.
- **`components/site/pages/<archetype>.tsx`** — um componente por arquétipo (§4), todos seguindo o ritmo de marca (hero themed → corpo → CTA opcional) e o padrão de footer-parallax (`min-height:100vh` + fill).
- **`app/[locale]/(site)/[...path]/page.tsx`** — resolve href → registry → renderiza `<Archetype data=... locale=... sectionKey titleKey />` dentro do `SiteShell`. `generateStaticParams` continua sobre `INFO_PAGE_PATHS`.
- `InfoPage` atual vira o arquétipo **Editorial** (renomeado/realocado) — reaproveita hero, lead, pull-quote, aside "Fatos rápidos", CTA Fita Azul já prontos.
- `resolvePage` continua dando `{sectionKey, titleKey}` (breadcrumb); o registry dá `{archetype, data}`. Páginas sem entrada no registry caem no Editorial com conteúdo padrão (fallback seguro).

## 4. Arquétipos

Cada um é um componente isolado, testável, light/dark, brand-safe.

1. **Editorial** (`editorial.tsx`) — narrativa: hero + lead + seções (h2 + parágrafos) + pull-quote + aside "Fatos rápidos" + CTA. Também atende **Legal** (privacidade/cookies/termos) com variante "documento" (sem aside, tipografia de leitura) e **FAQ** (Ajuda) com acordeão CSS.
2. **Conquistas** (`achievements.tsx`) — hero + faixa de números (X estaduais, etc.) + **linha do tempo** de títulos (ano + troféu + descrição) + grade de marcos. Variante **Ranking** (Artilheiros): tabela posição/nome/gols.
3. **Pessoas** (`people.tsx`) — grade de cards (foto/silhueta + nome + cargo), agrupada por área. Diretoria, Comissão Técnica.
4. **Documentos** (`documents.tsx`) — lista de itens (ícone de arquivo + título + ano/tipo + botão baixar). Transparência, Documentos, Relatórios, Estatuto, Press Kit, Guia da Partida, Conteúdo p/ Imprensa.
5. **Galeria** (`gallery.tsx`) — grid masonry de fotos com hover; lightbox simples (CSS/target) opcional. Flickr/Banco de Fotos.
6. **Listagem** (`listing.tsx`) — cards filtráveis (chips de filtro client-side). Calendário, Resultados, Notícias, TV Coral (vídeos).
7. **Locais** (`locations.tsx`) — cards de local (nome, endereço, região, cidade) + agrupamento por região. Consulados, Endereços, Lojas Oficiais.
8. **Formulário** (`form-page.tsx`) — form on-brand (campos + consentimento) com submit **fake** (mostra confirmação, não persiste). Fale Conosco, Trabalhe Conosco, Ouvidoria, Enviar Minha História, Ajuda/Contato, Contato Imprensa.
9. **Landing** (`landing.tsx`) — hero forte + blocos de benefício + planos/itens + CTA. Seja Sócio (já externo no menu, mas há landing interna p/ Experiências/Censo), Experiências, Censo, TV Coral (hub), Categorias de Base.
10. **Histórias** (`stories.tsx`) — feed de cards de histórias (autor, cidade, geração, trecho) + filtros (cidade/geração) client-side + destaques. Explorar, Em Destaque, Por Cidade, Por Geração. **Histórias-exemplo estáticas**; envio real = backend depois.

## 5. Mapa página → arquétipo → conteúdo

| Página (href) | Arquétipo | Conteúdo |
| --- | --- | --- |
| `/o-santa/historia` | Editorial | **Real:** 1914, Boa Vista, 11 fundadores, Lacraia, Arruda, apelidos. |
| `/o-santa/titulos` | Conquistas | **Real:** 1934 7×0 Sport, Tri-Super 1957/76/83, Fita Azul 1979, Série C 2013, Centenário PE 2015, Copa do Nordeste 2016, títulos pernambucanos. |
| `/o-santa/artilheiros` | Conquistas (Ranking) | Placeholder honesto (tabela com nomes/gols ilustrativos marcados como exemplo). |
| `/o-santa/simbolos` | Editorial (visual) | **Real:** escudo (8 versões), tricolor, monograma SCFC, Cobra Coral. |
| `/o-santa/precursor-da-inclusao` | Editorial | Narrativa do clube do povo / "A Mais Apaixonada" (tom real, sem inventar datas específicas). |
| `/o-santa/consulados` | Locais | Placeholder (consulados-exemplo por cidade). |
| `/o-santa/enderecos` | Locais | **Real:** Estádio do Arruda; sede placeholder. |
| `/futebol/categorias-de-base` | Landing | Placeholder. |
| `/futebol/calendario` | Listagem | Jogos-exemplo (adversários reais: Sport, Náutico…; placares ilustrativos). |
| `/futebol/resultados` | Listagem | Resultados-exemplo. |
| `/viva-o-santa/experiencias` | Landing | Placeholder comercial. |
| `/viva-o-santa/censo` | Landing | Placeholder (chamada pro censo). |
| `/viva-o-santa/tv-coral` | Listagem (vídeos) | Vídeos-exemplo. |
| `/viva-o-santa/lojas` | Locais | Lojas-exemplo. |
| `/midia/noticias` | Listagem | **Real:** notícias `status:'published'` do `content/site.json`. |
| `/midia/fotos` | Galeria | Fotos de `public/images` (reais do projeto). |
| `/midia/guia-da-partida` | Documentos | Placeholder (PDFs-exemplo). |
| `/midia/press-kit` | Documentos | **Real:** escudo (`/images/logo.png`), manual de marca; resto placeholder. |
| `/midia/conteudo-imprensa` | Listagem/Documentos | Releases-exemplo. |
| `/clube/diretoria` | Pessoas | Cargos reais; nomes "A definir". |
| `/clube/transparencia` · `/documentos` · `/relatorios` · `/estatuto` | Documentos | Placeholder (itens-exemplo por ano). |
| `/contato/fale-conosco` · `/trabalhe-conosco` · `/ouvidoria` | Formulário | Campos apropriados + consentimento. |
| `/historias/explorar` · `/destaque` · `/por-cidade` · `/por-geracao` | Histórias | Histórias-exemplo + filtros. |
| `/historias/enviar` | Formulário | Form de envio (nome, cidade, geração, história, consentimento LGPD) — submit fake. |
| `/ajuda` | Editorial (FAQ) | FAQ-exemplo. |
| `/ajuda/contato` · `/ajuda/contato-imprensa` | Formulário | Contato. |
| `/privacidade` · `/cookies` · `/termos-de-uso` | Editorial (Legal) | Texto jurídico placeholder com estrutura real (seções numeradas). |

## 6. Componentes & dados

- Tipos do registry em `lib/site-pages.ts` (discriminated union por `archetype`, cada um com seu `data` tipado). Dados são **conteúdo estático** (literais), não i18n pesado — strings longas podem ser PT (com EN quando trivial); rótulos de UI (botões, filtros, "Baixar", "Enviar") via i18n `page`/`menu`.
- Imagens: reutilizar `public/images/*` reais (escudo, jogadores, Arruda, torcida) onde fizer sentido (galeria, press kit, history hero).
- Forms: client components com estado local + validação simples; submit mostra estado de sucesso (sem rede). Marcado claramente como demonstração.
- Filtros (Listagem/Histórias): client component com `useState`, filtragem em memória sobre os dados estáticos.

## 7. Marca, i18n, acessibilidade

- Vermelho só com separação branca; acentos em dourado nas superfícies escuras; CTA fora-do-vermelho perto do footer (Fita Azul, como já feito). Escudo sem efeitos.
- Novos rótulos de UI → namespace i18n `page` (paridade PT/EN). Conteúdo longo placeholder pode ser idêntico nos dois idiomas nesta fase.
- Heading hierarchy correta, `alt` em imagens, forms com `<label>`, foco visível.

## 8. Testes (Vitest)

- **Registry puro** (`lib/site-pages.ts`): toda página de `INFO_PAGE_PATHS` (nav + extra, exceto dedicadas) tem entrada no registry com `archetype` válido; nenhum href órfão. (teste de cobertura do registry)
- **i18n parity** (já existe) continua passando com as novas chaves `page`.
- **Render de arquétipos**: teste leve por arquétipo (renderiza com dados-exemplo e checa um elemento-chave), mockando `@/lib/i18n/navigation` (padrão já estabelecido).
- Build de produção verde + screenshots Playwright (light/dark) por arquétipo antes do deploy.

## 9. Faseamento (a implementar no plano)

Construir e mesclar arquétipo-a-arquétipo (cada lote deixa o site melhor, sem quebrar):
- **A — infra**: registry + catch-all multi-arquétipo + Editorial (migra o atual) + Legal/FAQ. (cobre O Santa/História, Precursor, Privacidade/Cookies/Termos, Ajuda)
- **B — institucional**: Conquistas (Títulos/Artilheiros) + Símbolos + Pessoas (Diretoria/Comissão) + Locais (Endereços/Consulados).
- **C — mídia & comercial**: Documentos + Galeria + Listagem (Notícias/Calendário/Resultados/TV Coral) + Landing (Experiências/Censo/Categorias).
- **D — relacionamento**: Formulário (contatos/ouvidoria/trabalhe) + Histórias (feed + filtros, estático).

## 10. Riscos / observações

- **Não inventar fatos**: diretoria/artilheiros/datas incertas = placeholder rotulado. Só uso como "real" o que está em `CLAUDE.md`/`BRAND.md` ou é fato público consolidado (fundação, tricolor, Arruda).
- Features de dados são **estáticas representativas** aqui; quando o backend entrar (Supabase), Listagem/Histórias/Calendário trocam a fonte de dados sem trocar o layout.
- Escopo grande: implementar por lotes (A→D), cada um verificado (build + Playwright) antes do deploy.
