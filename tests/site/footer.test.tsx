import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import pt from '@/messages/pt.json';

// Footer renders internal links via the localized Link — mock navigation in jsdom
vi.mock('@/lib/i18n/navigation', () => ({
  Link: ({ href, children, ...rest }: { href: string; children: React.ReactNode; [k: string]: unknown }) => (
    <a href={String(href)} {...rest}>
      {children}
    </a>
  ),
}));

// Mock next-intl/server so getTranslations works in jsdom without a Next.js request context
vi.mock('next-intl/server', () => ({
  getTranslations: async (namespace: string) => {
    const messages = pt as unknown as Record<string, Record<string, string>>;
    const ns = messages[namespace] ?? {};
    return (key: string) => (ns as Record<string, string>)[key] ?? key;
  },
}));

import { Footer } from '@/components/site/footer';

const content: any = { footer: {
  brandBlurb:{pt:'Fundado em 1914.',en:'Founded in 1914.'},
  columns:[{ heading:{pt:'Clube',en:'Club'}, links:[{label:{pt:'História',en:'History'},url:'#'}] }],
  chantLine1:{pt:'É',en:"It's"}, chantEmphasis:{pt:'tradição,',en:'tradition,'}, chantLine2:{pt:'não é moda.',en:'not a trend.'},
}};

describe('Footer', () => {
  it('renders chant emphasis, a footer link, and the 1914 heritage stat', async () => {
    const ui = await Footer({ content, locale: 'pt' } as any);
    render(<NextIntlClientProvider locale="pt" messages={pt}>{ui}</NextIntlClientProvider>);
    expect(screen.getByText('tradição,')).toBeInTheDocument();
    expect(screen.getByText('História')).toBeInTheDocument();
    expect(screen.getByText('1914')).toBeInTheDocument();
  });
});
