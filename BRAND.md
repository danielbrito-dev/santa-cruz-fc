# Regras de Marca — Santa Cruz FC

> **Fonte da verdade:** `manualdemarca1.pdf` (Manual da Marca oficial, 2025).
> Páginas rasterizadas em `C:/tmp/manual_pages/p-NN.png` para consulta rápida.
> **Todas as páginas do site devem seguir estas regras.** Em caso de conflito entre o que está no `index.html` atual e este documento, este documento vence.

---

## 1. Paleta de cores

### Cores principais

| Nome     | Hex       | RGB             | CMYK              |
| -------- | --------- | --------------- | ----------------- |
| Preto    | `#000000` | `0, 0, 0`       | `C30 M30 Y30 K100`|
| Branco   | `#FFFFFF` | `255, 255, 255` | `C0 M0 Y0 K0`     |
| Vermelho | `#DD0000` | `220, 0, 0`     | `C0 M100 Y100 K14`|

**Regra crítica:** preto **nunca** toca vermelho — branco sempre separa os dois.
Ordem canônica de menção: **preto, branco, vermelho** (sempre nessa ordem).

### Cores de apoio (uso pontual — datas comemorativas / campanhas especiais)

| Nome    | Hex       | RGB             |
| ------- | --------- | --------------- |
| Dourado | `#C9B896` | `201, 181, 150` |
| Cinza   | `#D6D7D8` | `214, 215, 216` |

**Outras cores** só com aprovação prévia do setor de branding.

---

## 2. Tipografia

**Família oficial: `Inter`** — usar para **todas** as aplicações institucionais.

Pesos previstos no manual:

- Inter Light (300)
- Inter Regular (400)
- Inter Semi-Bold (600)
- Inter Bold (700)
- Inter Extrabold (800)
- Inter Black (900)

Carregar via Google Fonts:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800;900&display=swap" rel="stylesheet">
```

**Não usar** Holtwood, Patua One, Montserrat ou qualquer fonte decorativa em contexto institucional.

---

## 3. Escudo / Logo

### Aplicação principal
Versão colorida (preto + vermelho + contorno preto + miolo branco).
Aceita em **fundo branco** ou **fundo vermelho** (sempre mantendo o contorno preto).

### Versão alternativa
Monocromática negativa (preto sólido em fundo claro, ou branco sólido em fundo escuro).
**Só usar em limitações reais de impressão** — não como escolha estética.

### Monograma "SCFC"
3 variantes:
- Positiva: preto sobre fundo claro.
- Negativa: branca sobre fundo escuro.
- Sobre fundo vermelho: branco.

**Nunca usar marca positiva sobre fundo vermelho.**

### Área de proteção
Margem mínima de `X/4` em todos os lados, onde `X` = largura horizontal do escudo.
Nenhum elemento (texto, imagem, borda) pode invadir essa área.

### Redução máxima
- Impresso: **13mm**
- Digital: **50px**

Nunca aplicar abaixo desse limite.

### Proibido
- Distorcer proporções.
- Alterar cores.
- Retirar elementos.
- Rotacionar.
- Aplicar efeitos (sombra, brilho, gradiente, blur).
- Usar em fundos vermelhos ou pretos **sem o contorno** correto.
- Baixar versões de sites não oficiais — usar **somente** os arquivos fornecidos pelo clube.

---

## 4. Narrativa institucional (uso em copy)

- **Fundação:** 3 de fevereiro de 1914, bairro da Boa Vista, Recife/PE.
- **11 jovens fundadores.** Figura central: **Teófilo de Carvalho ("Lacraia")**, autor do primeiro escudo.
- **Apelidos oficiais:**
  - "A Mais Apaixonada" — referente à torcida.
  - "**Cobra Coral**" — mascote, referência às listras coral do uniforme tricolor.
- **Estádio histórico:** Arruda.
- **Evolução do escudo:** 8 versões — 1914 → 1940 → 1959 → 1960 → 1970 → 1970 → 1980 → atual.

---

## 5. Tom visual do site

O manual é **institucional, limpo, sem efeitos**. Para o **site**, isso significa:

- **Sim:** layout claro, alto contraste, tipografia Inter, paleta restrita às 3 principais.
- **Sim:** cores de apoio (dourado/cinza) só em momentos pontuais — não como cor estrutural.
- **Cuidado:** o `index.html` atual usa estética cordel/xilogravura (Holtwood/Patua, vermelho `#CF1715`, ruídos SVG, filtros torn-paper). **Isso não está alinhado ao manual.** Em qualquer revisão da home ou ao criar páginas novas, migrar para a paleta e fontes oficiais.

---

## 6. Checklist antes de subir qualquer página

- [ ] Vermelho é exatamente `#DD0000`?
- [ ] Texto usa apenas `Inter`?
- [ ] Preto e vermelho nunca encostam diretamente (branco entre eles)?
- [ ] Escudo tem pelo menos 50px de altura e respeita área de proteção `X/4`?
- [ ] Nenhum efeito (sombra/blur/gradiente/rotação) aplicado ao escudo?
- [ ] Cores fora da paleta principal aparecem só em contexto comemorativo?
