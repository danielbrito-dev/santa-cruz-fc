import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import pt from '@/messages/pt.json';

vi.mock('next-intl/server', () => ({
  getTranslations: async () => (key: string) => key,
}));

import { Editorial } from '@/components/site/pages/editorial';
import type { EditorialData } from '@/lib/site-pages';

const data: EditorialData = {
  archetype: 'editorial',
  lead: 'Lead de teste.',
  sections: [{ heading: 'Seção Um', paragraphs: ['Parágrafo A.', 'Parágrafo B.'] }],
  quote: { text: 'Citação coral.', cite: 'Torcida' },
};

describe('Editorial', () => {
  it('renderiza título, lead, seção e citação', async () => {
    const C = await Editorial({ sectionKey: 'oSanta', titleKey: 'historia', locale: 'pt', data });
    render(<NextIntlClientProvider locale="pt" messages={pt}>{C}</NextIntlClientProvider>);
    expect(screen.getByText('Lead de teste.')).toBeInTheDocument();
    expect(screen.getByText('Seção Um')).toBeInTheDocument();
    expect(screen.getByText('Parágrafo A.')).toBeInTheDocument();
    expect(screen.getByText(/Citação coral/)).toBeInTheDocument();
  });
});
