// Conteúdo estático de cada página interna + qual arquétipo a renderiza.
// Dados reais onde há base (CLAUDE.md/BRAND.md); placeholder honesto no resto.
import site from '@/content/site.json';

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
  | 'stories'
  | 'feature';

export interface EditorialData {
  archetype: 'editorial';
  lead: string;
  sections: { heading: string; paragraphs: string[] }[];
  quote?: { text: string; cite: string };
  facts?: { k: string; v: string }[];
  heroImage?: string;
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
export interface AchievementsData {
  archetype: 'achievements';
  lead: string;
  stats?: { label: string; value: string }[];
  timeline?: { year: string; title: string; desc: string }[];
  ranking?: { pos: number; name: string; value: string }[];
  rankingNote?: string;
}
export interface PeopleData {
  archetype: 'people';
  lead: string;
  groups: { title: string; members: { role: string; name: string }[] }[];
}
export interface LocationsData {
  archetype: 'locations';
  lead: string;
  groups: { region: string; places: { name: string; address: string; city: string }[] }[];
}
export interface DocumentsData {
  archetype: 'documents';
  lead: string;
  items: { title: string; kind: string; meta?: string; href: string }[];
}
export interface GalleryData {
  archetype: 'gallery';
  lead: string;
  images: { src: string; alt: string }[];
}
export interface ListingData {
  archetype: 'listing';
  lead: string;
  items: { group?: string; tag?: string; title: string; meta?: string; href?: string }[];
}
export interface LandingData {
  archetype: 'landing';
  lead: string;
  highlights: { title: string; text: string }[];
  ctaLabel: string;
  ctaHref: string;
}
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select';
  options?: string[];
  required?: boolean;
}
export interface FormPageData {
  archetype: 'form';
  lead: string;
  fields: FormField[];
  consent?: string;
  submitLabel: string;
}
export interface StoriesData {
  archetype: 'stories';
  lead: string;
  mode: 'all' | 'featured' | 'city' | 'generation';
  stories: { author: string; city: string; generation: string; excerpt: string; featured?: boolean }[];
}
export interface FeatureData {
  archetype: 'feature';
  heroImage: string;
  heroKicker?: string;
  intro: string;
  stats: { label: string; value: string }[];
  crests?: { year: string; src: string }[];
  crestsTitle?: string;
  crestsNote?: string;
  marcosTitle?: string;
  marcos: { year: string; title: string; desc: string }[];
  quote?: { text: string; cite: string };
}

export type PageData =
  | EditorialData
  | LegalData
  | FaqData
  | AchievementsData
  | PeopleData
  | LocationsData
  | DocumentsData
  | GalleryData
  | ListingData
  | LandingData
  | FormPageData
  | StoriesData
  | FeatureData;

// Dados reais derivados do content/site.json (notícias publicadas + jogos).
const sj = site as unknown as {
  news: { slug: string; title: { pt: string }; tag: { pt: string }; publishedAt: string; status: string }[];
  matches: { competition: string; opponent: string; isHome: boolean; scoreHome: number | null; scoreAway: number | null }[];
};
const NEWS_ITEMS: ListingData['items'] = sj.news
  .filter((n) => n.status === 'published')
  .map((n) => ({
    tag: n.tag.pt,
    title: n.title.pt,
    meta: n.publishedAt.slice(0, 10).split('-').reverse().join('/'),
  }));
const MATCH_ITEMS: ListingData['items'] = sj.matches.map((m) => ({
  group: m.competition,
  tag: m.competition,
  title: m.isHome ? `Santa Cruz × ${m.opponent}` : `${m.opponent} × Santa Cruz`,
  meta:
    m.scoreHome != null && m.scoreAway != null
      ? `${m.scoreHome} – ${m.scoreAway}`
      : 'A definir',
}));

const CONTACT_FIELDS: FormField[] = [
  { name: 'nome', label: 'Nome', type: 'text', required: true },
  { name: 'email', label: 'E-mail', type: 'email', required: true },
  { name: 'assunto', label: 'Assunto', type: 'select', options: ['Dúvida geral', 'Sócio Coral', 'Ingressos', 'Imprensa', 'Outro'] },
  { name: 'mensagem', label: 'Mensagem', type: 'textarea', required: true },
];

const CORAL_STORIES: StoriesData['stories'] = [
  { author: 'Carlos Henrique', city: 'Recife · PE', generation: 'Anos 80', excerpt: 'Meu avô me levou ao Arruda pela primeira vez em 1983. Nunca mais larguei o tricolor.', featured: true },
  { author: 'José Mário', city: 'São Paulo · SP', generation: 'Anos 70', excerpt: 'Saí de Pernambuco, mas o coração ficou no Arruda. Fundei um consulado coral por aqui.', featured: true },
  { author: 'Ana Beatriz', city: 'Caruaru · PE', generation: 'Anos 2000', excerpt: 'Cresci ouvindo as histórias da Fita Azul. Hoje levo meus filhos pra torcer comigo.' },
  { author: 'Rafaela Lima', city: 'Olinda · PE', generation: 'Anos 90', excerpt: 'A maior alegria foi a Copa do Nordeste em 2016, com a nação lotando o estádio.' },
  { author: 'Pedro Lucas', city: 'Petrolina · PE', generation: 'Anos 2010', excerpt: 'Sou da geração que aprendeu, desde cedo, que é tradição — não é moda.' },
  { author: 'Dona Severina', city: 'Recife · PE', generation: 'Anos 60', excerpt: 'Torço desde menina. O Santa é a paixão da minha vida inteira.' },
];

const LEGAL_SECTIONS: LegalData['sections'] = [
  {
    heading: '1. Informações gerais',
    paragraphs: [
      'Este documento descreve, em linhas gerais, as práticas do Santa Cruz Futebol Clube no site oficial. Conteúdo de exemplo — substituir pelo texto jurídico definitivo.',
    ],
  },
  {
    heading: '2. Dados coletados',
    paragraphs: [
      'Podemos coletar dados fornecidos voluntariamente (como nome e e-mail em formulários) e dados de navegação. Conteúdo de exemplo.',
    ],
  },
  {
    heading: '3. Uso das informações',
    paragraphs: [
      'As informações são usadas para operar o site, responder contatos e melhorar a experiência do torcedor. Conteúdo de exemplo.',
    ],
  },
  {
    heading: '4. Seus direitos',
    paragraphs: [
      'Você pode solicitar acesso, correção ou exclusão dos seus dados pelos canais de contato. Conteúdo de exemplo.',
    ],
  },
  {
    heading: '5. Contato',
    paragraphs: [
      'Dúvidas sobre este documento podem ser enviadas pela página de Contato. Conteúdo de exemplo.',
    ],
  },
];

export const SITE_PAGES: Record<string, PageData> = {
  '/o-santa/historia': {
    archetype: 'feature',
    heroImage: '/images/torcida1.jpg',
    heroKicker: 'Desde 1914',
    intro: 'Em 3 de fevereiro de 1914, no pátio da Igreja de Santa Cruz, no bairro da Boa Vista, onze meninos entre 14 e 16 anos fundaram o Santa Cruz Foot-Ball Club. Mais de um século depois, a agremiação virou a maior paixão de Pernambuco — "A Mais Apaixonada" — com uma das maiores torcidas do Brasil e uma história de pioneirismo, glórias e superação.',
    stats: [
      { label: 'Fundação', value: '03·02·1914' },
      { label: 'Fundadores', value: '11' },
      { label: 'Bairro', value: 'Boa Vista' },
      { label: 'Cidade', value: 'Recife · PE' },
    ],
    crestsTitle: 'A evolução do escudo',
    crests: [
      { year: '1915', src: '/images/escudo-santa-cruz_1915-212x200.jpg' },
      { year: '1916', src: '/images/escudo-santa-cruz_1916-212x200.jpg' },
      { year: 'Atual', src: '/images/logo.png' },
    ],
    crestsNote: 'As cores nasceram em etapas: preto e branco em 1914, com o vermelho somado em 1915 — formando o tricolor. O escudo passou por várias versões, do primeiro emblema, atribuído a Teófilo de Carvalho, o "Lacraia", até a marca atual.',
    marcosTitle: 'Marcos da história',
    marcos: [
      { year: '1934', title: '7×0 no Sport', desc: 'A maior diferença de gols da história do Clássico das Multidões.' },
      { year: '1957', title: 'Quebra do jejum', desc: 'Campeão pernambucano sobre o Sport diante de 29 mil — e o primeiro Supercampeonato.' },
      { year: '1972', title: 'Inauguração do Arruda', desc: 'Em 4 de julho, 0 a 0 com o Flamengo diante de 57.688 pagantes.' },
      { year: '1975', title: '4º no Brasileirão', desc: 'Melhor campanha na Série A, com vitórias sobre Palmeiras e Flamengo no Maracanã.' },
      { year: '1979', title: 'Fita Azul', desc: 'Excursão internacional invicta — enfrentou Paris Saint-Germain e a seleção romena.' },
      { year: '1983', title: 'Tri-Supercampeão', desc: 'Final com o Náutico diante de 76 mil, decidida nos pênaltis — feito exclusivo do clube.' },
      { year: '2013', title: 'Campeão da Série C', desc: 'Primeiro título nacional, somado ao tricampeonato estadual.' },
      { year: '2016', title: 'Copa do Nordeste', desc: 'O primeiro título regional e a estreia internacional do clube.' },
      { year: '2025', title: 'SAF e acesso', desc: 'Nova era empresarial e o retorno à Série C após o acesso na Série D.' },
    ],
    quote: { text: 'É tradição, não é moda.', cite: 'Torcida do Santa Cruz' },
  },
  '/o-santa/precursor-da-inclusao': {
    archetype: 'editorial',
    heroImage: '/images/foto_arruda.jpg',
    lead: 'Clube do povo desde a fundação, o Santa Cruz foi pioneiro ao abrir as portas do futebol pernambucano a quem a elite excluía.',
    sections: [
      {
        heading: 'O clube do povo',
        paragraphs: [
          'Fundado em 1914 por meninos das classes populares da Boa Vista, o Santa Cruz nasceu popular e assim permaneceu — "O Mais Querido das Multidões". Numa cidade dividida, virou o time da gente comum.',
          'Essa origem se reflete na torcida: uma das maiores e mais apaixonadas do Brasil, que em 2011, mesmo na Série D, levou em média 39.916 pessoas por jogo — a maior média de público de todas as divisões do futebol brasileiro naquele ano.',
        ],
      },
      {
        heading: 'Pioneiro da inclusão',
        paragraphs: [
          'Até a fundação do Santa Cruz, negros e mestiços eram proibidos de integrar o elenco do Náutico e de outros times da capital. O Santa nasceu para mudar isso: foi um dos primeiros clubes a abrir as portas a jogadores de todas as origens.',
          'Teófilo de Carvalho — estudante de engenharia que também desenhou o escudo — foi o primeiro jogador negro do futebol do Norte-Nordeste. A união entre negros, mestiços e brancos fez o Santa Cruz se tornar o clube mais popular do Nordeste já nos primeiros anos de vida.',
        ],
      },
      {
        heading: 'Um tricolor que representa o povo',
        paragraphs: [
          'Não à toa, as cores carregam esse significado. Segundo o historiador Leonardo Dantas, o preto representa o povo negro, o branco os brancos e o vermelho os povos indígenas — o Santa Cruz como espelho da diversidade pernambucana.',
        ],
      },
    ],
  },
  '/privacidade': { archetype: 'legal', updatedAt: '2026-06-08', sections: LEGAL_SECTIONS },
  '/cookies': {
    archetype: 'legal',
    updatedAt: '2026-06-08',
    sections: [
      {
        heading: '1. O que são cookies',
        paragraphs: [
          'Cookies são pequenos arquivos armazenados no seu navegador para melhorar a experiência de navegação. Conteúdo de exemplo.',
        ],
      },
      {
        heading: '2. Como usamos',
        paragraphs: [
          'Usamos cookies essenciais para o funcionamento do site e, com seu consentimento, cookies de preferência. Conteúdo de exemplo.',
        ],
      },
      {
        heading: '3. Gerenciamento',
        paragraphs: [
          'Você pode gerenciar cookies nas configurações do seu navegador. Conteúdo de exemplo.',
        ],
      },
    ],
  },
  '/termos-de-uso': {
    archetype: 'legal',
    updatedAt: '2026-06-08',
    sections: [
      {
        heading: '1. Aceitação',
        paragraphs: [
          'Ao acessar o site oficial do Santa Cruz, você concorda com estes termos. Conteúdo de exemplo.',
        ],
      },
      {
        heading: '2. Uso do conteúdo',
        paragraphs: [
          'O conteúdo do site é de propriedade do clube e não pode ser reproduzido sem autorização. Conteúdo de exemplo.',
        ],
      },
      {
        heading: '3. Responsabilidades',
        paragraphs: [
          'O clube se esforça para manter as informações corretas e atualizadas. Conteúdo de exemplo.',
        ],
      },
    ],
  },
  '/ajuda': {
    archetype: 'faq',
    intro:
      'Respostas rápidas para as dúvidas mais comuns dos torcedores. Conteúdo de exemplo — a ser revisado.',
    items: [
      {
        q: 'Como me torno Sócio Coral?',
        a: 'Acesse a página Seja Sócio no menu Viva o Santa e escolha o seu plano. Conteúdo de exemplo.',
      },
      {
        q: 'Onde compro ingressos?',
        a: 'Os ingressos são vendidos pelos canais oficiais divulgados antes de cada jogo. Conteúdo de exemplo.',
      },
      {
        q: 'Como falo com o clube?',
        a: 'Use a página Fale Conosco, no menu Contato. Conteúdo de exemplo.',
      },
    ],
  },

  '/o-santa/simbolos': {
    archetype: 'editorial',
    lead: 'O escudo, o tricolor e a Cobra Coral: os símbolos que identificam o Santa Cruz desde 1914.',
    sections: [
      {
        heading: 'O nome e o escudo',
        paragraphs: [
          'O clube foi batizado de Santa Cruz Foot-Ball Club em referência ao pátio da Igreja de Santa Cruz, na Boa Vista, onde os fundadores jogavam.',
          'O escudo foi desenhado por Teófilo de Carvalho — estudante de engenharia e o primeiro jogador negro do futebol nordestino. Ele criou uma âncora branca estilizada, ladeada por gomos vermelho e preto, com o monograma "SCFC" sobreposto. A âncora simboliza firmeza e tranquilidade; nos anos 1970, uma mudança estatutária inverteu a posição do vermelho e do preto.',
        ],
      },
      {
        heading: 'As cores',
        paragraphs: [
          'O Santa Cruz nasceu alvinegro, em 1914: preto e branco foram escolhidos como símbolo de aproximar adeptos de todas as raças. Em 1915 o clube incorporou o vermelho e tornou-se tricolor — e o branco sempre separa o preto do vermelho na identidade visual.',
          'Para o historiador Leonardo Dantas, as três cores traduzem a alma do clube: o preto remete ao povo negro, o branco aos brancos e o vermelho aos povos indígenas — um retrato da mistura do povo pernambucano.',
        ],
      },
      {
        heading: 'A Cobra Coral',
        paragraphs: [
          'O mascote nasceu da semelhança entre as listras do uniforme tricolor e a serpente coral. O apelido pegou e virou identidade: na reforma do Arruda, em 1982, a pintura do estádio imitava as escamas da cobra.',
          'Entre as alcunhas mais queridas estão "A Mais Apaixonada", "O Mais Querido das Multidões", "Cobra Coral" e "Gigante do Arruda".',
        ],
      },
    ],
  },

  '/o-santa/titulos': {
    archetype: 'achievements',
    lead: 'Mais de um século de glórias: 29 Campeonatos Pernambucanos, a Copa do Nordeste de 2016, a Série C de 2013, 5 Copas Pernambuco e o exclusivo Tri-Supercampeonato.',
    stats: [
      { label: 'Pernambucanos', value: '29' },
      { label: 'Supercampeonatos', value: '3' },
      { label: 'Copa do Nordeste', value: '1' },
      { label: 'Série C', value: '1' },
    ],
    timeline: [
      { year: '1931', title: 'Primeiro Pernambucano', desc: 'O primeiro título estadual da história do clube.' },
      { year: '1957 · 1976 · 1983', title: 'Tri-Supercampeonato Pernambucano', desc: 'Feito exclusivo do clube, reunindo os vencedores dos turnos do estadual.' },
      { year: '1967', title: 'Hexagonal Norte-Nordeste', desc: 'O primeiro título regional do Santa Cruz.' },
      { year: '1979', title: 'Fita Azul', desc: 'Excursão internacional invicta — enfrentou o Paris Saint-Germain e a seleção romena.' },
      { year: '2013', title: 'Campeão da Série C', desc: 'Primeiro título nacional, somado ao tricampeonato estadual.' },
      { year: '2015', title: 'Centenário do Pernambucano', desc: 'Campeão na 100ª edição do Campeonato Pernambucano.' },
      { year: '2016', title: 'Copa do Nordeste', desc: 'Título regional sobre o Campinense, diante da nação coral.' },
    ],
  },

  '/o-santa/artilheiros': {
    archetype: 'achievements',
    lead: 'Os maiores goleadores da história coral — sete jogadores ultrapassaram a marca de 100 gols com o manto tricolor.',
    rankingNote:
      'O Santa Cruz foi o primeiro clube do Nordeste a atingir 10.000 gols. Givanildo Oliveira é quem mais vestiu o manto, com 599 jogos. Abaixo, os artilheiros com mais de 100 gols pelo clube.',
    ranking: [
      { pos: 1, name: 'Tará', value: '207' },
      { pos: 2, name: 'Luciano Veloso', value: '174' },
      { pos: 3, name: 'Ramón', value: '148' },
      { pos: 4, name: 'Betinho', value: '143' },
      { pos: 5, name: 'Fernando Santana', value: '123' },
      { pos: 6, name: 'Elói de Paula', value: '115' },
      { pos: 7, name: 'Siduca', value: '105' },
    ],
  },

  '/o-santa/enderecos': {
    archetype: 'locations',
    lead: 'A casa da Cobra Coral — o Arruda, sexto maior estádio do Brasil e o segundo maior particular.',
    groups: [
      {
        region: 'Recife',
        places: [
          { name: 'Estádio José do Rego Maciel (Arruda)', address: 'Praça do Arruda, s/n — Arruda · Inaugurado em 1972 · Recorde de público: 78.391 (Santa Cruz 1×1 Sport, 1999)', city: 'Recife · PE' },
          { name: 'Sede Social', address: 'Endereço a confirmar', city: 'Recife · PE' },
        ],
      },
    ],
  },

  '/o-santa/consulados': {
    archetype: 'locations',
    lead: 'A nação coral está em todo lugar. Encontre o consulado mais perto de você.',
    groups: [
      {
        region: 'Pernambuco',
        places: [
          { name: 'Consulado Recife', address: 'Endereço a confirmar', city: 'Recife · PE' },
          { name: 'Consulado Caruaru', address: 'Endereço a confirmar', city: 'Caruaru · PE' },
        ],
      },
      {
        region: 'Sudeste',
        places: [
          { name: 'Consulado São Paulo', address: 'Endereço a confirmar', city: 'São Paulo · SP' },
          { name: 'Consulado Rio de Janeiro', address: 'Endereço a confirmar', city: 'Rio de Janeiro · RJ' },
        ],
      },
    ],
  },

  '/clube/diretoria': {
    archetype: 'people',
    lead: 'A gestão do Santa Cruz Futebol Clube.',
    groups: [
      {
        title: 'Diretoria',
        members: [
          { role: 'Presidente do Executivo', name: 'Bruno Rodrigues' },
          { role: 'Vice-Presidente do Executivo', name: 'Marco Benevides' },
          { role: 'Presidente do Conselho', name: 'Victor Pessoa de Melo' },
          { role: 'Presidente da Patrimonial', name: 'Adriano Lucena' },
          { role: 'Diretor Executivo', name: 'Allan Araújo' },
          { role: 'Diretor Executivo de Futebol', name: 'Alex Brasil' },
          { role: 'Gerente Executivo', name: 'Moisés Von Ahn' },
        ],
      },
      {
        title: 'Staff Administrativo',
        members: [
          { role: 'Gerente Adm. de Futebol', name: 'Eloy Bione' },
          { role: 'Gerente Júnior de Futebol', name: 'Felipe Bezerra' },
          { role: 'Massagista', name: 'Fernando "Catatau"' },
          { role: 'Massagista', name: 'Sebastião "Santos"' },
          { role: 'Roupeiro', name: 'Marcelo José' },
          { role: 'Roupeiro', name: 'Robson Guedes' },
          { role: 'Serviços Gerais', name: 'Rosenildo "Madruga"' },
        ],
      },
      {
        title: 'Comunicação e Marketing',
        members: [
          { role: 'Diretor de Comunicação', name: 'Ivan Júnior' },
          { role: 'Diretor de Marketing', name: 'André Lira' },
          { role: 'Gerente de Marketing', name: 'Fernando Fleury' },
          { role: 'Assessor de Imprensa', name: 'Léo Albertim' },
          { role: 'Social Media', name: 'Vinicius Marinho' },
          { role: 'Cinegrafista / TV Coral', name: 'Fernando Carvalho' },
          { role: 'Designer Gráfico', name: 'Léo Tenório' },
          { role: 'Designer Gráfico', name: 'Arthur Novaes' },
          { role: 'Fotógrafa', name: 'Evelyn Victória' },
          { role: 'Estagiária', name: 'Geovanna Soares' },
        ],
      },
      {
        title: 'Equipe Médica',
        members: [
          { role: 'Médico', name: 'Wilton Bezerra' },
          { role: 'Médico', name: 'João Paulo' },
          { role: 'Médico', name: 'João Lucas' },
          { role: 'Fisioterapeuta', name: 'Zeucks Belém' },
          { role: 'Fisioterapeuta', name: 'Wendell Ferreira' },
          { role: 'Fisioterapeuta', name: 'Ramon Filipe' },
          { role: 'Nutricionista', name: 'Paulo Garcia' },
        ],
      },
    ],
  },

  // ---- Documentos ----
  '/clube/transparencia': {
    archetype: 'documents',
    lead: 'Prestação de contas e documentos de gestão do clube.',
    items: [
      { title: 'Demonstrações Financeiras 2025', kind: 'PDF', meta: '2025', href: '#' },
      { title: 'Demonstrações Financeiras 2024', kind: 'PDF', meta: '2024', href: '#' },
      { title: 'Parecer do Conselho Fiscal', kind: 'PDF', meta: '2025', href: '#' },
    ],
  },
  '/clube/estatuto': {
    archetype: 'documents',
    lead: 'O Estatuto Social do Santa Cruz Futebol Clube.',
    items: [{ title: 'Estatuto Social', kind: 'PDF', meta: 'Vigente', href: '#' }],
  },
  '/clube/documentos': {
    archetype: 'documents',
    lead: 'Documentos institucionais e regimentos do clube.',
    items: [
      { title: 'Regimento Interno', kind: 'PDF', href: '#' },
      { title: 'Código de Ética', kind: 'PDF', href: '#' },
      { title: 'Política de Privacidade', kind: 'PDF', href: '/privacidade' },
    ],
  },
  '/clube/relatorios': {
    archetype: 'documents',
    lead: 'Relatórios de gestão e atividades.',
    items: [
      { title: 'Relatório Anual 2025', kind: 'PDF', meta: '2025', href: '#' },
      { title: 'Relatório Anual 2024', kind: 'PDF', meta: '2024', href: '#' },
    ],
  },
  '/midia/guia-da-partida': {
    archetype: 'documents',
    lead: 'O guia oficial de cada partida do tricolor.',
    items: [
      { title: 'Guia da Partida — Pernambucano', kind: 'PDF', meta: 'Edição mais recente', href: '#' },
      { title: 'Guia da Partida — Copa do Nordeste', kind: 'PDF', href: '#' },
    ],
  },
  '/midia/press-kit': {
    archetype: 'documents',
    lead: 'Materiais oficiais para imprensa e parceiros.',
    items: [
      { title: 'Escudo oficial (PNG)', kind: 'PNG', meta: 'Marca', href: '/images/logo.png' },
      { title: 'Manual de Marca', kind: 'PDF', meta: '2025', href: '#' },
      { title: 'Banco de fotos oficiais', kind: 'ZIP', href: '#' },
    ],
  },
  '/midia/conteudo-imprensa': {
    archetype: 'documents',
    lead: 'Releases e materiais de apoio para jornalistas.',
    items: [
      { title: 'Release — Coletiva de imprensa', kind: 'PDF', href: '#' },
      { title: 'Notas oficiais', kind: 'PDF', href: '#' },
    ],
  },

  // ---- Galeria ----
  '/midia/fotos': {
    archetype: 'gallery',
    lead: 'A nação coral, o Arruda e os momentos do tricolor.',
    images: [
      { src: '/images/torcida1.jpg', alt: 'Torcida do Santa Cruz' },
      { src: '/images/foto_arruda.jpg', alt: 'Estádio do Arruda' },
      { src: '/images/estadio_arruda_em_2020_700_5.jpg', alt: 'Arruda em 2020' },
      { src: '/images/everaldo.JPG', alt: 'Everaldo' },
      { src: '/images/Everaldo-SantaCruz-Divulgacao.jpeg', alt: 'Everaldo — divulgação' },
      { src: '/images/jogador_02.png', alt: 'Atleta tricolor' },
      { src: '/images/jogador_03.png', alt: 'Atleta tricolor' },
      { src: '/images/goleiro.png', alt: 'Goleiro tricolor' },
      { src: '/images/escudo-santa-cruz_1915-212x200.jpg', alt: 'Escudo de 1915' },
      { src: '/images/escudo-santa-cruz_1916-212x200.jpg', alt: 'Escudo de 1916' },
    ],
  },

  // ---- Listagem ----
  '/midia/noticias': {
    archetype: 'listing',
    lead: 'As últimas do tricolor.',
    items: NEWS_ITEMS,
  },
  '/futebol/calendario': {
    archetype: 'listing',
    lead: 'Os próximos compromissos da Cobra Coral.',
    items: MATCH_ITEMS,
  },
  '/futebol/resultados': {
    archetype: 'listing',
    lead: 'Os últimos resultados do tricolor.',
    items: MATCH_ITEMS,
  },
  '/viva-o-santa/tv-coral': {
    archetype: 'listing',
    lead: 'Bastidores, entrevistas e a emoção coral em vídeo.',
    items: [
      { tag: 'Bastidores', title: 'Bastidores da vitória coral', meta: 'Vídeo' },
      { tag: 'Entrevista', title: 'Entrevista exclusiva', meta: 'Vídeo' },
      { tag: 'Gols', title: 'Os gols da rodada', meta: 'Vídeo' },
    ],
  },

  // ---- Landing ----
  '/futebol/categorias-de-base': {
    archetype: 'landing',
    lead: 'O celeiro de craques da Cobra Coral — formando talentos para o futuro tricolor.',
    highlights: [
      { title: 'Formação', text: 'Categorias do Sub-15 ao Sub-20, com estrutura e acompanhamento profissional.' },
      { title: 'Peneiras', text: 'Acompanhe as datas de avaliação e como participar.' },
      { title: 'Talentos', text: 'Da base coral saíram nomes que brilharam no Brasil e no mundo — caso de Rivaldo, que passou pelo Santa Cruz no início da carreira.' },
    ],
    ctaLabel: 'Saiba mais',
    ctaHref: '#',
  },
  '/viva-o-santa/experiencias': {
    archetype: 'landing',
    lead: 'Viva o Santa por dentro: experiências exclusivas para o torcedor coral.',
    highlights: [
      { title: 'Tour do Arruda', text: 'Conheça os bastidores do maior estádio de Pernambuco.' },
      { title: 'Day use', text: 'Um dia de torcedor com acesso a áreas exclusivas.' },
      { title: 'Camarote Coral', text: 'Assista aos jogos com conforto e gastronomia.' },
    ],
    ctaLabel: 'Quero viver',
    ctaHref: '#',
  },
  '/viva-o-santa/censo': {
    archetype: 'landing',
    lead: 'Conte pro Santa quem é você. O Censo do Santa mapeia a maior nação do Nordeste.',
    highlights: [
      { title: 'Participe', text: 'Responda o censo e ajude o clube a te conhecer melhor.' },
      { title: 'Vantagens', text: 'Torcedores cadastrados recebem novidades e ofertas em primeira mão.' },
      { title: 'A nação', text: 'Juntos, somos a torcida mais apaixonada do Brasil.' },
    ],
    ctaLabel: 'Participar do Censo',
    ctaHref: '#',
  },

  // ---- Locais ----
  '/viva-o-santa/lojas': {
    archetype: 'locations',
    lead: 'Vista o manto em uma das lojas oficiais do Santa Cruz.',
    groups: [
      {
        region: 'Recife',
        places: [
          { name: 'Loja Oficial Arruda', address: 'Praça do Arruda, s/n', city: 'Recife · PE' },
          { name: 'Loja Oficial Shopping', address: 'Endereço a confirmar', city: 'Recife · PE' },
        ],
      },
      {
        region: 'Online',
        places: [{ name: 'Loja Virtual', address: 'Entrega para todo o Brasil', city: 'santacruz.com.br' }],
      },
    ],
  },

  // ---- Formulário ----
  '/contato/fale-conosco': {
    archetype: 'form',
    lead: 'Fale com o Santa Cruz. Respondemos o mais rápido possível.',
    fields: CONTACT_FIELDS,
    submitLabel: 'Enviar mensagem',
  },
  '/ajuda/contato': {
    archetype: 'form',
    lead: 'Precisa de ajuda? Envie sua mensagem.',
    fields: CONTACT_FIELDS,
    submitLabel: 'Enviar mensagem',
  },
  '/contato/trabalhe-conosco': {
    archetype: 'form',
    lead: 'Quer fazer parte da Cobra Coral? Conte pra gente sobre você.',
    fields: [
      { name: 'nome', label: 'Nome', type: 'text', required: true },
      { name: 'email', label: 'E-mail', type: 'email', required: true },
      { name: 'area', label: 'Área de interesse', type: 'select', options: ['Administrativo', 'Futebol', 'Marketing', 'Comunicação', 'Outro'] },
      { name: 'mensagem', label: 'Conte sobre você', type: 'textarea', required: true },
    ],
    submitLabel: 'Enviar candidatura',
  },
  '/contato/ouvidoria': {
    archetype: 'form',
    lead: 'Canal direto para manifestações do torcedor. Sua voz importa.',
    fields: [
      { name: 'nome', label: 'Nome', type: 'text' },
      { name: 'email', label: 'E-mail', type: 'email', required: true },
      { name: 'tipo', label: 'Tipo de manifestação', type: 'select', options: ['Denúncia', 'Reclamação', 'Sugestão', 'Elogio'] },
      { name: 'mensagem', label: 'Sua manifestação', type: 'textarea', required: true },
    ],
    submitLabel: 'Registrar manifestação',
  },
  '/ajuda/contato-imprensa': {
    archetype: 'form',
    lead: 'Canal exclusivo para a imprensa.',
    fields: [
      { name: 'nome', label: 'Nome', type: 'text', required: true },
      { name: 'veiculo', label: 'Veículo', type: 'text' },
      { name: 'email', label: 'E-mail', type: 'email', required: true },
      { name: 'mensagem', label: 'Pauta / solicitação', type: 'textarea', required: true },
    ],
    submitLabel: 'Enviar',
  },
  '/historias/enviar': {
    archetype: 'form',
    lead: 'Toda história coral merece ser contada. Envie a sua e faça parte da nação.',
    fields: [
      { name: 'nome', label: 'Seu nome', type: 'text', required: true },
      { name: 'cidade', label: 'Cidade', type: 'text', required: true },
      { name: 'geracao', label: 'Geração', type: 'select', options: ['Anos 60', 'Anos 70', 'Anos 80', 'Anos 90', 'Anos 2000', 'Anos 2010', 'Anos 2020'] },
      { name: 'historia', label: 'Sua história coral', type: 'textarea', required: true },
    ],
    consent: 'Autorizo o Santa Cruz a publicar minha história no site oficial (conforme a LGPD).',
    submitLabel: 'Enviar minha história',
  },

  // ---- Histórias Coral ----
  '/historias/explorar': {
    archetype: 'stories',
    lead: 'Histórias de quem faz a maior nação do Nordeste. Explore e se emocione.',
    mode: 'all',
    stories: CORAL_STORIES,
  },
  '/historias/destaque': {
    archetype: 'stories',
    lead: 'As histórias corais em destaque, escolhidas pela nação.',
    mode: 'featured',
    stories: CORAL_STORIES,
  },
  '/historias/por-cidade': {
    archetype: 'stories',
    lead: 'A paixão coral espalhada pelo Brasil — histórias por cidade.',
    mode: 'city',
    stories: CORAL_STORIES,
  },
  '/historias/por-geracao': {
    archetype: 'stories',
    lead: 'De geração em geração: a tradição que não é moda.',
    mode: 'generation',
    stories: CORAL_STORIES,
  },
};

export function getPageData(href: string): PageData | undefined {
  return SITE_PAGES[href];
}
