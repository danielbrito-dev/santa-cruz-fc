import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import pt from '@/messages/pt.json';

// Mock next-intl navigation so usePathname/useRouter don't require the Next.js router in jsdom
vi.mock('@/lib/i18n/navigation', () => ({
  Link: ({ href, children, ...rest }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...rest}>{children}</a>
  ),
  usePathname: () => '/',
  useRouter: () => ({ replace: vi.fn() }),
}));

import { HeaderClient } from '@/components/site/header.client';

describe('Header', () => {
  it('renders translated nav labels and the crest', () => {
    render(
      <NextIntlClientProvider locale="pt" messages={pt}>
        <HeaderClient />
      </NextIntlClientProvider>,
    );
    const newsLinks = screen.getAllByText('Notícias');
    expect(newsLinks.length).toBeGreaterThanOrEqual(1);
    const crests = screen.getAllByAltText(/Santa Cruz/i);
    expect(crests.length).toBeGreaterThanOrEqual(1);
  });
});
