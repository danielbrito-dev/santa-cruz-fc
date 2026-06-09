import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import pt from '@/messages/pt.json';
import type { SiteContent } from '@/server/content/types';

// ── Mock navigation ──────────────────────────────────────────────────────────
vi.mock('@/lib/i18n/navigation', () => ({
  Link: ({
    href,
    children,
    ...rest
  }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
  usePathname: () => '/admin/conteudo',
  useRouter: () => ({ replace: vi.fn() }),
}));

// ── Mock the server action so jsdom doesn't pull in next/headers ─────────────
// We capture the last call argument manually to avoid tuple-type issues.
let lastSaveArg: SiteContent | undefined;
const mockSaveContent = vi.fn(async (): Promise<{ ok: true } | { ok: false; error: string }> => ({ ok: true }));
vi.mock('@/server/content/actions', () => ({
  saveContent: async (content: SiteContent): Promise<{ ok: true } | { ok: false; error: string }> => {
    lastSaveArg = content;
    return mockSaveContent();
  },
}));

import { ContentEditor } from '@/components/admin/content-editor';

// ── Minimal valid SiteContent fixture ────────────────────────────────────────
const minimalContent: SiteContent = {
  hero: {
    titleLine1: { pt: 'Coral não', en: 'Coral never' },
    titleLine2: { pt: 'recua.', en: 'backs down.' },
    tagline: { pt: 'Coral não recua.', en: 'Coral never backs down.' },
    ctaLabel: { pt: 'Garantir ingresso', en: 'Get tickets' },
    ctaUrl: '#',
    backdrop: '/images/torcida1.jpg',
  },
  clubs: [],
  gallery: [],
  documents: [],
  stories: [],
  pages: [],
  matches: [
    {
      id: 'test-match',
      competition: 'Pernambucano',
      comp: 'pernambucano',
      opponent: 'Sport',
      opponentShort: 'SPT',
      isHome: true,
      status: { pt: 'SAB · 19h', en: 'SAT · 7PM' },
      scoreHome: null,
      scoreAway: null,
      matchCenterUrl: '#',
    },
  ],
  news: [
    {
      id: 'test-news',
      slug: 'test-news',
      tag: { pt: 'Destaque', en: 'Featured' },
      title: { pt: 'Notícia teste', en: 'Test news' },
      excerpt: { pt: '', en: '' },
      body: { pt: '', en: '' },
      coverImage: '/images/test.jpg',
      photoCount: 0,
      publishedAt: '2026-05-01T00:00:00',
      featured: true,
      position: 0,
      status: 'published' as const,
    },
  ],
  banners: [
    {
      id: 'banner-1',
      eyebrow: { pt: 'Sócio', en: 'Member' },
      title: { pt: 'Seja Sócio Coral', en: 'Become a Coral Member' },
      ctaLabel: { pt: 'Associe-se', en: 'Join now' },
      ctaUrl: '/socio',
      image: '/images/socio.jpg',
      size: 'span',
      position: 0,
    },
    {
      id: 'banner-2',
      eyebrow: { pt: 'Loja', en: 'Shop' },
      title: { pt: 'Loja Oficial', en: 'Official Shop' },
      ctaLabel: { pt: 'Comprar', en: 'Shop now' },
      ctaUrl: '/loja',
      image: '/images/loja.jpg',
      size: 'normal',
      position: 1,
    },
  ],
  institutional: [
    {
      id: 'inst-1',
      eyebrow: { pt: 'História', en: 'History' },
      title: { pt: 'Nossa História', en: 'Our History' },
      ctaLabel: { pt: 'Saiba mais', en: 'Learn more' },
      ctaUrl: '/historia',
      image: '/images/historia.jpg',
      size: 'span',
      position: 0,
    },
    {
      id: 'inst-2',
      eyebrow: { pt: 'Estádio', en: 'Stadium' },
      title: { pt: 'Arruda', en: 'Arruda' },
      ctaLabel: { pt: 'Conheça', en: 'Discover' },
      ctaUrl: '/arruda',
      image: '/images/arruda.jpg',
      size: 'normal',
      position: 1,
    },
  ],
  sponsors: [
    { id: 'sp1', name: 'Sponsor 1', logo: '/logos/sp1.png', url: '#', tier: 'master', position: 0 },
  ],
  social: [
    { id: 'tw', network: 'twitter', url: 'https://twitter.com/santacruz' },
  ],
  footer: {
    brandBlurb: { pt: 'Fundado em 1914.', en: 'Founded in 1914.' },
    columns: [
      {
        heading: { pt: 'Clube', en: 'Club' },
        links: [{ label: { pt: 'História', en: 'History' }, url: '/historia' }],
      },
    ],
    chantLine1: { pt: 'É tradição,', en: 'It is tradition,' },
    chantEmphasis: { pt: 'TRADIÇÃO', en: 'TRADITION' },
    chantLine2: { pt: 'não é moda.', en: "it's not a trend." },
  },
};

function renderEditor(initial = minimalContent) {
  return render(
    <NextIntlClientProvider locale="pt" messages={pt}>
      <ContentEditor initial={initial} />
    </NextIntlClientProvider>,
  );
}

describe('ContentEditor', () => {
  beforeEach(() => {
    lastSaveArg = undefined;
    mockSaveContent.mockReset();
    mockSaveContent.mockResolvedValue({ ok: true });
  });

  // ── New structure: PT is the default language, Hero is the default section.
  // The language toggle means each field shows ONE locale at a time.
  // The section switcher means only the active section's fields are visible.

  it('renders a hero PT field with the initial value (PT is default language, Hero is default section)', () => {
    renderEditor();
    // With PT active and Hero section active, the PT value of titleLine1 should be visible
    const ptInput = screen.getByDisplayValue('Coral não');
    expect(ptInput).toBeInTheDocument();
  });

  it('does NOT render the EN hero value when PT language is active', () => {
    renderEditor();
    // EN field is hidden when PT is active (one language at a time)
    const enInput = screen.queryByDisplayValue('Coral never');
    expect(enInput).toBeNull();
  });

  it('renders the EN hero value after switching to EN', () => {
    renderEditor();
    const enBtn = screen.getByRole('button', { name: /^EN$/i });
    fireEvent.click(enBtn);
    const enInput = screen.getByDisplayValue('Coral never');
    expect(enInput).toBeInTheDocument();
  });

  it('renders the Salvar button', () => {
    renderEditor();
    expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument();
  });

  it('editing a hero PT field changes its value', async () => {
    renderEditor();
    const ptInput = screen.getByDisplayValue('Coral não') as HTMLInputElement;
    fireEvent.change(ptInput, { target: { value: 'Novo título' } });
    expect(ptInput.value).toBe('Novo título');
  });

  it('calls saveContent with the edited hero block after Salvar is clicked', async () => {
    renderEditor();

    // Edit hero titleLine1 PT (PT is default, Hero is default section)
    const ptInput = screen.getByDisplayValue('Coral não');
    fireEvent.change(ptInput, { target: { value: 'Coral vence' } });

    const saveBtn = screen.getByRole('button', { name: /salvar/i });
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    await waitFor(() => {
      expect(mockSaveContent).toHaveBeenCalledTimes(1);
    });

    expect(lastSaveArg).toBeDefined();
    // Edited block changed
    expect(lastSaveArg!.hero.titleLine1.pt).toBe('Coral vence');
    // EN value preserved (was never touched)
    expect(lastSaveArg!.hero.titleLine1.en).toBe('Coral never');
  });

  it('preserves non-edited blocks (matches) on save', async () => {
    renderEditor();

    const saveBtn = screen.getByRole('button', { name: /salvar/i });
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    await waitFor(() => expect(mockSaveContent).toHaveBeenCalledTimes(1));

    expect(lastSaveArg).toBeDefined();
    // matches block must be preserved unchanged from initial
    expect(lastSaveArg!.matches).toEqual(minimalContent.matches);
    // news block must be preserved
    expect(lastSaveArg!.news).toEqual(minimalContent.news);
    // sponsors preserved
    expect(lastSaveArg!.sponsors).toEqual(minimalContent.sponsors);
    // footer.columns preserved
    expect(lastSaveArg!.footer.columns).toEqual(minimalContent.footer.columns);
  });

  it('shows success message after a successful save', async () => {
    renderEditor();

    const saveBtn = screen.getByRole('button', { name: /salvar/i });
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText(/conteúdo salvo/i)).toBeInTheDocument();
    });
  });

  it('shows error message when saveContent returns readonly error', async () => {
    mockSaveContent.mockResolvedValueOnce({ ok: false as const, error: 'readonly' });
    renderEditor();

    const saveBtn = screen.getByRole('button', { name: /salvar/i });
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/produção.*read-only/i)).toBeInTheDocument();
    });
  });

  it('shows unauthorized message when saveContent returns unauthorized', async () => {
    mockSaveContent.mockResolvedValueOnce({ ok: false as const, error: 'unauthorized' });
    renderEditor();

    const saveBtn = screen.getByRole('button', { name: /salvar/i });
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/sessão expirada/i)).toBeInTheDocument();
    });
  });

  // ── Live preview tests ──────────────────────────────────────────────────────

  it('renders a hero preview region in the Hero section', () => {
    renderEditor();
    // Hero section is the default — a preview with aria-label should be present
    expect(screen.getByLabelText(/pré-visualização do hero/i)).toBeInTheDocument();
  });

  it('hero preview reflects the initial titleLine1 value', () => {
    renderEditor();
    // The preview heading should contain the initial PT value
    const preview = screen.getByLabelText(/pré-visualização do hero/i);
    expect(preview.textContent).toContain('Coral não');
  });

  it('hero preview updates live when the user edits titleLine1', () => {
    renderEditor();
    const ptInput = screen.getByDisplayValue('Coral não') as HTMLInputElement;
    fireEvent.change(ptInput, { target: { value: 'Cobra Coral' } });
    const preview = screen.getByLabelText(/pré-visualização do hero/i);
    expect(preview.textContent).toContain('Cobra Coral');
  });

  it('hero preview shows "sem imagem" placeholder when backdrop is empty', () => {
    const contentWithEmptyBackdrop = {
      ...minimalContent,
      hero: { ...minimalContent.hero, backdrop: '' },
    };
    renderEditor(contentWithEmptyBackdrop);
    // The placeholder div renders the text "sem imagem"
    expect(screen.getByText(/sem imagem/i)).toBeInTheDocument();
  });

  it('banner preview is present for each banner when Banners section is active', () => {
    renderEditor();
    // Section tab label for banners in pt.json is "Banners"
    const bannersTab = screen.getByRole('button', { name: 'Banners' });
    fireEvent.click(bannersTab);
    // Two banners → two previews
    const previews = screen.getAllByLabelText(/pré-visualização do banner/i);
    expect(previews).toHaveLength(2);
  });

  it('institutional preview is present for each card when Institutional section is active', () => {
    renderEditor();
    // Section tab label for institutional in pt.json is "Institucional"
    const instTab = screen.getByRole('button', { name: 'Institucional' });
    fireEvent.click(instTab);
    const previews = screen.getAllByLabelText(/pré-visualização do card/i);
    expect(previews).toHaveLength(2);
  });

  it('footer preview is present when Footer section is active', () => {
    renderEditor();
    // Section tab label for footer in pt.json is "Rodapé"
    const footerTab = screen.getByRole('button', { name: 'Rodapé' });
    fireEvent.click(footerTab);
    expect(screen.getByLabelText(/pré-visualização do footer/i)).toBeInTheDocument();
  });

  it('footer preview reflects the chantEmphasis field live', () => {
    renderEditor();
    // Section tab label for footer in pt.json is "Rodapé"
    const footerTab = screen.getByRole('button', { name: 'Rodapé' });
    fireEvent.click(footerTab);
    const preview = screen.getByLabelText(/pré-visualização do footer/i);
    // Initial value
    expect(preview.textContent).toContain('TRADIÇÃO');
    // Edit the field
    const emphasisInput = screen.getByDisplayValue('TRADIÇÃO') as HTMLInputElement;
    fireEvent.change(emphasisInput, { target: { value: 'PAIXÃO' } });
    expect(preview.textContent).toContain('PAIXÃO');
  });
});
