import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import pt from '@/messages/pt.json';

// ── Mock navigation ────────────────────────────────────────────────────────────

const mockRefresh = vi.fn();

vi.mock('@/lib/i18n/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

// ── Mock server actions ────────────────────────────────────────────────────────

type ActionResult = { ok: true } | { ok: false; error: string };

const mockArchiveNews = vi.fn(async (_id: string): Promise<ActionResult> => ({ ok: true }));
const mockRestoreNews = vi.fn(async (_id: string): Promise<ActionResult> => ({ ok: true }));

vi.mock('@/server/content/news-actions', () => ({
  archiveNews: async (id: string): Promise<ActionResult> => mockArchiveNews(id),
  restoreNews: async (id: string): Promise<ActionResult> => mockRestoreNews(id),
}));

// ── Import after mocks ──────────────────────────────────────────────────────────

import { ArchiveNewsButton } from '@/components/admin/archive-news-button';

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ArchiveNewsButton', () => {
  beforeEach(() => {
    mockArchiveNews.mockReset();
    mockRestoreNews.mockReset();
    mockRefresh.mockReset();
    mockArchiveNews.mockResolvedValue({ ok: true });
    mockRestoreNews.mockResolvedValue({ ok: true });
  });

  it('shows "Arquivar" label when item is not archived', () => {
    render(
      <NextIntlClientProvider locale="pt" messages={pt}>
        <ArchiveNewsButton id="abc" isArchived={false} labelArchive="Arquivar" labelRestore="Restaurar" />
      </NextIntlClientProvider>,
    );
    expect(screen.getByRole('button', { name: /arquivar/i })).toBeInTheDocument();
  });

  it('shows "Restaurar" label when item is archived', () => {
    render(
      <NextIntlClientProvider locale="pt" messages={pt}>
        <ArchiveNewsButton id="abc" isArchived={true} labelArchive="Arquivar" labelRestore="Restaurar" />
      </NextIntlClientProvider>,
    );
    expect(screen.getByRole('button', { name: /restaurar/i })).toBeInTheDocument();
  });

  it('calls archiveNews with the correct id when clicking Arquivar', async () => {
    render(
      <NextIntlClientProvider locale="pt" messages={pt}>
        <ArchiveNewsButton id="news-123" isArchived={false} labelArchive="Arquivar" labelRestore="Restaurar" />
      </NextIntlClientProvider>,
    );
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /arquivar/i }));
    });
    await waitFor(() => {
      expect(mockArchiveNews).toHaveBeenCalledWith('news-123');
    });
  });

  it('calls restoreNews with the correct id when clicking Restaurar', async () => {
    render(
      <NextIntlClientProvider locale="pt" messages={pt}>
        <ArchiveNewsButton id="news-456" isArchived={true} labelArchive="Arquivar" labelRestore="Restaurar" />
      </NextIntlClientProvider>,
    );
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /restaurar/i }));
    });
    await waitFor(() => {
      expect(mockRestoreNews).toHaveBeenCalledWith('news-456');
    });
  });

  it('refreshes router after successful archive', async () => {
    render(
      <NextIntlClientProvider locale="pt" messages={pt}>
        <ArchiveNewsButton id="news-789" isArchived={false} labelArchive="Arquivar" labelRestore="Restaurar" />
      </NextIntlClientProvider>,
    );
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /arquivar/i }));
    });
    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled();
    });
  });
});
