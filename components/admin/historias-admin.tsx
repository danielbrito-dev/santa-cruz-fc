'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';
import type { StoryItem } from '@/server/content/types';
import { createStory, updateStory, deleteStory } from '@/server/content/site-extras-actions';

type Status = StoryItem['status'];
interface Draft { id?: string; author: string; city: string; generation: string; excerpt: string; featured: boolean; status: Status; }
function errMsg(t: (k: string) => string, e: string) {
  return e === 'readonly' ? t('contentReadonly') : e === 'unauthorized' ? t('contentUnauthorized') : t('contentError');
}

export function HistoriasAdmin({ stories }: { stories: StoryItem[] }) {
  const t = useTranslations('admin');
  const router = useRouter();
  const [isPending, start] = useTransition();
  const [msg, setMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);

  const blank: Draft = { author: '', city: '', generation: '', excerpt: '', featured: false, status: 'pending' };
  const save = () => {
    if (!draft) return;
    const input = {
      author: draft.author.trim(), city: draft.city.trim(), generation: draft.generation.trim(),
      excerpt: draft.excerpt.trim(), featured: draft.featured, status: draft.status,
    };
    start(async () => {
      const res = draft.id ? await updateStory(draft.id, input) : await createStory(input);
      if (res.ok) { setDraft(null); setMsg({ kind: 'success', text: t('storySaved') }); router.refresh(); }
      else setMsg({ kind: 'error', text: errMsg(t, res.error) });
    });
  };
  const remove = (id: string) => {
    if (!confirm(t('deleteConfirm'))) return;
    start(async () => { const r = await deleteStory(id); if (r.ok) router.refresh(); else setMsg({ kind: 'error', text: errMsg(t, r.error) }); });
  };

  const pending = stories.filter((s) => s.status === 'pending');
  const published = stories.filter((s) => s.status === 'published');

  const row = (s: StoryItem) => (
    <li key={s.id} className="admin-jogos-row" style={{ gridTemplateColumns: '110px 1fr auto' }}>
      <span className={`admin-badge ${s.status === 'published' ? 'admin-badge--published' : 'admin-badge--draft'}`}>
        {s.status === 'published' ? t('statusPublished') : t('statusPending')}
      </span>
      <span className="admin-jogos-teams" style={{ display: 'block' }}>
        <strong>{s.author}</strong> {s.featured ? '★' : ''}<br />
        <small style={{ color: 'var(--muted)' }}>{s.city} · {s.generation} — “{s.excerpt.slice(0, 70)}{s.excerpt.length > 70 ? '…' : ''}”</small>
      </span>
      <span className="admin-jogos-actions">
        <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => { setMsg(null); setDraft({ id: s.id, author: s.author, city: s.city, generation: s.generation, excerpt: s.excerpt, featured: s.featured, status: s.status }); }} disabled={isPending}>{t('edit')}</button>
        <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm admin-btn--danger" onClick={() => remove(s.id)} disabled={isPending}>{t('delete')}</button>
      </span>
    </li>
  );

  return (
    <div className="admin-page admin-page--wide">
      <div className="admin-page-head admin-news-header">
        <div><h1 className="admin-page-title">{t('historias')}</h1><p className="admin-page-sub">{t('historiasDesc')}</p></div>
        <button type="button" className="admin-btn admin-btn--primary" onClick={() => { setMsg(null); setDraft({ ...blank }); }} disabled={isPending}>+ {t('addStory')}</button>
      </div>
      {msg && <div role={msg.kind === 'success' ? 'status' : 'alert'} className={`ce-status ce-status--${msg.kind}`}>{msg.text}</div>}

      {draft && (
        <div className="admin-card admin-jogos-form">
          <div className="admin-jogos-grid">
            <label className="admin-field"><span className="admin-label">{t('fAuthor')}</span>
              <input className="admin-input" value={draft.author} onChange={(e) => setDraft({ ...draft, author: e.target.value })} /></label>
            <label className="admin-field"><span className="admin-label">{t('fCity')}</span>
              <input className="admin-input" value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} placeholder="Recife · PE" /></label>
            <label className="admin-field"><span className="admin-label">{t('fGeneration')}</span>
              <input className="admin-input" value={draft.generation} onChange={(e) => setDraft({ ...draft, generation: e.target.value })} placeholder="Anos 90" /></label>
            <label className="admin-field"><span className="admin-label">{t('fStatus')}</span>
              <select className="admin-input" value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as Status })}>
                <option value="pending">{t('statusPending')}</option>
                <option value="published">{t('statusPublished')}</option>
              </select></label>
            <label className="admin-field admin-jogos-field--wide" style={{ gridColumn: '1 / -1' }}><span className="admin-label">{t('fExcerpt')}</span>
              <textarea className="admin-input" rows={3} value={draft.excerpt} onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })} /></label>
            <label className="admin-field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={draft.featured} onChange={(e) => setDraft({ ...draft, featured: e.target.checked })} />
              <span className="admin-label" style={{ marginBottom: 0 }}>{t('featured')}</span>
            </label>
          </div>
          <div className="admin-jogos-form-actions">
            <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => setDraft(null)} disabled={isPending}>{t('cancel')}</button>
            <button type="button" className="admin-btn admin-btn--primary admin-btn--sm" onClick={save} disabled={isPending}>{isPending ? t('saving') : t('save')}</button>
          </div>
        </div>
      )}

      {stories.length === 0 ? <p className="admin-jogos-hint">{t('noStories')}</p> : (
        <>
          {pending.length > 0 && (
            <div className="admin-elenco-group">
              <h3 className="admin-elenco-group-title">{t('statusPending')} ({pending.length})</h3>
              <ul className="admin-jogos-list">{pending.map(row)}</ul>
            </div>
          )}
          <div className="admin-elenco-group">
            <h3 className="admin-elenco-group-title">{t('statusPublished')} ({published.length})</h3>
            <ul className="admin-jogos-list">{published.map(row)}</ul>
          </div>
        </>
      )}
    </div>
  );
}
