'use client';

import { useTransition } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, useRouter } from '@/lib/i18n/navigation';
import { invalidateFanMe } from '@/lib/fan-me';
import type { FanNotification } from '@/server/notify/notifications';
import { markAllNotificationsRead, markNotificationRead } from '@/server/notify/notification-actions';

const ICON: Record<string, string> = { 'draw-open': '🎟️', 'draw-won': '🏆', info: '📣' };

/** Painel de notificações do dashboard do torcedor. */
export function FanNotifications({ items }: { items: FanNotification[] }) {
  const t = useTranslations('fanNotif');
  const locale = useLocale();
  const router = useRouter();
  const [isPending, start] = useTransition();
  const unread = items.filter((n) => !n.read).length;

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString(locale === 'en' ? 'en-US' : 'pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  function readAll() {
    start(async () => {
      await markAllNotificationsRead();
      invalidateFanMe();
      router.refresh();
    });
  }

  function clickItem(n: FanNotification) {
    if (!n.read) {
      start(async () => {
        await markNotificationRead(n.id);
        invalidateFanMe();
        router.refresh();
      });
    }
  }

  if (items.length === 0) return null;

  return (
    <section className="fnt" aria-label={t('title')}>
      <header className="fnt-head">
        <h2 className="fnt-title">
          {t('title')}
          {unread > 0 && <span className="fnt-count">{unread}</span>}
        </h2>
        {unread > 0 && (
          <button type="button" className="fnt-readall" onClick={readAll} disabled={isPending}>
            {t('markAll')}
          </button>
        )}
      </header>
      <ul className="fnt-list">
        {items.map((n) => {
          const inner = (
            <>
              <span className="fnt-icon" aria-hidden="true">{ICON[n.type] ?? ICON.info}</span>
              <span className="fnt-body">
                <strong>{n.title}</strong>
                {n.body && <small>{n.body}</small>}
                <time dateTime={n.createdAt}>{fmtDate(n.createdAt)}</time>
              </span>
              {!n.read && <span className="fnt-dot" aria-label={t('unread')} />}
            </>
          );
          return (
            <li key={n.id} className={`fnt-item${n.read ? '' : ' is-unread'}`}>
              {n.href ? (
                <Link href={n.href} className="fnt-link" onClick={() => clickItem(n)}>{inner}</Link>
              ) : (
                <button type="button" className="fnt-link" onClick={() => clickItem(n)}>{inner}</button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
