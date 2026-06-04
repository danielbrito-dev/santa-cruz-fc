# Projeto: Site Santa Cruz FC

## Regra zero — leia antes de qualquer coisa

**Antes de tocar em qualquer página deste projeto, leia `BRAND.md`.**

`BRAND.md` é a fonte da verdade visual (paleta, tipografia, escudo, narrativa) extraída do manual de marca oficial de 2025 (`manualdemarca1.pdf`). Em qualquer conflito entre o estado atual de `index.html` e `BRAND.md`, **`BRAND.md` vence** — `index.html` está em estética antiga (cordel/xilogravura) e deve ser migrado conforme novas páginas forem feitas.

## Estrutura

- `index.html` — home atual (single file, ~2700 linhas, estética cordel — fora do padrão de marca).
- `images/` — assets reais usados pelo HTML (escudos históricos, jogadores, estádio).
- `BRAND.md` — regras de marca **autoridade**.
- `manualdemarca1.pdf` — manual original (300 páginas, sem camada de texto — usar `pdftoppm` para rasterizar se precisar consultar).
- `.vercel/` — projeto Vercel linkado a `meu-trato/santa`. Deploy com `vercel deploy --yes`.
- `.vercelignore` — exclui mockups, .exe e arquivos pesados não usados.

## Títulos e datas históricas do Santa Cruz

Fonte: confirmado pelo usuário. Usar essas datas/títulos em qualquer referência (easter eggs, watermarks, copy):

- **1934** — Santa 7×0 Sport (maior diferença de gols no Clássico das Multidões)
- **1957, 1976, 1983** — **Tri-Supercampeonato Pernambucano** (feito exclusivo do clube, reunia vencedores dos turnos do estadual)
- **1972** — Inauguração do Estádio do Arruda
- **1979** — **Fita Azul** (excursão internacional invicta) ← NÃO 1973
- **2013** — Tri Campeão estadual + **Campeão da Série C** do Brasileirão
- **2015** — Campeão do **Centenário** do Campeonato Pernambucano
- **2016** — **Copa do Nordeste** ← NÃO 2006

## Convenções de código

- HTML único hoje, mas qualquer página nova **deve** usar a paleta e fontes do `BRAND.md`.
- Idioma: português brasileiro nas copies (sem hífens em nomes próprios estrangeiros).
- Nada de bibliotecas pesadas — manter o site estático e leve.

## Deploy

URL pública: <https://santa-ruby.vercel.app>
Team Vercel: `meu-trato` (login `danielmedeiros52`).
