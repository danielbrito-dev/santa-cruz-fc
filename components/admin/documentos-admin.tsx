'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';
import type { DocItem } from '@/server/content/types';
import { createDoc, updateDoc, deleteDoc } from '@/server/content/site-extras-actions';

const PAGES: { value: string; label: string }[] = [
  { value: 'transparencia', label: 'Transparência' },
  { value: 'estatuto', label: 'Estatuto' },
  { value: 'documentos', label: 'Documentos' },
  { value: 'relatorios', label: 'Relatórios' },
  { value: 'guia-da-partida', label: 'Guia da Partida' },
  { value: 'press-kit', label: 'Press Kit' },
  { value: 'conteudo-imprensa', label: 'Conteúdo p/ Imprensa' },
];
const labelOf = (v: string) => PAGES.find((p) => p.value === v)?.label ?? v;

interface Draft { id?: string; page: string; title: string; kind: string; meta: string; href: string; }
function errMsg(t: (k: string) => string, e: string) {
  return e === 'readonly' ? t('contentReadonly') : e === 'unauthorized' ? t('contentUnauthorized') : t('contentError');
}

export function DocumentosAdmin({ documents }: { documents: DocItem[] }) {
  const t = useTranslations('admin');
  const router = useRouter();
  const [isPending, start] = useTransition();
  const [msg, setMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);

  const save = () => {
    if (!draft) return;
    const input = { page: draft.page, title: draft.title.trim(), kind: draft.kind.trim() || 'PDF', meta: draft.meta.trim(), href: draft.href.trim() || '#' };
    start(async () => {
      const res = draft.id ? await updateDoc(draft.id, input) : await createDoc(input);
      if (res.ok) { setDraft(null); setMsg({ kind: 'success', text: t('docSaved') }); router.refresh(); }
      else setMsg({ kind: 'error', text: errMsg(t, res.error) });
    });
  };
  const remove = (id: string) => {
    if (!confirm(t('deleteConfirm'))) return;
    start(async () => { const r = await deleteDoc(id); if (r.ok) router.refresh(); else setMsg({ kind: 'error', text: errMsg(t, r.error) }); });
  };

  return (
    <div className="admin-page admin-page--wide">
      <div className="admin-page-head admin-news-header">
        <div><h1 className="admin-page-title">{t('documentos')}</h1><p className="admin-page-sub">{t('documentosDesc')}</p></div>
        <button type="button" className="admin-btn admin-btn--primary" onClick={() => { setMsg(null); setDraft({ page: PAGES[0].value, title: '', kind: 'PDF', meta: '', href: '#' }); }} disabled={isPending}>+ {t('addDoc')}</button>
      </div>
      {msg && <div role={msg.kind === 'success' ? 'status' : 'alert'} className={`ce-status ce-status--${msg.kind}`}>{msg.text}</div>}

      {draft && (
        <div className="admin-card admin-jogos-form">
          <div className="admin-jogos-grid">
            <label className="admin-field"><span className="admin-label">{t('fDocPage')}</span>
              <select className="admin-input" value={draft.page} onChange={(e) => setDraft({ ...draft, page: e.target.value })}>
                {PAGES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select></label>
            <label className="admin-field admin-jogos-field--wide"><span className="admin-label">{t('fDocTitle')}</span>
              <input className="admin-input" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></label>
            <label className="admin-field"><span className="admin-label">{t('fDocKind')}</span>
              <input className="admin-input" value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value })} placeholder="PDF" /></label>
            <label className="admin-field"><span className="admin-label">{t('fDocMeta')}</span>
              <input className="admin-input" value={draft.meta} onChange={(e) => setDraft({ ...draft, meta: e.target.value })} placeholder="2025" /></label>
            <label className="admin-field admin-jogos-field--wide"><span className="admin-label">{t('fDocHref')}</span>
              <input className="admin-input" value={draft.href} onChange={(e) => setDraft({ ...draft, href: e.target.value })} placeholder="#" /></label>
          </div>
          <div className="admin-jogos-form-actions">
            <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => setDraft(null)} disabled={isPending}>{t('cancel')}</button>
            <button type="button" className="admin-btn admin-btn--primary admin-btn--sm" onClick={save} disabled={isPending}>{isPending ? t('saving') : t('save')}</button>
          </div>
        </div>
      )}

      {documents.length === 0 ? <p className="admin-jogos-hint">{t('noDocs')}</p> : (
        PAGES.filter((pg) => documents.some((d) => d.page === pg.value)).map((pg) => (
          <div key={pg.value} className="admin-elenco-group">
            <h3 className="admin-elenco-group-title">{pg.label}</h3>
            <ul className="admin-jogos-list">
              {documents.filter((d) => d.page === pg.value).map((d) => (
                <li key={d.id} className="admin-jogos-row" style={{ gridTemplateColumns: '64px 1fr auto' }}>
                  <span className="admin-badge admin-badge--published">{d.kind}</span>
                  <span className="admin-jogos-teams">{d.title}{d.meta ? <small> · {d.meta}</small> : null}</span>
                  <span className="admin-jogos-actions">
                    <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => { setMsg(null); setDraft({ id: d.id, page: d.page, title: d.title, kind: d.kind, meta: d.meta, href: d.href }); }} disabled={isPending}>{t('edit')}</button>
                    <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm admin-btn--danger" onClick={() => remove(d.id)} disabled={isPending}>{t('delete')}</button>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
