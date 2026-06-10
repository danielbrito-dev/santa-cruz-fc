'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';
import { ImageUpload } from './image-upload';
import type { MatchItem, Club } from '@/server/content/types';
import {
  createMatch,
  updateMatch,
  deleteMatch,
  upsertClub,
  deleteClub,
} from '@/server/content/match-actions';

type Comp = MatchItem['comp'];
const COMPS: Comp[] = ['serie-c', 'pernambucano', 'nordeste', 'copa-br'];
const COMP_LABEL: Record<Comp, string> = {
  pernambucano: 'Pernambucano',
  nordeste: 'Copa do Nordeste',
  'copa-br': 'Copa do Brasil',
  'serie-c': 'Série C',
};

interface MatchDraft {
  id?: string;
  comp: Comp;
  opponentShort: string;
  isHome: boolean;
  scoreHome: string;
  scoreAway: string;
  statusPt: string;
  statusEn: string;
  matchCenterUrl: string;
}
interface ClubDraft {
  id?: string;
  name: string;
  shortName: string;
  crestUrl: string;
}

function errMsg(t: (k: string) => string, e: string) {
  return e === 'readonly' ? t('contentReadonly') : e === 'unauthorized' ? t('contentUnauthorized') : t('contentError');
}

export function JogosAdmin({ matches, clubs }: { matches: MatchItem[]; clubs: Club[] }) {
  const t = useTranslations('admin');
  const router = useRouter();
  const [isPending, start] = useTransition();
  const [msg, setMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [matchDraft, setMatchDraft] = useState<MatchDraft | null>(null);
  const [clubDraft, setClubDraft] = useState<ClubDraft | null>(null);

  const crestByShort = new Map(clubs.map((c) => [c.shortName, c.crestUrl]));
  const opponents = clubs.filter((c) => c.shortName !== 'SAN');

  // ── matches ──────────────────────────────────────────────────────────────
  function newMatch() {
    setMsg(null);
    setMatchDraft({
      comp: 'pernambucano',
      opponentShort: opponents[0]?.shortName ?? '',
      isHome: true,
      scoreHome: '',
      scoreAway: '',
      statusPt: '',
      statusEn: '',
      matchCenterUrl: '#',
    });
  }
  function editMatch(m: MatchItem) {
    setMsg(null);
    setMatchDraft({
      id: m.id,
      comp: m.comp,
      opponentShort: m.opponentShort,
      isHome: m.isHome,
      scoreHome: m.scoreHome === null ? '' : String(m.scoreHome),
      scoreAway: m.scoreAway === null ? '' : String(m.scoreAway),
      statusPt: m.status.pt ?? '',
      statusEn: m.status.en ?? '',
      matchCenterUrl: m.matchCenterUrl || '#',
    });
  }
  function saveMatch() {
    if (!matchDraft) return;
    const club = opponents.find((c) => c.shortName === matchDraft.opponentShort);
    const num = (s: string) => (s.trim() === '' ? null : Number.parseInt(s, 10));
    const input = {
      comp: matchDraft.comp,
      opponent: club?.name ?? matchDraft.opponentShort,
      opponentShort: matchDraft.opponentShort,
      isHome: matchDraft.isHome,
      scoreHome: num(matchDraft.scoreHome),
      scoreAway: num(matchDraft.scoreAway),
      status: { pt: matchDraft.statusPt, en: matchDraft.statusEn || matchDraft.statusPt },
      matchCenterUrl: matchDraft.matchCenterUrl,
    };
    start(async () => {
      const res = matchDraft.id ? await updateMatch(matchDraft.id, input) : await createMatch(input);
      if (res.ok) {
        setMatchDraft(null);
        setMsg({ kind: 'success', text: t('matchSaved') });
        router.refresh();
      } else setMsg({ kind: 'error', text: errMsg(t, res.error) });
    });
  }
  function removeMatch(id: string) {
    if (!confirm(t('deleteConfirm'))) return;
    start(async () => {
      const res = await deleteMatch(id);
      if (res.ok) router.refresh();
      else setMsg({ kind: 'error', text: errMsg(t, res.error) });
    });
  }

  // ── clubs ────────────────────────────────────────────────────────────────
  function newClub() {
    setMsg(null);
    setClubDraft({ name: '', shortName: '', crestUrl: '' });
  }
  function editClub(c: Club) {
    setMsg(null);
    setClubDraft({ id: c.id, name: c.name, shortName: c.shortName, crestUrl: c.crestUrl ?? '' });
  }
  function saveClub() {
    if (!clubDraft) return;
    const input = {
      name: clubDraft.name.trim(),
      shortName: clubDraft.shortName.trim().toUpperCase(),
      crestUrl: clubDraft.crestUrl.trim() === '' ? null : clubDraft.crestUrl.trim(),
    };
    start(async () => {
      const res = await upsertClub(input, clubDraft.id);
      if (res.ok) {
        setClubDraft(null);
        setMsg({ kind: 'success', text: t('clubSaved') });
        router.refresh();
      } else setMsg({ kind: 'error', text: errMsg(t, res.error) });
    });
  }
  function removeClub(id: string) {
    if (!confirm(t('deleteConfirm'))) return;
    start(async () => {
      const res = await deleteClub(id);
      if (res.ok) router.refresh();
      else setMsg({ kind: 'error', text: errMsg(t, res.error) });
    });
  }

  return (
    <div className="admin-page admin-page--wide">
      <div className="admin-page-head">
        <h1 className="admin-page-title">{t('jogosTitle')}</h1>
        <p className="admin-page-sub">{t('jogosSub')}</p>
      </div>

      {msg && (
        <div role={msg.kind === 'success' ? 'status' : 'alert'} className={`ce-status ce-status--${msg.kind}`}>
          {msg.text}
        </div>
      )}

      {/* ══ PARTIDAS ══ */}
      <section className="admin-jogos-section">
        <div className="admin-jogos-head">
          <h2 className="admin-jogos-h2">{t('matchesHeading')}</h2>
          <button type="button" className="admin-btn admin-btn--primary admin-btn--sm" onClick={newMatch} disabled={isPending || opponents.length === 0}>
            + {t('addMatch')}
          </button>
        </div>
        {opponents.length === 0 && <p className="admin-jogos-hint">{t('noClubsHint')}</p>}

        {matchDraft && (
          <div className="admin-card admin-jogos-form">
            <div className="admin-jogos-grid">
              <label className="admin-field">
                <span className="admin-label">{t('fComp')}</span>
                <select className="admin-input" value={matchDraft.comp} onChange={(e) => setMatchDraft({ ...matchDraft, comp: e.target.value as Comp })}>
                  {COMPS.map((c) => <option key={c} value={c}>{COMP_LABEL[c]}</option>)}
                </select>
              </label>
              <label className="admin-field">
                <span className="admin-label">{t('fOpponent')}</span>
                <select className="admin-input" value={matchDraft.opponentShort} onChange={(e) => setMatchDraft({ ...matchDraft, opponentShort: e.target.value })}>
                  {opponents.map((c) => <option key={c.id} value={c.shortName}>{c.name} ({c.shortName})</option>)}
                </select>
              </label>
              <label className="admin-field">
                <span className="admin-label">{t('fMando')}</span>
                <select className="admin-input" value={matchDraft.isHome ? 'home' : 'away'} onChange={(e) => setMatchDraft({ ...matchDraft, isHome: e.target.value === 'home' })}>
                  <option value="home">{t('mandoHome')}</option>
                  <option value="away">{t('mandoAway')}</option>
                </select>
              </label>
              <label className="admin-field">
                <span className="admin-label">{t('fScoreHome')}</span>
                <input className="admin-input" type="number" min={0} value={matchDraft.scoreHome} onChange={(e) => setMatchDraft({ ...matchDraft, scoreHome: e.target.value })} placeholder="—" />
              </label>
              <label className="admin-field">
                <span className="admin-label">{t('fScoreAway')}</span>
                <input className="admin-input" type="number" min={0} value={matchDraft.scoreAway} onChange={(e) => setMatchDraft({ ...matchDraft, scoreAway: e.target.value })} placeholder="—" />
              </label>
              <label className="admin-field">
                <span className="admin-label">{t('fStatusPt')}</span>
                <input className="admin-input" value={matchDraft.statusPt} onChange={(e) => setMatchDraft({ ...matchDraft, statusPt: e.target.value })} placeholder="DOM 25 MAI · FINAL" />
              </label>
              <label className="admin-field">
                <span className="admin-label">{t('fStatusEn')}</span>
                <input className="admin-input" value={matchDraft.statusEn} onChange={(e) => setMatchDraft({ ...matchDraft, statusEn: e.target.value })} placeholder="SUN MAY 25 · FINAL" />
              </label>
              <label className="admin-field admin-jogos-field--wide">
                <span className="admin-label">{t('fMatchUrl')}</span>
                <input className="admin-input" type="url" value={matchDraft.matchCenterUrl === '#' ? '' : matchDraft.matchCenterUrl} onChange={(e) => setMatchDraft({ ...matchDraft, matchCenterUrl: e.target.value.trim() || '#' })} placeholder="https://…" />
              </label>
            </div>
            <div className="admin-jogos-form-actions">
              <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => setMatchDraft(null)} disabled={isPending}>{t('cancel')}</button>
              <button type="button" className="admin-btn admin-btn--primary admin-btn--sm" onClick={saveMatch} disabled={isPending}>{isPending ? t('saving') : t('save')}</button>
            </div>
          </div>
        )}

        {matches.length === 0 ? (
          <p className="admin-jogos-hint">{t('noMatches')}</p>
        ) : (
          <ul className="admin-jogos-list">
            {matches.map((m) => {
              const crest = crestByShort.get(m.opponentShort) ?? null;
              const score = m.scoreHome !== null && m.scoreAway !== null ? `${m.scoreHome} – ${m.scoreAway}` : '—';
              return (
                <li key={m.id} className="admin-jogos-row">
                  <span className="admin-badge admin-badge--stat">{COMP_LABEL[m.comp]}</span>
                  <span className="admin-jogos-teams">
                    <span className="admin-jogos-crest">
                      {crest ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={crest} alt={m.opponent} />
                      ) : m.opponentShort}
                    </span>
                    {m.isHome ? `Santa × ${m.opponent}` : `${m.opponent} × Santa`}
                  </span>
                  <span className="admin-jogos-score">{score}</span>
                  <span className="admin-jogos-actions">
                    <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => editMatch(m)} disabled={isPending}>{t('edit')}</button>
                    <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm admin-btn--danger" onClick={() => removeMatch(m.id)} disabled={isPending}>{t('delete')}</button>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ══ CLUBES ══ */}
      <section className="admin-jogos-section">
        <div className="admin-jogos-head">
          <h2 className="admin-jogos-h2">{t('clubsHeading')}</h2>
          <button type="button" className="admin-btn admin-btn--primary admin-btn--sm" onClick={newClub} disabled={isPending}>+ {t('addClub')}</button>
        </div>

        {clubDraft && (
          <div className="admin-card admin-jogos-form">
            <div className="admin-jogos-grid">
              <label className="admin-field">
                <span className="admin-label">{t('fClubName')}</span>
                <input className="admin-input" value={clubDraft.name} onChange={(e) => setClubDraft({ ...clubDraft, name: e.target.value })} placeholder="Sport" />
              </label>
              <label className="admin-field">
                <span className="admin-label">{t('fShortName')}</span>
                <input className="admin-input" value={clubDraft.shortName} onChange={(e) => setClubDraft({ ...clubDraft, shortName: e.target.value })} placeholder="SPO" maxLength={4} />
              </label>
              <div className="admin-field admin-jogos-field--wide">
                <ImageUpload label={t('fCrestUrl')} value={clubDraft.crestUrl} onChange={(v) => setClubDraft({ ...clubDraft, crestUrl: v })} folder="escudos" />
              </div>
            </div>
            <div className="admin-jogos-form-actions">
              <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => setClubDraft(null)} disabled={isPending}>{t('cancel')}</button>
              <button type="button" className="admin-btn admin-btn--primary admin-btn--sm" onClick={saveClub} disabled={isPending}>{isPending ? t('saving') : t('save')}</button>
            </div>
          </div>
        )}

        {clubs.length === 0 ? (
          <p className="admin-jogos-hint">{t('noClubs')}</p>
        ) : (
          <ul className="admin-jogos-list">
            {clubs.map((c) => (
              <li key={c.id} className="admin-jogos-row">
                <span className="admin-jogos-crest">
                  {c.crestUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.crestUrl} alt={c.name} />
                  ) : c.shortName}
                </span>
                <span className="admin-jogos-teams">{c.name} <small>({c.shortName})</small></span>
                <span className="admin-jogos-score admin-jogos-url">{c.crestUrl ? '✓' : '—'}</span>
                <span className="admin-jogos-actions">
                  <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => editClub(c)} disabled={isPending}>{t('edit')}</button>
                  <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm admin-btn--danger" onClick={() => removeClub(c.id)} disabled={isPending || c.shortName === 'SAN'}>{t('delete')}</button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
