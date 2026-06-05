import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

vi.mock('next-intl/server', () => ({
  getTranslations: async () => (k: string) =>
    ({ heading1: 'Identidade', heading2: 'Coral' } as Record<string, string>)[k] ?? k,
}));

import { InstitutionalGrid } from '@/components/site/institutional-grid';

const content: any = {
  institutional: [
    {
      id: 's',
      eyebrow: { pt: 'Social', en: 'Social' },
      title: { pt: 'Santa pela Comunidade', en: 'Santa for the Community' },
      image: '/images/a.jpg',
      ctaLabel: { pt: 'Descobrir', en: 'Discover' },
      ctaUrl: '#',
      size: 'span',
      position: 0,
    },
    {
      id: 'n',
      eyebrow: { pt: 'Áudio', en: 'Audio' },
      title: { pt: 'Podcast Cobra Coral', en: 'Cobra Coral Podcast' },
      image: '/images/b.jpg',
      ctaLabel: { pt: 'Ouvir', en: 'Listen' },
      ctaUrl: '#',
      size: 'normal',
      position: 1,
    },
  ],
};

describe('InstitutionalGrid', () => {
  it('applies span-rows for span size and plain inst-card for normal', async () => {
    const ui = await InstitutionalGrid({ content, locale: 'pt' } as any);
    const { container } = render(ui);
    const cards = container.querySelectorAll('.inst-card');
    expect(cards.length).toBe(2);
    // span card must have both classes
    expect(container.querySelector('.inst-card.span-rows')).toBeTruthy();
    // the normal one must NOT have span-rows
    const normal = Array.from(cards).find((c) => !c.classList.contains('span-rows'));
    expect(normal).toBeTruthy();
  });

  it('renders the localized section heading', async () => {
    const ui = await InstitutionalGrid({ content, locale: 'pt' } as any);
    const { container } = render(ui);
    expect(container.querySelector('.section-title')?.textContent).toContain('Identidade');
  });
});
