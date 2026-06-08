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
};

export function getPageData(href: string): PageData | undefined {
  return SITE_PAGES[href];
}
