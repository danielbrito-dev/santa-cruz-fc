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
  | StoriesData;

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
    lead: 'O escudo, as cores e a Cobra Coral: os símbolos que identificam o Santa Cruz desde 1914.',
    sections: [
      {
        heading: 'O escudo',
        paragraphs: [
          'O primeiro escudo do Santa Cruz foi criado por Teófilo de Carvalho, o "Lacraia", um dos onze fundadores. Ao longo da história, o escudo passou por oito versões — de 1914 até o emblema atual.',
          'O desenho atual combina o monograma "SCFC" entrelaçado com o escudo dividido em preto e vermelho, contornado para destacar a marca.',
        ],
      },
      {
        heading: 'As cores',
        paragraphs: [
          'O tricolor preto, branco e vermelho é a assinatura do clube. O branco sempre separa o preto do vermelho — regra que vale até hoje na identidade visual.',
        ],
      },
      {
        heading: 'A Cobra Coral',
        paragraphs: [
          'A mascote do clube faz referência às listras coral do uniforme tricolor. "Cobra Coral" e "A Mais Apaixonada" estão entre os apelidos mais queridos da torcida.',
        ],
      },
    ],
  },

  '/o-santa/titulos': {
    archetype: 'achievements',
    lead: 'Mais de um século de glórias: o Santa Cruz é um dos maiores campeões do Nordeste.',
    stats: [
      { label: 'Pernambucanos', value: '29' },
      { label: 'Copa do Nordeste', value: '1' },
      { label: 'Série C', value: '1' },
      { label: 'Desde', value: '1914' },
    ],
    timeline: [
      { year: '1934', title: '7×0 no Sport', desc: 'A maior diferença de gols da história do Clássico das Multidões.' },
      { year: '1957 · 1976 · 1983', title: 'Tri-Supercampeonato Pernambucano', desc: 'Feito exclusivo do clube, reunindo os vencedores dos turnos do estadual.' },
      { year: '1972', title: 'Inauguração do Arruda', desc: 'O Santa passa a mandar seus jogos no maior estádio de Pernambuco.' },
      { year: '1979', title: 'Fita Azul', desc: 'Excursão internacional invicta — um marco na história tricolor.' },
      { year: '2013', title: 'Campeão da Série C', desc: 'Título nacional somado ao tricampeonato estadual.' },
      { year: '2015', title: 'Centenário do Pernambucano', desc: 'Campeão da edição do centenário do Campeonato Pernambucano.' },
      { year: '2016', title: 'Copa do Nordeste', desc: 'O Santa conquista o título regional diante de sua nação.' },
    ],
  },

  '/o-santa/artilheiros': {
    archetype: 'achievements',
    lead: 'Os nomes que escreveram a história do gol coral.',
    rankingNote: 'Ranking histórico em curadoria — nomes e números a confirmar pelo departamento histórico do clube.',
    ranking: [
      { pos: 1, name: 'A definir', value: '—' },
      { pos: 2, name: 'A definir', value: '—' },
      { pos: 3, name: 'A definir', value: '—' },
      { pos: 4, name: 'A definir', value: '—' },
      { pos: 5, name: 'A definir', value: '—' },
    ],
  },

  '/o-santa/enderecos': {
    archetype: 'locations',
    lead: 'Onde encontrar o Santa Cruz.',
    groups: [
      {
        region: 'Recife',
        places: [
          { name: 'Estádio do Arruda', address: 'Praça do Arruda, s/n — Arruda', city: 'Recife · PE' },
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
        title: 'Presidência',
        members: [
          { role: 'Presidente', name: 'A definir' },
          { role: 'Vice-Presidente', name: 'A definir' },
        ],
      },
      {
        title: 'Diretorias',
        members: [
          { role: 'Diretor de Futebol', name: 'A definir' },
          { role: 'Diretor Administrativo', name: 'A definir' },
          { role: 'Diretor Financeiro', name: 'A definir' },
          { role: 'Diretor de Marketing', name: 'A definir' },
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
      { title: 'Talentos', text: 'Jovens revelados que sonham em vestir o tricolor profissional.' },
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
