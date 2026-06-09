'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';
import { savePage } from '@/server/content/page-actions';

export interface EditablePage {
  href: string;
  title: string;
  lead: string;
  sections: { heading: string; paragraphs: string[] }[];
}
interface SectionDraft { heading: string; body: string } // body = parágrafos separados por linha em branco
interface Draft { href: string; title: string; lead: string; sections: SectionDraft[] }

function errMsg(t: (k: string) => string, e: string) {
  return e === 'readonly' ? t('contentReadonly') : e === 'unauthorized' ? t('contentUnauthorized') : t('contentError');
}

export function PaginasAdmin({ pages }: { pages: EditablePage[] }) {
  const t = useTranslations('admin');
  const router = useRouter();
  const [isPending, start] = useTransition();
  const [msg, setMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);

  function open(p: EditablePage) {
    setMsg(null);
    setDraft({
      href: p.href, title: p.title, lead: p.lead,
      sections: p.sections.map((s) => ({ heading: s.heading, body: s.paragraphs.join('\n\n') })),
    });
  }
  function save() {
    if (!draft) return;
    const input = {
      href: draft.href, title: draft.title, lead: draft.lead.trim(),
      sections: draft.sections
        .filter((s) => s.heading.trim() || s.body.trim())
        .map((s) => ({ heading: s.heading.trim(), paragraphs: s.body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean) })),
    };
    start(async () => {
      const res = await savePage(input);
      if (res.ok) { setDraft(null); setMsg({ kind: 'success', text: t('pageSaved') }); router.refresh(); }
      else setMsg({ kind: 'error', text: errMsg(t, res.error) });
    });
  }
  const setSection = (i: number, patch: Partial<SectionDraft>) =>
    setDraft((d) => (d ? { ...d, sections: d.sections.map((s, j) => (j === i ? { ...s, ...patch } : s)) } : d));

  return (
    <div className="admin-page admin-page--wide">
      <div className="admin-page-head">
        <h1 className="admin-page-title">{t('paginas')}</h1>
        <p className="admin-page-sub">{t('paginasDesc')}</p>
      </div>
      {msg && <div role={msg.kind === 'success' ? 'status' : 'alert'} className={`ce-status ce-status--${msg.kind}`}>{msg.text}</div>}

      {!draft ? (
        <ul className="admin-jogos-list">
          {pages.map((p) => (
            <li key={p.href} className="admin-jogos-row" style={{ gridTemplateColumns: '1fr auto' }}>
              <span className="admin-jogos-teams" style={{ display: 'block' }}>
                <strong>{p.title}</strong><br /><small style={{ color: 'var(--muted)' }}>{p.href}</small>
              </span>
              <span className="admin-jogos-actions">
                <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => open(p)}>{t('edit')}</button>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="admin-card admin-jogos-form">
          <p className="admin-news-section-label">{draft.title}</p>
          <div className="admin-field"><span className="admin-label">{t('fLead')}</span>
            <textarea className="admin-input" rows={3} value={draft.lead} onChange={(e) => setDraft({ ...draft, lead: e.target.value })} /></div>

          {draft.sections.map((s, i) => (
            <div key={i} className="admin-card" style={{ padding: 16 }}>
              <div className="admin-field"><span className="admin-label">{t('fHeading')}</span>
                <input className="admin-input" value={s.heading} onChange={(e) => setSection(i, { heading: e.target.value })} /></div>
              <div className="admin-field"><span className="admin-label">{t('fParagraphs')}</span>
                <textarea className="admin-input" rows={5} value={s.body} onChange={(e) => setSection(i, { body: e.target.value })} /></div>
              <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm admin-btn--danger" onClick={() => setDraft({ ...draft, sections: draft.sections.filter((_, j) => j !== i) })}>{t('removeSection')}</button>
            </div>
          ))}
          <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => setDraft({ ...draft, sections: [...draft.sections, { heading: '', body: '' }] })}>+ {t('addSection')}</button>

          <div className="admin-jogos-form-actions">
            <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => setDraft(null)} disabled={isPending}>{t('cancel')}</button>
            <button type="button" className="admin-btn admin-btn--primary admin-btn--sm" onClick={save} disabled={isPending}>{isPending ? t('saving') : t('save')}</button>
          </div>
        </div>
      )}
    </div>
  );
}
