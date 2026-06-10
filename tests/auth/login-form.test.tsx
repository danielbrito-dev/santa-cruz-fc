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

// Mock the server action module so the form can be imported in jsdom without
// pulling in next/headers or other Node-only server internals.
vi.mock('@/server/auth/actions', () => ({
  login: vi.fn(async () => ({})),
  logout: vi.fn(),
}));

import { LoginForm } from '@/components/auth/login-form';
import { login } from '@/server/auth/actions';

function renderForm() {
  return render(
    <NextIntlClientProvider locale="pt" messages={pt}>
      <LoginForm />
    </NextIntlClientProvider>,
  );
}

describe('LoginForm', () => {
  it('does not render a Google button (e-mail/senha only)', () => {
    renderForm();
    expect(screen.queryByRole('button', { name: /Google/i })).not.toBeInTheDocument();
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

  it('calls the login action when a valid form is submitted', async () => {
    vi.mocked(login).mockResolvedValueOnce({});
    renderForm();
    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    fireEvent.change(emailInput, { target: { value: 'torcedor@santacruz.com.br' } });
    fireEvent.change(passwordInput, { target: { value: 'senhasegura123' } });
    const submitBtn = screen.getByRole('button', { name: /entrar/i });
    fireEvent.click(submitBtn);
    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('torcedor@santacruz.com.br', 'senhasegura123', 'pt');
    });
  });

  it('shows the errInvalid message when login returns {error:"invalid"}', async () => {
    vi.mocked(login).mockResolvedValueOnce({ error: 'invalid' });
    renderForm();
    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    const submitBtn = screen.getByRole('button', { name: /entrar/i });
    fireEvent.click(submitBtn);
    await waitFor(() => {
      expect(screen.getByRole('alert', { name: undefined })).toBeInTheDocument();
      expect(screen.getByText(/e-mail ou senha incorretos/i)).toBeInTheDocument();
    });
  });

  it('clears the server error when the user edits the email field', async () => {
    vi.mocked(login).mockResolvedValueOnce({ error: 'invalid' });
    renderForm();
    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    await waitFor(() => {
      expect(screen.getByText(/e-mail ou senha incorretos/i)).toBeInTheDocument();
    });
    // Editing the email clears the error
    fireEvent.change(emailInput, { target: { value: 'corrected@example.com' } });
    await waitFor(() => {
      expect(screen.queryByText(/e-mail ou senha incorretos/i)).not.toBeInTheDocument();
    });
  });
});
