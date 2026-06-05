import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import pt from '@/messages/pt.json';
import { CookieBanner } from '@/components/site/cookie-banner';

function renderBanner() {
  return render(
    <NextIntlClientProvider locale="pt" messages={pt}>
      <CookieBanner />
    </NextIntlClientProvider>,
  );
}

describe('CookieBanner', () => {
  beforeEach(() => localStorage.clear());

  it('shows the banner when no consent stored, then hides + persists on accept', async () => {
    const user = userEvent.setup();
    renderBanner();
    // appears after mount effect
    const accept = await screen.findByRole('button', { name: /Aceitar/i });
    expect(accept).toBeInTheDocument();
    await user.click(accept);
    expect(localStorage.getItem('cookie-consent')).toBe('accepted');
    expect(screen.queryByRole('button', { name: /Aceitar/i })).not.toBeInTheDocument();
  });

  it('does not show when consent already accepted', () => {
    localStorage.setItem('cookie-consent', 'accepted');
    renderBanner();
    expect(screen.queryByRole('button', { name: /Aceitar/i })).not.toBeInTheDocument();
  });
});
