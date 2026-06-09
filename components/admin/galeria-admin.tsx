'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';
import type { GalleryImage } from '@/server/content/types';
import { createImage, updateImage, deleteImage } from '@/server/content/site-extras-actions';

interface Draft { id?: string; src: string; alt: string; }
function errMsg(t: (k: string) => string, e: string) {
  return e === 'readonly' ? t('contentReadonly') : e === 'unauthorized' ? t('contentUnauthorized') : t('contentError');
}

export function GaleriaAdmin({ images }: { images: GalleryImage[] }) {
  const t = useTranslations('admin');
  const router = useRouter();
  const [isPending, start] = useTransition();
  const [msg, setMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);

  const save = () => {
    if (!draft) return;
    const input = { src: draft.src.trim(), alt: draft.alt.trim() };
    start(async () => {
      const res = draft.id ? await updateImage(draft.id, input) : await createImage(input);
      if (res.ok) { setDraft(null); setMsg({ kind: 'success', text: t('imageSaved') }); router.refresh(); }
      else setMsg({ kind: 'error', text: errMsg(t, res.error) });
    });
  };
  const remove = (id: string) => {
    if (!confirm(t('deleteConfirm'))) return;
    start(async () => { const r = await deleteImage(id); if (r.ok) router.refresh(); else setMsg({ kind: 'error', text: errMsg(t, r.error) }); });
  };

  return (
    <div className="admin-page admin-page--wide">
      <div className="admin-page-head admin-news-header">
        <div><h1 className="admin-page-title">{t('galeria')}</h1><p className="admin-page-sub">{t('galeriaDesc')}</p></div>
        <button type="button" className="admin-btn admin-btn--primary" onClick={() => { setMsg(null); setDraft({ src: '', alt: '' }); }} disabled={isPending}>+ {t('addImage')}</button>
      </div>
      {msg && <div role={msg.kind === 'success' ? 'status' : 'alert'} className={`ce-status ce-status--${msg.kind}`}>{msg.text}</div>}

      {draft && (
        <div className="admin-card admin-jogos-form">
          <div className="admin-jogos-grid">
            <label className="admin-field admin-jogos-field--wide"><span className="admin-label">{t('fSrc')}</span>
              <input className="admin-input" value={draft.src} onChange={(e) => setDraft({ ...draft, src: e.target.value })} placeholder="/images/…" /></label>
            <label className="admin-field admin-jogos-field--wide"><span className="admin-label">{t('fAlt')}</span>
              <input className="admin-input" value={draft.alt} onChange={(e) => setDraft({ ...draft, alt: e.target.value })} /></label>
            <div className="admin-jogos-crest admin-jogos-crest--preview" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {draft.src.trim() ? <img src={draft.src} alt="" /> : '🖼'}
            </div>
          </div>
          <div className="admin-jogos-form-actions">
            <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => setDraft(null)} disabled={isPending}>{t('cancel')}</button>
            <button type="button" className="admin-btn admin-btn--primary admin-btn--sm" onClick={save} disabled={isPending}>{isPending ? t('saving') : t('save')}</button>
          </div>
        </div>
      )}

      {images.length === 0 ? <p className="admin-jogos-hint">{t('noImages')}</p> : (
        <ul className="admin-jogos-list">
          {images.map((g) => (
            <li key={g.id} className="admin-jogos-row" style={{ gridTemplateColumns: '56px 1fr auto' }}>
              <span className="admin-jogos-crest" style={{ borderRadius: 6 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {g.src ? <img src={g.src} alt={g.alt} /> : '—'}
              </span>
              <span className="admin-jogos-teams">{g.alt}</span>
              <span className="admin-jogos-actions">
                <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => { setMsg(null); setDraft({ id: g.id, src: g.src, alt: g.alt }); }} disabled={isPending}>{t('edit')}</button>
                <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm admin-btn--danger" onClick={() => remove(g.id)} disabled={isPending}>{t('delete')}</button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
