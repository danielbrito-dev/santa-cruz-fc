import type { Locale } from '@/lib/i18n/routing';

export type LocalizedText = Record<Locale, string>;

export interface MatchItem {
  // `comp` = machine key (icon/filter/styling); `competition` = display label.
  id: string; competition: string; comp: 'pernambucano' | 'nordeste' | 'copa-br' | 'serie-c';
  opponent: string; opponentShort: string; isHome: boolean;
  status: LocalizedText; scoreHome: number | null; scoreAway: number | null;
  matchCenterUrl: string;
}
export interface NewsItem {
  id: string; slug: string; tag: LocalizedText; title: LocalizedText;
  excerpt: LocalizedText; body: LocalizedText; coverImage: string; photoCount: number;
  publishedAt: string; featured: boolean; position: number;
  status: 'draft' | 'published' | 'archived';
}
export interface Club {
  id: string;
  name: string;
  shortName: string;       // sigla (casa com MatchItem.opponentShort)
  crestUrl: string | null; // URL do escudo (null → cai na sigla)
  rival?: boolean;         // rivais (Sport/Náutico) → escudo levemente inclinado + negativo suave
}
export interface CardItem {
  id: string; eyebrow: LocalizedText; title: LocalizedText; image: string;
  ctaLabel: LocalizedText; ctaUrl: string; size: 'span' | 'normal'; position: number;
}
export interface Sponsor { id: string; name: string; logo: string; url: string; tier: 'master' | 'fornecedor' | 'apoio'; position: number; }
export interface SocialLink { id: string; network: string; url: string; }
export interface FooterColumn { heading: LocalizedText; links: { label: LocalizedText; url: string }[]; }

export interface SiteContent {
  hero: { tagline: LocalizedText; ctaLabel: LocalizedText; ctaUrl: string; backdrop: string; titleLine1: LocalizedText; titleLine2: LocalizedText };
  matches: MatchItem[];
  clubs: Club[];
  news: NewsItem[];
  banners: CardItem[];
  institutional: CardItem[];
  sponsors: Sponsor[];
  social: SocialLink[];
  footer: { brandBlurb: LocalizedText; columns: FooterColumn[]; chantLine1: LocalizedText; chantEmphasis: LocalizedText; chantLine2: LocalizedText };
}

export interface ContentSource {
  getSiteContent(): Promise<SiteContent>;
}
