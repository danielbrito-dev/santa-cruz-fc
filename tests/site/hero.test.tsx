import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next-intl/server', () => ({
  getTranslations: async (namespace: string) => {
    const map: Record<string, Record<string, string>> = {
      a11y: { heroBackdrop: 'Torcida do Santa Cruz no Arruda' },
    };
    const ns = map[namespace] ?? {};
    return (key: string) => ns[key] ?? key;
  },
}));

import { Hero } from '@/components/site/hero';

const content: any = { hero: { titleLine1:{pt:'Coral não',en:'Coral never'}, titleLine2:{pt:'recua.',en:'backs down.'}, tagline:{pt:'',en:''}, ctaLabel:{pt:'Garantir ingresso',en:'Get tickets'}, ctaUrl:'#', backdrop:'/images/torcida1.jpg' } };

describe('Hero', () => {
  it('renders the localized CTA (pt)', async () => {
    const ui = await Hero({ content, locale: 'pt' } as any);
    render(ui);
    expect(screen.getByText(/Garantir ingresso/)).toBeInTheDocument();
  });
  it('renders English CTA when locale is en', async () => {
    const ui = await Hero({ content, locale: 'en' } as any);
    render(ui);
    expect(screen.getByText(/Get tickets/)).toBeInTheDocument();
  });
  it('renders both title lines', async () => {
    const ui = await Hero({ content, locale: 'pt' } as any);
    render(ui);
    expect(screen.getByText('Coral não')).toBeInTheDocument();
    expect(screen.getByText('recua.')).toBeInTheDocument();
  });
  it('uses localized alt text for backdrop image', async () => {
    const ui = await Hero({ content, locale: 'pt' } as any);
    render(ui);
    expect(screen.getByAltText('Torcida do Santa Cruz no Arruda')).toBeInTheDocument();
  });
});
