import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import pt from '@/messages/pt.json';
import { ThemeToggle } from '@/components/site/theme-toggle';

function renderToggle() {
  return render(
    <NextIntlClientProvider locale="pt" messages={pt}>
      <ThemeToggle />
    </NextIntlClientProvider>,
  );
}

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.dataset.theme = 'light';
  });

  it('toggles data-theme on <html> and persists to localStorage', async () => {
    const user = userEvent.setup();
    renderToggle();
    const btn = await screen.findByRole('button', { name: /Alternar tema/i });
    await user.click(btn);
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
    await user.click(btn);
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('reflects the current theme via aria-pressed', async () => {
    document.documentElement.dataset.theme = 'dark';
    renderToggle();
    const btn = await screen.findByRole('button', { name: /Alternar tema/i });
    expect(btn).toHaveAttribute('aria-pressed', 'true');
  });
});
