'use client';

import { useTransition } from 'react';
import { useRouter } from '@/lib/i18n/navigation';
import { archiveNews, restoreNews } from '@/server/content/news-actions';

interface ArchiveNewsButtonProps {
  id: string;
  isArchived: boolean;
  labelArchive: string;
  labelRestore: string;
}

export function ArchiveNewsButton({
  id,
  isArchived,
  labelArchive,
  labelRestore,
}: ArchiveNewsButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const res = isArchived ? await restoreNews(id) : await archiveNews(id);
      if (res.ok) {
        router.refresh();
      } else {
        alert(res.error);
      }
    });
  }

  return (
    <button
      type="button"
      className="admin-btn admin-btn--ghost admin-btn--sm admin-btn--archive"
      onClick={handleClick}
      disabled={isPending}
      aria-disabled={isPending}
    >
      {isPending ? '…' : isArchived ? labelRestore : labelArchive}
    </button>
  );
}
