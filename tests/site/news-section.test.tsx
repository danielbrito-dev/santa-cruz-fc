import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import pt from '@/messages/pt.json';

// Mock next-intl/server: getTranslations returns a lookup from the PT messages;
// getFormatter returns a minimal formatter with dateTime returning a fixed string.
vi.mock('next-intl/server', () => ({
  getTranslations: async (ns: string) => {
    const messages: Record<string, Record<string, string>> = {
      news: {
        heading1: 'Notícias',
        heading2: 'do Clube',
        photos: '{count} fotos',
      },
      common: { allNews: 'Todas as notícias' },
    };
    const section = messages[ns] ?? {};
    return (key: string, vals?: Record<string, unknown>) => {
      let str = section[key] ?? key;
      if (vals && typeof vals.count === 'number') {
        str = str.replace('{count}', String(vals.count));
      }
      return str;
    };
  },
  getFormatter: async () => ({
    dateTime: () => '27 de maio de 2026',
  }),
}));

import { NewsSection } from '@/components/site/news-section';

const content: any = { news: [
  { id:'f', slug:'f', featured:true, position:0, status:'published', tag:{pt:'Destaque',en:'Featured'}, title:{pt:'Arruda lotado',en:'Packed Arruda'}, excerpt:{pt:'',en:''}, body:{pt:'',en:''}, coverImage:'/images/estadio.jpg', photoCount:0, publishedAt:'2026-05-27T14:20:00' },
  { id:'a', slug:'a', featured:false, position:1, status:'published', tag:{pt:'Futebol',en:'Football'}, title:{pt:'Patrick renova',en:'Patrick renews'}, excerpt:{pt:'',en:''}, body:{pt:'',en:''}, coverImage:'/images/patrick.jpg', photoCount:24, publishedAt:'2026-05-27T00:00:00' },
  { id:'d', slug:'d', featured:false, position:2, status:'draft', tag:{pt:'Rascunho',en:'Draft'}, title:{pt:'Rascunho oculto',en:'Hidden draft'}, excerpt:{pt:'',en:''}, body:{pt:'',en:''}, coverImage:'/images/draft.jpg', photoCount:0, publishedAt:'2026-05-27T00:00:00' },
  { id:'arc', slug:'arc', featured:false, position:3, status:'archived', tag:{pt:'Arquivado',en:'Archived'}, title:{pt:'Notícia arquivada',en:'Archived article'}, excerpt:{pt:'',en:''}, body:{pt:'',en:''}, coverImage:'/images/archived.jpg', photoCount:0, publishedAt:'2026-05-27T00:00:00' },
]};

describe('NewsSection', () => {
  it('renders featured title and a grid item with photo count', async () => {
    const ui = await NewsSection({ content, locale: 'pt' } as any);
    render(<NextIntlClientProvider locale="pt" messages={pt}>{ui}</NextIntlClientProvider>);
    expect(screen.getByText('Arruda lotado')).toBeInTheDocument();
    expect(screen.getByText('Patrick renova')).toBeInTheDocument();
    expect(screen.getByText(/24 fotos/)).toBeInTheDocument();
  });

  it('does not render draft items', async () => {
    const ui = await NewsSection({ content, locale: 'pt' } as any);
    render(<NextIntlClientProvider locale="pt" messages={pt}>{ui}</NextIntlClientProvider>);
    expect(screen.queryByText('Rascunho oculto')).not.toBeInTheDocument();
  });

  it('does not render archived items', async () => {
    const ui = await NewsSection({ content, locale: 'pt' } as any);
    render(<NextIntlClientProvider locale="pt" messages={pt}>{ui}</NextIntlClientProvider>);
    expect(screen.queryByText('Notícia arquivada')).not.toBeInTheDocument();
  });
});
