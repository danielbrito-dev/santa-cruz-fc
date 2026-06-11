'use client';

import { useState, useTransition } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';
import type { Draw, DrawCriteria } from '@/server/content/draw-store';
import { createDraw, deleteDraw, runDraw } from '@/server/content/draw-actions';

interface DraftState {
  title: string;
  prize: string;
  mode: 'inscricao' | 'filtro';
  prompt: string;
  city: string;
  state: string;
  censo: boolean;
  socio: string;
  phone: boolean;
}
const EMPTY: DraftState = { title: '', prize: '', mode: 'inscricao', prompt: '', city: '', state: '', censo: false, socio: '', phone: false };

export function SorteiosAdmin({ draws }: { draws: Draw[] }) {
  const t = useTranslations('admin');
  const locale = useLocale();
  const router = useRouter();
  const [isPending, start] = useTransition();
  const [msg, setMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [draft, setDraft] = useState<DraftState | null>(null);
  const [counts, setCounts] = useState<Record<number, string>>({});
  const [open, setOpen] = useState<number | null>(null);

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString(locale === 'en' ? 'en-US' : 'pt-BR', { dateStyle: 'short', timeStyle: 'short' });

  function save() {
    if (!draft) return;
    const criteria: DrawCriteria | undefined = draft.mode === 'filtro'
      ? {
          city: draft.city.trim() || undefined,
          state: draft.state.trim() || undefined,
          censo: draft.censo || undefined,
          socio: draft.socio || undefined,
          phone: draft.phone || undefined,
        }
      : undefined;
    start(async () => {
      const res = await createDraw({
        title: draft.title,
        prize: draft.prize,
        mode: draft.mode,
        prompt: draft.mode === 'inscricao' ? draft.prompt : undefined,
        criteria,
      });
      if (res.ok) { setDraft(null); setMsg({ kind: 'success', text: t('drawSaved') }); router.refresh(); }
      else setMsg({ kind: 'error', text: t('contentError') });
    });
  }

  function run(d: Draw) {
    const n = Number(counts[d.id] ?? '1');
    if (!Number.isFinite(n) || n < 1) return;
    if (!confirm(t('drawRunConfirm', { count: n, title: d.title }))) return;
    start(async () => {
      const res = await runDraw(d.id, n);
      if (res.ok) { setMsg({ kind: 'success', text: t('drawDone', { count: res.winners.length, pool: res.poolSize }) }); setOpen(d.id); router.refresh(); }
      else setMsg({ kind: 'error', text: res.error === 'empty-pool' ? t('drawEmptyPool') : t('contentError') });
    });
  }

  function remove(id: number) {
    if (!confirm(t('drawDeleteConfirm'))) return;
    start(async () => {
      const r = await deleteDraw(id);
      if (r.ok) router.refresh(); else setMsg({ kind: 'error', text: t('contentError') });
    });
  }

  return (
    <div className="admin-page admin-page--wide">
      <div className="admin-page-head admin-news-header">
        <div>
          <h1 className="admin-page-title">{t('sorteiosTitle')}</h1>
          <p className="admin-page-sub">{t('sorteiosDesc')}</p>
        </div>
        <button type="button" className="admin-btn admin-btn--primary" onClick={() => { setMsg(null); setDraft({ ...EMPTY }); }} disabled={isPending}>
          + {t('addDraw')}
        </button>
      </div>

      {msg && <div role={msg.kind === 'success' ? 'status' : 'alert'} className={`ce-status ce-status--${msg.kind}`}>{msg.text}</div>}

      {draft && (
        <div className="admin-card admin-jogos-form">
          <div className="admin-jogos-grid">
            <label className="admin-field admin-jogos-field--wide">
              <span className="admin-label">{t('fDrawTitle')}</span>
              <input className="admin-input" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder={t('fDrawTitlePh')} />
            </label>
            <label className="admin-field admin-jogos-field--wide">
              <span className="admin-label">{t('fDrawPrize')}</span>
              <input className="admin-input" value={draft.prize} onChange={(e) => setDraft({ ...draft, prize: e.target.value })} placeholder={t('fDrawPrizePh')} />
            </label>
            <label className="admin-field">
              <span className="admin-label">{t('fDrawMode')}</span>
              <select className="admin-input" value={draft.mode} onChange={(e) => setDraft({ ...draft, mode: e.target.value as DraftState['mode'] })}>
                <option value="inscricao">{t('modeInscricao')}</option>
                <option value="filtro">{t('modeFiltro')}</option>
              </select>
            </label>
            {draft.mode === 'inscricao' ? (
              <label className="admin-field admin-jogos-field--wide">
                <span className="admin-label">{t('fDrawPrompt')}</span>
                <input className="admin-input" value={draft.prompt} onChange={(e) => setDraft({ ...draft, prompt: e.target.value })} placeholder={t('fDrawPromptPh')} />
              </label>
            ) : (
              <>
                <label className="admin-field">
                  <span className="admin-label">{t('fDrawCity')}</span>
                  <input className="admin-input" value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} placeholder="Recife" />
                </label>
                <label className="admin-field">
                  <span className="admin-label">{t('fDrawState')}</span>
                  <input className="admin-input" value={draft.state} maxLength={2} onChange={(e) => setDraft({ ...draft, state: e.target.value.toUpperCase() })} placeholder="PE" />
                </label>
                <label className="admin-field">
                  <span className="admin-label">{t('fDrawSocio')}</span>
                  <select className="admin-input" value={draft.socio} onChange={(e) => setDraft({ ...draft, socio: e.target.value })}>
                    <option value="">{t('anyOption')}</option>
                    <option value="sim">{t('socioSim')}</option>
                    <option value="jafui">{t('socioJafui')}</option>
                    <option value="nao">{t('socioNao')}</option>
                  </select>
                </label>
                <label className="admin-field adm-draw-check">
                  <input type="checkbox" checked={draft.censo} onChange={(e) => setDraft({ ...draft, censo: e.target.checked })} />
                  <span className="admin-label">{t('fDrawCenso')}</span>
                </label>
                <label className="admin-field adm-draw-check">
                  <input type="checkbox" checked={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.checked })} />
                  <span className="admin-label">{t('fDrawPhone')}</span>
                </label>
              </>
            )}
          </div>
          <div className="admin-jogos-form-actions">
            <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => setDraft(null)} disabled={isPending}>{t('cancel')}</button>
            <button type="button" className="admin-btn admin-btn--primary admin-btn--sm" onClick={save} disabled={isPending || !draft.title.trim() || !draft.prize.trim()}>
              {isPending ? t('saving') : t('save')}
            </button>
          </div>
        </div>
      )}

      {draws.length === 0 ? (
        <p className="admin-jogos-hint">{t('noDraws')}</p>
      ) : (
        <ul className="admin-jogos-list">
          {draws.map((d) => (
            <li key={d.id} className="admin-jogos-row" style={{ gridTemplateColumns: '110px 1fr auto', alignItems: 'start' }}>
              <span className={`admin-badge ${d.status === 'sorteado' ? 'admin-badge--stat' : 'admin-badge--published'}`}>
                {d.status === 'sorteado' ? t('drawDrawn') : t('drawOpen')}
              </span>
              <span className="admin-jogos-teams">
                <strong>{d.title}</strong> <small>· 🏆 {d.prize}</small>
                <small style={{ display: 'block', opacity: .75 }}>
                  {d.mode === 'inscricao' ? t('entriesCount', { count: d.entries }) : t('modeFiltro')} · {fmtDate(d.createdAt)}
                  {d.status === 'sorteado' && d.poolSize !== null && <> · {t('poolOf', { count: d.poolSize })}</>}
                </small>
                {open === d.id && d.winners && (
                  <ol className="adm-draw-winners">
                    {d.winners.map((w, i) => (
                      <li key={w.fanId}>
                        <strong>{i + 1}.</strong> {w.name} <small>({w.email})</small>
                        {w.answer && <em className="adm-draw-answer">“{w.answer}”</em>}
                      </li>
                    ))}
                  </ol>
                )}
              </span>
              <span className="admin-jogos-actions">
                {d.status === 'aberto' ? (
                  <>
                    <input
                      className="admin-input adm-draw-count"
                      type="number" min={1} max={100}
                      value={counts[d.id] ?? '1'}
                      onChange={(e) => setCounts({ ...counts, [d.id]: e.target.value })}
                      aria-label={t('drawHowMany')}
                    />
                    <button type="button" className="admin-btn admin-btn--primary admin-btn--sm" onClick={() => run(d)} disabled={isPending}>
                      {t('runDraw')}
                    </button>
                  </>
                ) : (
                  <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => setOpen(open === d.id ? null : d.id)}>
                    {open === d.id ? t('msgCollapse') : t('seeWinners')}
                  </button>
                )}
                <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm admin-btn--danger" onClick={() => remove(d.id)} disabled={isPending}>
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
