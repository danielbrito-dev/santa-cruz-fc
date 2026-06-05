import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import pt from '@/messages/pt.json';

// Mock navigation — usePathname returns /admin/marketing to test active state
vi.mock('@/lib/i18n/navigation', () => ({
  Link: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
  usePathname: () => '/admin/marketing',
  useRouter: () => ({ replace: vi.fn() }),
}));

import { AdminNav } from '@/components/admin/admin-nav';

function renderNav() {
  return render(
    <NextIntlClientProvider locale="pt" messages={pt}>
      <AdminNav />
    </NextIntlClientProvider>,
  );
}

describe('AdminNav', () => {
  it('renders Dashboard link', () => {
    renderNav();
    expect(screen.getByText(/painel/i)).toBeInTheDocument();
  });

  it('renders Marketing link', () => {
    renderNav();
    expect(screen.getByText(/marketing/i)).toBeInTheDocument();
  });

  it('renders Usuários link', () => {
    renderNav();
    expect(screen.getByText(/usuários/i)).toBeInTheDocument();
  });

  it('marks Marketing as active when pathname is /admin/marketing', () => {
    renderNav();
    const links = screen.getAllByRole('link');
    const marketingLink = links.find(
      (l) => l.getAttribute('href')?.includes('/admin/marketing'),
    );
    expect(marketingLink).toBeDefined();
    expect(marketingLink).toHaveClass('active');
  });

  it('does not mark Dashboard as active when pathname is /admin/marketing', () => {
    renderNav();
    const links = screen.getAllByRole('link');
    const dashLink = links.find((l) => {
      const href = l.getAttribute('href') ?? '';
      return href.endsWith('/admin') || href === '/admin';
    });
    expect(dashLink).toBeDefined();
    expect(dashLink).not.toHaveClass('active');
  });

  it('sets aria-current="page" on the active link', () => {
    renderNav();
    const activeLinks = screen
      .getAllByRole('link')
      .filter((l) => l.getAttribute('aria-current') === 'page');
    expect(activeLinks).toHaveLength(1);
    expect(activeLinks[0].getAttribute('href')).toContain('/admin/marketing');
  });
});
