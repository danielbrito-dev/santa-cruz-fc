import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import pt from '@/messages/pt.json';

vi.mock('@/lib/i18n/navigation', () => ({
  Link: ({ href, children, ...rest }: { href: string; children: React.ReactNode; [k: string]: unknown }) => (
    <a href={String(href)} {...rest}>
      {children}
    </a>
  ),
  usePathname: () => '/',
  useRouter: () => ({ replace: () => {}, push: () => {} }),
}));

vi.mock('next-intl/server', () => ({
  getTranslations: async () => {
    const map: Record<string, string> = {
      title: 'Elenco',
      subtitle: 'Time profissional masculino.',
      athletes: 'Atletas',
      positions: 'Posições',
      navLabel: 'Posições do elenco',
      goleiros: 'Goleiros',
      laterais: 'Laterais',
      zagueiros: 'Zagueiros',
      'meio-campistas': 'Meio-campistas',
      atacantes: 'Atacantes',
      staffHeading: 'Comissão Técnica',
    };
    return (key: string, vars?: Record<string, unknown>) =>
      key === 'season' ? `Temporada ${vars?.year ?? ''}` : (map[key] ?? key);
  },
}));

import { SquadPage } from '@/components/site/squad-page';
import type { Squad, PlayerGroup } from '@/server/squad/squad';

const squad: Squad = {
  season: '2026',
  players: [
    { number: 1, name: 'Gabriel Felix', group: 'goleiros', photo: '', country: 'BRA' },
    { number: 9, name: 'Everaldo', group: 'atacantes', photo: '/images/everaldo_sembg.png', country: 'BRA' },
  ],
  staff: [{ role: { pt: 'Técnico', en: 'Head Coach' }, name: 'Treinador X' }],
};
const groups: PlayerGroup[] = [
  { key: 'goleiros', players: [squad.players[0]] },
  { key: 'atacantes', players: [squad.players[1]] },
];

describe('SquadPage', () => {
  it('renderiza o título, os jogadores e a comissão técnica', async () => {
    const Component = await SquadPage({ squad, groups, locale: 'pt' });
    render(
      <NextIntlClientProvider locale="pt" messages={pt}>
        {Component}
      </NextIntlClientProvider>,
    );
    expect(screen.getByText('Elenco')).toBeInTheDocument();
    expect(screen.getByText('Gabriel Felix')).toBeInTheDocument();
    expect(screen.getByText('Everaldo')).toBeInTheDocument();
    expect(screen.getByText('Treinador X')).toBeInTheDocument();
    // a foto real do Everaldo é renderizada
    expect(screen.getByAltText('Everaldo')).toBeInTheDocument();
  });

  it('mostra o bloco de estatísticas (atletas e posições)', async () => {
    const Component = await SquadPage({ squad, groups, locale: 'pt' });
    const { container } = render(
      <NextIntlClientProvider locale="pt" messages={pt}>
        {Component}
      </NextIntlClientProvider>,
    );
    expect(screen.getByText('Atletas')).toBeInTheDocument();
    expect(screen.getByText('Posições')).toBeInTheDocument();
    // o primeiro card de estatística mostra o total de jogadores (2)
    const firstStat = container.querySelector('.squad-stat strong');
    expect(firstStat?.textContent).toBe('2');
  });
});
