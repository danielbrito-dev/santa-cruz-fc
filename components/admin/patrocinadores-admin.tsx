'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';
import type { Sponsor } from '@/server/content/types';
import { createSponsor, updateSponsor, deleteSponsor } from '@/server/content/sponsor-actions';
import { ImageUpload } from './image-upload';

type Tier = Sponsor['tier'];
const TIERS: Tier[] = ['master', 'fornecedor', 'apoio'];

interface Draft {
  id?: string;
  name: string;
  logo: string;
  url: string;
  tier: Tier;
}

function errMsg(t: (k: string) => string, e: string) {
  return e === 'readonly' ? t('contentReadonly') : e === 'unauthorized' ? t('contentUnauthorized') : t('contentError');
}

export function PatrocinadoresAdmin({ sponsors }: { sponsors: Sponsor[] }) {
  const t = useTranslations('admin');
  const router = useRouter();
  const [isPending, start] = useTransition();
  const [msg, setMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);

  const tierLabel = (tier: Tier) =>
    tier === 'master' ? t('tierMaster') : tier === 'fornecedor' ? t('tierFornecedor') : t('tierApoio');

  function newSponsor() {
    setMsg(null);
    setDraft({ name: '', logo: '', url: '', tier: 'apoio' });
  }
  function editSponsor(s: Sponsor) {
    setMsg(null);
    setDraft({ id: s.id, name: s.name, logo: s.logo, url: s.url, tier: s.tier });
  }
  function save() {
    if (!draft) return;
    const input = { name: draft.name.trim(), logo: draft.logo.trim(), url: draft.url.trim(), tier: draft.tier };
    start(async () => {
      const res = draft.id ? await updateSponsor(draft.id, input) : await createSponsor(input);
      if (res.ok) {
        setDraft(null);
        setMsg({ kind: 'success', text: t('sponsorSaved') });
        router.refresh();
      } else setMsg({ kind: 'error', text: errMsg(t, res.error) });
    });
  }
  function remove(id: string) {
    if (!confirm(t('deleteConfirm'))) return;
    start(async () => {
      const res = await deleteSponsor(id);
      if (res.ok) router.refresh();
      else setMsg({ kind: 'error', text: errMsg(t, res.error) });
    });
  }

  const ordered = [...sponsors].sort((a, b) => TIERS.indexOf(a.tier) - TIERS.indexOf(b.tier) || a.position - b.position);

  return (
    <div className="admin-page admin-page--wide">
      <div className="admin-page-head admin-news-header">
        <div>
          <h1 className="admin-page-title">{t('patrocinadores')}</h1>
          <p className="admin-page-sub">{t('patrocinadoresDesc')}</p>
        </div>
        <button type="button" className="admin-btn admin-btn--primary" onClick={newSponsor} disabled={isPending}>
          + {t('addSponsor')}
        </button>
      </div>

      {msg && (
        <div role={msg.kind === 'success' ? 'status' : 'alert'} className={`ce-status ce-status--${msg.kind}`}>
          {msg.text}
        </div>
      )}

      {draft && (
        <div className="admin-card admin-jogos-form">
          <div className="admin-jogos-grid">
            <label className="admin-field admin-jogos-field--wide">
              <span className="admin-label">{t('fSponsorName')}</span>
              <input className="admin-input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Ex.: Patrocinador Master" />
            </label>
            <label className="admin-field">
              <span className="admin-label">{t('fTier')}</span>
              <select className="admin-input" value={draft.tier} onChange={(e) => setDraft({ ...draft, tier: e.target.value as Tier })}>
                {TIERS.map((tr) => <option key={tr} value={tr}>{tierLabel(tr)}</option>)}
              </select>
            </label>
            <div className="admin-field admin-jogos-field--wide">
              <ImageUpload label={t('fLogo')} value={draft.logo} onChange={(v) => setDraft({ ...draft, logo: v })} folder="sponsors" />
            </div>
            <label className="admin-field admin-jogos-field--wide">
              <span className="admin-label">{t('fUrl')}</span>
              <input className="admin-input" value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} placeholder="https://…" />
            </label>
          </div>
          <div className="admin-jogos-form-actions">
            <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => setDraft(null)} disabled={isPending}>{t('cancel')}</button>
            <button type="button" className="admin-btn admin-btn--primary admin-btn--sm" onClick={save} disabled={isPending}>{isPending ? t('saving') : t('save')}</button>
          </div>
        </div>
      )}

      {ordered.length === 0 ? (
        <p className="admin-jogos-hint">{t('noSponsors')}</p>
      ) : (
        <ul className="admin-jogos-list">
          {ordered.map((s) => (
            <li key={s.id} className="admin-jogos-row" style={{ gridTemplateColumns: '130px 1fr auto' }}>
              <span className="admin-badge admin-badge--stat">{tierLabel(s.tier)}</span>
              <span className="admin-jogos-teams">
                <span className="admin-jogos-crest">
                  {s.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.logo} alt={s.name} />
                  ) : s.name.slice(0, 3)}
                </span>
                {s.name}
              </span>
              <span className="admin-jogos-actions">
                <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => editSponsor(s)} disabled={isPending}>{t('edit')}</button>
                <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm admin-btn--danger" onClick={() => remove(s.id)} disabled={isPending}>{t('delete')}</button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
