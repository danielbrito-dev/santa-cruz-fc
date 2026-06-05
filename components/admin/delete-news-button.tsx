'use client';

import { useTransition } from 'react';
import { useRouter } from '@/lib/i18n/navigation';
import { deleteNews } from '@/server/content/news-actions';

interface DeleteNewsButtonProps {
  id: string;
  label: string;
  confirmMsg: string;
}

export function DeleteNewsButton({ id, label, confirmMsg }: DeleteNewsButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(confirmMsg)) return;
    startTransition(async () => {
      const res = await deleteNews(id);
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
      className="admin-btn admin-btn--ghost admin-btn--sm admin-btn--danger"
      onClick={handleDelete}
      disabled={isPending}
      aria-disabled={isPending}
    >
      {isPending ? '…' : label}
    </button>
  );
}
