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

import { Legal } from '@/components/site/pages/legal';
import type { LegalData } from '@/lib/site-pages';

const data: LegalData = {
  archetype: 'legal',
  updatedAt: '2026-06-08',
  sections: [{ heading: '1. Teste', paragraphs: ['Texto jurídico de teste.'] }],
};

describe('Legal', () => {
  it('renderiza título, data e seção', async () => {
    const C = await Legal({ sectionKey: 'ajuda', titleKey: 'privacidade', locale: 'pt', data });
    render(<NextIntlClientProvider locale="pt" messages={pt}>{C}</NextIntlClientProvider>);
    // heading aparece no índice (TOC) e na seção
    expect(screen.getAllByText('1. Teste').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Texto jurídico de teste.')).toBeInTheDocument();
    expect(screen.getByText(/Atualizado em/)).toBeInTheDocument();
  });
});
