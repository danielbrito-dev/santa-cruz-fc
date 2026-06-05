import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import pt from '@/messages/pt.json';

// LoginForm does not import Link — the page does.
// Mock navigation as a safety net in case transitive imports pull it in.
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
  usePathname: () => '/',
  useRouter: () => ({ replace: vi.fn() }),
}));

import { LoginForm } from '@/components/auth/login-form';

function renderForm() {
  return render(
    <NextIntlClientProvider locale="pt" messages={pt}>
      <LoginForm />
    </NextIntlClientProvider>,
  );
}

describe('LoginForm', () => {
  it('renders the Google button', () => {
    renderForm();
    expect(screen.getByRole('button', { name: /Google/i })).toBeInTheDocument();
  });

  it('renders the email and password fields', () => {
    renderForm();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    renderForm();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('shows "campo obrigatório" errors when submitted empty', async () => {
    renderForm();
    const submitBtn = screen.getByRole('button', { name: /entrar/i });
    fireEvent.click(submitBtn);
    await waitFor(() => {
      const errs = screen.getAllByText(/campo obrigatório/i);
      expect(errs.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('shows email error when email format is invalid', async () => {
    renderForm();
    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    fireEvent.change(emailInput, { target: { value: 'not-an-email' } });
    fireEvent.change(passwordInput, { target: { value: 'somepassword' } });
    const submitBtn = screen.getByRole('button', { name: /entrar/i });
    fireEvent.click(submitBtn);
    await waitFor(() => {
      expect(screen.getByText(/e-mail inválido/i)).toBeInTheDocument();
    });
  });

  it('shows the "soon" notice when valid form is submitted (no fake login)', async () => {
    renderForm();
    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    fireEvent.change(emailInput, { target: { value: 'torcedor@santacruz.com.br' } });
    fireEvent.change(passwordInput, { target: { value: 'senhasegura123' } });
    const submitBtn = screen.getByRole('button', { name: /entrar/i });
    fireEvent.click(submitBtn);
    await waitFor(() => {
      expect(
        screen.getByText(/login será conectado em breve/i),
      ).toBeInTheDocument();
    });
  });

  it('shows the "soon" notice when Google button is clicked', async () => {
    renderForm();
    const googleBtn = screen.getByRole('button', { name: /Google/i });
    fireEvent.click(googleBtn);
    await waitFor(() => {
      expect(
        screen.getByText(/login será conectado em breve/i),
      ).toBeInTheDocument();
    });
  });

  it('does not show "soon" notice when form has validation errors', async () => {
    renderForm();
    // Submit with empty fields — validation should block the "soon" notice
    const submitBtn = screen.getByRole('button', { name: /entrar/i });
    fireEvent.click(submitBtn);
    await waitFor(() => {
      expect(screen.queryByText(/login será conectado em breve/i)).not.toBeInTheDocument();
    });
  });
});
