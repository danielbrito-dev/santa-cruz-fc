import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import pt from '@/messages/pt.json';

// Mock navigation — usePathname returns /admin/noticias to test active state
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
  usePathname: () => '/admin/noticias',
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

  it('renders Conteúdo link', () => {
    renderNav();
    expect(screen.getByText(/conteúdo/i)).toBeInTheDocument();
  });

  it('renders Notícias link', () => {
    renderNav();
    expect(screen.getByText(/notícias/i)).toBeInTheDocument();
  });

  it('renders Usuários link', () => {
    renderNav();
    expect(screen.getByText(/usuários/i)).toBeInTheDocument();
  });

  it('marks Notícias as active when pathname is /admin/noticias', () => {
    renderNav();
    const links = screen.getAllByRole('link');
    const noticiasLink = links.find(
      (l) => l.getAttribute('href')?.includes('/admin/noticias'),
    );
    expect(noticiasLink).toBeDefined();
    expect(noticiasLink).toHaveClass('active');
  });

  it('does not mark Dashboard as active when pathname is /admin/noticias', () => {
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
    expect(activeLinks[0].getAttribute('href')).toContain('/admin/noticias');
  });
});
