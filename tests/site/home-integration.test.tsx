import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import pt from '@/messages/pt.json';

// Footer/Header render internal links via the localized Link — mock navigation in jsdom
vi.mock('@/lib/i18n/navigation', () => ({
  Link: ({ href, children, ...rest }: { href: string; children: React.ReactNode; [k: string]: unknown }) => (
    <a href={String(href)} {...rest}>
      {children}
    </a>
  ),
  usePathname: () => '/',
  useRouter: () => ({ replace: () => {}, push: () => {} }),
}));

// Mock next-intl/server — getTranslations reads from pt messages, getFormatter returns a minimal stub
vi.mock('next-intl/server', () => ({
  getTranslations: async (ns: string | { namespace: string }) => {
    const namespace = typeof ns === 'string' ? ns : ns.namespace;
    const messages = pt as unknown as Record<string, Record<string, string>>;
    const section = messages[namespace] ?? {};
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

import { JsonContentSource } from '@/server/content/json-source';
import { Hero } from '@/components/site/hero';
import { NewsSection } from '@/components/site/news-section';
import { Footer } from '@/components/site/footer';

describe('home integration (real site.json)', () => {
  it('renders hero, news and footer from real content without throwing', async () => {
    const content = await new JsonContentSource().getSiteContent();
    const hero = await Hero({ content, locale: 'pt' } as any);
    const news = await NewsSection({ content, locale: 'pt' } as any);
    const footer = await Footer({ content, locale: 'pt' } as any);
    const { container } = render(
      <NextIntlClientProvider locale="pt" messages={pt}>
        {hero}
        {news}
        {footer}
      </NextIntlClientProvider>,
    );
    expect(container.querySelector('.hero-title')).toBeTruthy();
    expect(container.querySelector('.news-feature')).toBeTruthy();
    expect(container.querySelector('.chant')).toBeTruthy();
  });
});
