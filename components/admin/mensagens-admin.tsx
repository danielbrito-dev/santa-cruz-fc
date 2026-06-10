'use client';

import { useState, useTransition } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';
import type { FormSubmission } from '@/server/content/form-store';
import { setFormSubmissionRead, deleteFormSubmission } from '@/server/content/form-actions';

const PAGE_LABEL: Record<string, string> = {
  '/contato/fale-conosco': 'Fale Conosco',
  '/ajuda/contato': 'Contato (Ajuda)',
  '/contato/trabalhe-conosco': 'Trabalhe Conosco',
  '/contato/ouvidoria': 'Ouvidoria',
  '/ajuda/contato-imprensa': 'Contato Imprensa',
};
const labelOf = (page: string) => PAGE_LABEL[page] ?? page;

function errMsg(t: (k: string) => string, e: string) {
  return e === 'readonly' ? t('contentReadonly') : e === 'unauthorized' ? t('contentUnauthorized') : t('contentError');
}

export function MensagensAdmin({ submissions }: { submissions: FormSubmission[] }) {
  const t = useTranslations('admin');
  const locale = useLocale();
  const router = useRouter();
  const [isPending, start] = useTransition();
  const [msg, setMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [open, setOpen] = useState<number | null>(null);

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString(locale === 'en' ? 'en-US' : 'pt-BR', { dateStyle: 'short', timeStyle: 'short' });

  const toggleRead = (s: FormSubmission) => {
    start(async () => {
      const r = await setFormSubmissionRead(s.id, !s.read);
      if (r.ok) router.refresh();
      else setMsg({ kind: 'error', text: errMsg(t, r.error) });
    });
  };
  const remove = (id: number) => {
    if (!confirm(t('deleteConfirmMessage'))) return;
    start(async () => {
      const r = await deleteFormSubmission(id);
      if (r.ok) router.refresh();
      else setMsg({ kind: 'error', text: errMsg(t, r.error) });
    });
  };

  const unread = submissions.filter((s) => !s.read).length;

  return (
    <div className="admin-page admin-page--wide">
      <div className="admin-page-head">
        <h1 className="admin-page-title">{t('mensagensTitle')}</h1>
        <p className="admin-page-sub">
          {t('mensagensDesc')}
          {submissions.length > 0 && <> · {t('unreadCount', { count: unread })}</>}
        </p>
      </div>

      {msg && <div role="alert" className={`ce-status ce-status--${msg.kind}`}>{msg.text}</div>}

      {submissions.length === 0 ? (
        <p className="admin-jogos-hint">{t('noMessages')}</p>
      ) : (
        <ul className="admin-jogos-list">
          {submissions.map((s) => (
            <li key={s.id} className="admin-jogos-row" style={{ gridTemplateColumns: '110px 1fr auto', alignItems: 'start' }}>
              <span className={`admin-badge ${s.read ? 'admin-badge--stat' : 'admin-badge--published'}`}>
                {s.read ? t('msgRead') : t('msgUnread')}
              </span>
              <span className="admin-jogos-teams">
                <strong>{labelOf(s.page)}</strong> <small>· {fmtDate(s.createdAt)}</small>
                {open === s.id ? (
                  <dl className="admin-msg-data" style={{ margin: '8px 0 0', display: 'grid', gap: 4 }}>
                    {Object.entries(s.data).map(([k, v]) => (
                      <div key={k}>
                        <dt style={{ display: 'inline', fontWeight: 700, textTransform: 'capitalize' }}>{k}: </dt>
                        <dd style={{ display: 'inline', margin: 0, whiteSpace: 'pre-wrap' }}>{v}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <small style={{ display: 'block', opacity: 0.75 }}>
                    {Object.values(s.data).join(' · ').slice(0, 120)}
                  </small>
                )}
              </span>
              <span className="admin-jogos-actions">
                <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => setOpen(open === s.id ? null : s.id)} disabled={isPending}>
                  {open === s.id ? t('msgCollapse') : t('msgExpand')}
                </button>
                <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => toggleRead(s)} disabled={isPending}>
                  {s.read ? t('markUnread') : t('markRead')}
                </button>
                <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm admin-btn--danger" onClick={() => remove(s.id)} disabled={isPending}>
                  {t('delete')}
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
