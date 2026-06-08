import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import pt from '@/messages/pt.json';

vi.mock('next-intl/server', () => ({
  getTranslations: async (ns: string) => {
    const m = pt as unknown as Record<string, Record<string, string>>;
    const s = m[ns] ?? {};
    return (key: string) => s[key] ?? key;
  },
}));

import { Faq } from '@/components/site/pages/faq';
import type { FaqData } from '@/lib/site-pages';

const data: FaqData = {
  archetype: 'faq',
  intro: 'Intro de teste.',
  items: [{ q: 'Pergunta um?', a: 'Resposta um.' }],
};

describe('Faq', () => {
  it('renderiza intro, pergunta e resposta', async () => {
    const C = await Faq({ sectionKey: 'ajuda', titleKey: 'ajuda', locale: 'pt', data });
    render(<NextIntlClientProvider locale="pt" messages={pt}>{C}</NextIntlClientProvider>);
    expect(screen.getByText('Intro de teste.')).toBeInTheDocument();
    expect(screen.getByText('Pergunta um?')).toBeInTheDocument();
    expect(screen.getByText('Resposta um.')).toBeInTheDocument();
  });
});
