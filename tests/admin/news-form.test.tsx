import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import pt from '@/messages/pt.json';
import type { NewsItem } from '@/server/content/types';
import type { NewsInput } from '@/server/content/news-ops';

// ── Mock navigation ───────────────────────────────────────────────────────────

const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock('@/lib/i18n/navigation', () => ({
  Link: ({
    href,
    children,
    ...rest
  }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={String(href)} {...rest}>
      {children}
    </a>
  ),
  usePathname: () => '/admin/noticias',
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

// ── Mock server actions ────────────────────────────────────────────────────────

type ActionResult = { ok: true } | { ok: false; error: string };

// Capture call args manually to avoid generic type complexity across vitest versions
let lastCreateArg: NewsInput | undefined;
let lastUpdateId: string | undefined;
let lastUpdateArg: NewsInput | undefined;

const mockCreateNews = vi.fn(async (): Promise<ActionResult> => ({ ok: true }));
const mockUpdateNews = vi.fn(async (): Promise<ActionResult> => ({ ok: true }));
const mockDeleteNews = vi.fn(async (): Promise<ActionResult> => ({ ok: true }));

vi.mock('@/server/content/news-actions', () => ({
  createNews: async (input: NewsInput): Promise<ActionResult> => {
    lastCreateArg = input;
    return mockCreateNews();
  },
  updateNews: async (id: string, input: NewsInput): Promise<ActionResult> => {
    lastUpdateId = id;
    lastUpdateArg = input;
    return mockUpdateNews();
  },
  deleteNews: async (id: string): Promise<ActionResult> => {
    return mockDeleteNews();
  },
}));

// ── Import component after mocks ──────────────────────────────────────────────

import { NewsForm } from '@/components/admin/news-form';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const existingItem: NewsItem = {
  id: 'noticia-abc123',
  slug: 'vitoria-sobre-sport',
  tag: { pt: 'Destaque', en: 'Featured' },
  title: { pt: 'Vitória sobre o Sport', en: 'Victory over Sport' },
  excerpt: { pt: 'Resumo da vitória.', en: 'Victory summary.' },
  body: { pt: 'Corpo da notícia.', en: 'Article body.' },
  coverImage: '/images/vitoria.jpg',
  photoCount: 5,
  publishedAt: '2026-05-15',
  featured: false,
  position: 0,
  status: 'published',
};

function renderForm(initial?: NewsItem) {
  return render(
    <NextIntlClientProvider locale="pt" messages={pt}>
      <NewsForm locale="pt" initial={initial} />
    </NextIntlClientProvider>,
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('NewsForm', () => {
  beforeEach(() => {
    lastCreateArg = undefined;
    lastUpdateId = undefined;
    lastUpdateArg = undefined;
    mockCreateNews.mockReset();
    mockUpdateNews.mockReset();
    mockDeleteNews.mockReset();
    mockPush.mockReset();
    mockRefresh.mockReset();
    mockCreateNews.mockResolvedValue({ ok: true });
    mockUpdateNews.mockResolvedValue({ ok: true });
    mockDeleteNews.mockResolvedValue({ ok: true });
  });

  // ── Create mode ─────────────────────────────────────────────────────────────

  it('renders the title field in create mode (PT active by default)', () => {
    renderForm();
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
  });

  it('renders the slug field', () => {
    renderForm();
    expect(screen.getByLabelText(/slug/i)).toBeInTheDocument();
  });

  it('renders the Salvar button', () => {
    renderForm();
    expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument();
  });

  it('renders the Cancelar link', () => {
    renderForm();
    const cancelLink = screen.getByRole('link', { name: /cancelar/i });
    expect(cancelLink).toBeInTheDocument();
  });

  it('shows required error when submitting empty form', async () => {
    renderForm();
    const saveBtn = screen.getByRole('button', { name: /salvar/i });
    await act(async () => {
      fireEvent.click(saveBtn);
    });
    const errors = screen.getAllByRole('alert');
    expect(errors.length).toBeGreaterThan(0);
    expect(mockCreateNews).not.toHaveBeenCalled();
  });

  it('auto-generates slug from PT title', () => {
    renderForm();
    const titleInput = screen.getByLabelText(/título/i);
    fireEvent.change(titleInput, { target: { value: 'Vitória sobre Sport' } });
    const slugInput = screen.getByLabelText(/slug/i) as HTMLInputElement;
    expect(slugInput.value).toBe('vitoria-sobre-sport');
  });

  it('calls createNews with filled title, slug, and status on valid submit', async () => {
    renderForm();

    const titleInput = screen.getByLabelText(/título/i);
    fireEvent.change(titleInput, { target: { value: 'Novo artigo' } });

    const slugInput = screen.getByLabelText(/slug/i) as HTMLInputElement;
    expect(slugInput.value).toBe('novo-artigo');

    const saveBtn = screen.getByRole('button', { name: /salvar/i });
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    await waitFor(() => {
      expect(mockCreateNews).toHaveBeenCalledTimes(1);
    });

    expect(lastCreateArg).toBeDefined();
    expect(lastCreateArg!.title.pt).toBe('Novo artigo');
    expect(lastCreateArg!.slug).toBe('novo-artigo');
    expect(lastCreateArg!.status).toBe('draft');
  });

  it('sets status to published when published button is clicked before submit', async () => {
    renderForm();

    const titleInput = screen.getByLabelText(/título/i);
    fireEvent.change(titleInput, { target: { value: 'Publicado já' } });

    const publishedBtn = screen.getByRole('button', { name: /publicado/i });
    fireEvent.click(publishedBtn);

    const saveBtn = screen.getByRole('button', { name: /salvar/i });
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    await waitFor(() => {
      expect(mockCreateNews).toHaveBeenCalledTimes(1);
    });

    expect(lastCreateArg).toBeDefined();
    expect(lastCreateArg!.status).toBe('published');
  });

  it('renders all three status segments: Rascunho, Publicado, Arquivado', () => {
    renderForm();
    expect(screen.getByRole('button', { name: /rascunho/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /publicado/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /arquivado/i })).toBeInTheDocument();
  });

  it('sets status to archived when arquivado button is clicked before submit', async () => {
    renderForm();

    const titleInput = screen.getByLabelText(/título/i);
    fireEvent.change(titleInput, { target: { value: 'Artigo arquivado' } });

    const archivedBtn = screen.getByRole('button', { name: /arquivado/i });
    fireEvent.click(archivedBtn);

    const saveBtn = screen.getByRole('button', { name: /salvar/i });
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    await waitFor(() => {
      expect(mockCreateNews).toHaveBeenCalledTimes(1);
    });

    expect(lastCreateArg).toBeDefined();
    expect(lastCreateArg!.status).toBe('archived');
  });

  // ── Edit mode ───────────────────────────────────────────────────────────────

  it('renders existing title in edit mode', () => {
    renderForm(existingItem);
    const titleInput = screen.getByDisplayValue('Vitória sobre o Sport');
    expect(titleInput).toBeInTheDocument();
  });

  it('calls updateNews with initial.id on submit in edit mode', async () => {
    renderForm(existingItem);

    const saveBtn = screen.getByRole('button', { name: /salvar/i });
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    await waitFor(() => {
      expect(mockUpdateNews).toHaveBeenCalledTimes(1);
    });

    expect(lastUpdateId).toBe('noticia-abc123');
    expect(lastUpdateArg).toBeDefined();
    expect(lastUpdateArg!.title.pt).toBe('Vitória sobre o Sport');
    expect(lastUpdateArg!.status).toBe('published');
  });

  it('shows the Excluir button in edit mode', () => {
    renderForm(existingItem);
    const deleteButtons = screen.getAllByRole('button', { name: /excluir/i });
    expect(deleteButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('shows success status and redirects after successful create', async () => {
    renderForm();

    const titleInput = screen.getByLabelText(/título/i);
    fireEvent.change(titleInput, { target: { value: 'Artigo teste' } });

    const saveBtn = screen.getByRole('button', { name: /salvar/i });
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
    expect(mockPush).toHaveBeenCalled();
  });

  it('shows error when createNews returns readonly error', async () => {
    mockCreateNews.mockResolvedValueOnce({ ok: false, error: 'readonly' });
    renderForm();

    const titleInput = screen.getByLabelText(/título/i);
    fireEvent.change(titleInput, { target: { value: 'Artigo' } });

    const saveBtn = screen.getByRole('button', { name: /salvar/i });
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/produção.*read-only/i)).toBeInTheDocument();
    });
  });

  // ── Language toggle ─────────────────────────────────────────────────────────

  it('renders PT | EN language toggle', () => {
    renderForm();
    expect(screen.getByRole('button', { name: /^PT$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^EN$/i })).toBeInTheDocument();
  });

  it('switches to EN title field when EN is clicked', () => {
    renderForm(existingItem);
    expect(screen.getByDisplayValue('Vitória sobre o Sport')).toBeInTheDocument();

    const enBtn = screen.getByRole('button', { name: /^EN$/i });
    fireEvent.click(enBtn);

    expect(screen.getByDisplayValue('Victory over Sport')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Vitória sobre o Sport')).toBeNull();
  });

  it('preserves both locales on submit (PT entered, then EN entered after toggling)', async () => {
    renderForm();
    // PT active by default
    fireEvent.change(screen.getByLabelText(/título/i), { target: { value: 'Título PT' } });
    // toggle to EN and fill the EN title
    fireEvent.click(screen.getByRole('button', { name: /^EN$/i }));
    fireEvent.change(screen.getByLabelText(/título/i), { target: { value: 'Title EN' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /salvar/i }));
    });

    await waitFor(() => {
      expect(mockCreateNews).toHaveBeenCalledTimes(1);
    });
    // the hidden PT locale must NOT be dropped when EN was the active tab at submit
    expect(lastCreateArg!.title.pt).toBe('Título PT');
    expect(lastCreateArg!.title.en).toBe('Title EN');
  });
});
