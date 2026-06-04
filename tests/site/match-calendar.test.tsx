import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import pt from '@/messages/pt.json';

// Mock next-intl/server: getTranslations returns a simple lookup from the PT messages
vi.mock('next-intl/server', () => ({
  getTranslations: async (ns: string) => {
    const messages: Record<string, Record<string, string>> = {
      calendar: { title: 'Calendário' },
      common: { matchCenter: 'Match Center' },
    };
    const section = messages[ns] ?? {};
    return (key: string) => section[key] ?? key;
  },
}));

import { MatchCalendar } from '@/components/site/match-calendar';

const content: any = { matches: [
  { id:'m1', comp:'pernambucano', competition:'Pernambucano', opponent:'Náutico', opponentShort:'NAU', isHome:true, status:{pt:'DOM 25 MAI · FINAL',en:'SUN MAY 25 · FINAL'}, scoreHome:2, scoreAway:0, matchCenterUrl:'#' },
  { id:'m2', comp:'nordeste', competition:'Nordeste', opponent:'Bahia', opponentShort:'BAH', isHome:true, status:{pt:'SÁB 17 MAI · FINAL',en:'SAT MAY 17 · FINAL'}, scoreHome:1, scoreAway:1, matchCenterUrl:'#' },
]};

describe('MatchCalendar', () => {
  it('renders one card per match with opponent name and score', async () => {
    const Component = await MatchCalendar({ content, locale: 'pt' });
    render(
      <NextIntlClientProvider locale="pt" messages={pt}>
        {Component}
      </NextIntlClientProvider>
    );
    expect(screen.getByText('Náutico')).toBeInTheDocument();
    expect(screen.getByText('Bahia')).toBeInTheDocument();
    // Santa is home in both → first row score is scoreHome=2 for m1
    expect(screen.getAllByText('Santa').length).toBe(2);
  });
});
