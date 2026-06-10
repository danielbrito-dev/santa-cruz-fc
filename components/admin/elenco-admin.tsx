'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';
import { ImageUpload } from './image-upload';
import { GROUP_ORDER } from '@/server/squad/squad';
import type { Player, StaffMember, PositionGroupKey } from '@/server/squad/squad';
import {
  createPlayer,
  updatePlayer,
  deletePlayer,
  upsertStaff,
  deleteStaff,
} from '@/server/squad/squad-actions';

interface PlayerDraft {
  orig?: number; // número original (modo edição)
  number: string;
  name: string;
  group: PositionGroupKey;
  age: string;
  birthDate: string;
  country: string;
  photo: string;
  jogos: string;
  gols: string;
  assist: string;
}
interface StaffDraft {
  index?: number;
  rolePt: string;
  roleEn: string;
  name: string;
}

function errMsg(t: (k: string) => string, e: string) {
  return e === 'readonly' ? t('contentReadonly') : e === 'unauthorized' ? t('contentUnauthorized') : t('contentError');
}
const num = (s: string) => (s.trim() === '' ? undefined : Number.parseInt(s, 10));

export function ElencoAdmin({ players, staff }: { players: Player[]; staff: StaffMember[] }) {
  const t = useTranslations('admin');
  const ts = useTranslations('squad');
  const router = useRouter();
  const [isPending, start] = useTransition();
  const [msg, setMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [pd, setPd] = useState<PlayerDraft | null>(null);
  const [sd, setSd] = useState<StaffDraft | null>(null);

  // ── jogadores ──────────────────────────────────────────────────────────────
  function newPlayer() {
    setMsg(null); setSd(null);
    setPd({ number: '', name: '', group: 'goleiros', age: '', birthDate: '', country: 'BRA', photo: '', jogos: '', gols: '', assist: '' });
  }
  function editPlayer(p: Player) {
    setMsg(null); setSd(null);
    setPd({
      orig: p.number, number: String(p.number), name: p.name, group: p.group,
      age: p.age != null ? String(p.age) : '', birthDate: p.birthDate ?? '', country: p.country, photo: p.photo,
      jogos: p.stats ? String(p.stats.jogos) : '', gols: p.stats ? String(p.stats.gols) : '', assist: p.stats ? String(p.stats.assist) : '',
    });
  }
  function savePlayer() {
    if (!pd) return;
    const n = num(pd.number);
    if (n == null) { setMsg({ kind: 'error', text: t('errRequired') }); return; }
    const j = num(pd.jogos), g = num(pd.gols), a = num(pd.assist);
    const input = {
      number: n, name: pd.name.trim(), group: pd.group, country: pd.country.trim() || 'BRA', photo: pd.photo.trim(),
      age: num(pd.age),
      birthDate: pd.birthDate.trim() || undefined,
      stats: j != null ? { jogos: j, gols: g ?? 0, assist: a ?? 0 } : undefined,
    };
    start(async () => {
      const res = pd.orig != null ? await updatePlayer(pd.orig, input) : await createPlayer(input);
      if (res.ok) { setPd(null); setMsg({ kind: 'success', text: t('playerSaved') }); router.refresh(); }
      else setMsg({ kind: 'error', text: errMsg(t, res.error) });
    });
  }
  function removePlayer(n: number) {
    if (!confirm(t('deleteConfirm'))) return;
    start(async () => {
      const res = await deletePlayer(n);
      if (res.ok) router.refresh(); else setMsg({ kind: 'error', text: errMsg(t, res.error) });
    });
  }

  // ── comissão técnica ─────────────────────────────────────────────────────────
  function newStaff() { setMsg(null); setPd(null); setSd({ rolePt: '', roleEn: '', name: '' }); }
  function editStaff(m: StaffMember, index: number) {
    setMsg(null); setPd(null);
    setSd({ index, rolePt: m.role.pt, roleEn: m.role.en, name: m.name });
  }
  function saveStaff() {
    if (!sd) return;
    const input = { rolePt: sd.rolePt.trim(), roleEn: sd.roleEn.trim() || sd.rolePt.trim(), name: sd.name.trim() };
    start(async () => {
      const res = await upsertStaff(input, sd.index);
      if (res.ok) { setSd(null); setMsg({ kind: 'success', text: t('staffSaved') }); router.refresh(); }
      else setMsg({ kind: 'error', text: errMsg(t, res.error) });
    });
  }
  function removeStaff(index: number) {
    if (!confirm(t('deleteConfirm'))) return;
    start(async () => {
      const res = await deleteStaff(index);
      if (res.ok) router.refresh(); else setMsg({ kind: 'error', text: errMsg(t, res.error) });
    });
  }

  return (
    <div className="admin-page admin-page--wide">
      <div className="admin-page-head">
        <h1 className="admin-page-title">{t('elenco')}</h1>
        <p className="admin-page-sub">{t('elencoDesc')}</p>
      </div>

      {msg && (
        <div role={msg.kind === 'success' ? 'status' : 'alert'} className={`ce-status ce-status--${msg.kind}`}>{msg.text}</div>
      )}

      {/* ══ JOGADORES ══ */}
      <section className="admin-jogos-section">
        <div className="admin-jogos-head">
          <h2 className="admin-jogos-h2">{ts('athletes')}</h2>
          <button type="button" className="admin-btn admin-btn--primary admin-btn--sm" onClick={newPlayer} disabled={isPending}>+ {t('addPlayer')}</button>
        </div>

        {pd && (
          <div className="admin-card admin-jogos-form">
            <div className="admin-jogos-grid">
              <label className="admin-field"><span className="admin-label">{t('fNumber')}</span>
                <input className="admin-input" type="number" value={pd.number} onChange={(e) => setPd({ ...pd, number: e.target.value })} /></label>
              <label className="admin-field admin-jogos-field--wide"><span className="admin-label">{t('fName')}</span>
                <input className="admin-input" value={pd.name} onChange={(e) => setPd({ ...pd, name: e.target.value })} /></label>
              <label className="admin-field"><span className="admin-label">{t('fGroup')}</span>
                <select className="admin-input" value={pd.group} onChange={(e) => setPd({ ...pd, group: e.target.value as PositionGroupKey })}>
                  {GROUP_ORDER.map((g) => <option key={g} value={g}>{ts(g)}</option>)}
                </select></label>
              <label className="admin-field"><span className="admin-label">{ts('lblAge')}</span>
                <input className="admin-input" type="number" value={pd.age} onChange={(e) => setPd({ ...pd, age: e.target.value })} /></label>
              <label className="admin-field"><span className="admin-label">{ts('lblBirth')}</span>
                <input className="admin-input" value={pd.birthDate} onChange={(e) => setPd({ ...pd, birthDate: e.target.value })} placeholder="DD/MM/AAAA" /></label>
              <label className="admin-field"><span className="admin-label">{ts('lblNationality')}</span>
                <input className="admin-input" value={pd.country} onChange={(e) => setPd({ ...pd, country: e.target.value })} placeholder="BRA" /></label>
              <div className="admin-field admin-jogos-field--wide">
                <ImageUpload label={t('fPhoto')} value={pd.photo} onChange={(v) => setPd({ ...pd, photo: v })} folder="atletas" />
              </div>
              <label className="admin-field"><span className="admin-label">{ts('lblGames')}</span>
                <input className="admin-input" type="number" value={pd.jogos} onChange={(e) => setPd({ ...pd, jogos: e.target.value })} /></label>
              <label className="admin-field"><span className="admin-label">{ts('lblGoals')}</span>
                <input className="admin-input" type="number" value={pd.gols} onChange={(e) => setPd({ ...pd, gols: e.target.value })} /></label>
              <label className="admin-field"><span className="admin-label">{ts('lblAssists')}</span>
                <input className="admin-input" type="number" value={pd.assist} onChange={(e) => setPd({ ...pd, assist: e.target.value })} /></label>
            </div>
            <div className="admin-jogos-form-actions">
              <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => setPd(null)} disabled={isPending}>{t('cancel')}</button>
              <button type="button" className="admin-btn admin-btn--primary admin-btn--sm" onClick={savePlayer} disabled={isPending}>{isPending ? t('saving') : t('save')}</button>
            </div>
          </div>
        )}

        {GROUP_ORDER.filter((g) => players.some((p) => p.group === g)).map((g) => (
          <div key={g} className="admin-elenco-group">
            <h3 className="admin-elenco-group-title">{ts(g)}</h3>
            <ul className="admin-jogos-list">
              {players.filter((p) => p.group === g).sort((a, b) => a.number - b.number).map((p) => (
                <li key={p.number} className="admin-jogos-row" style={{ gridTemplateColumns: '44px 1fr auto' }}>
                  <span className="admin-jogos-score">{p.number}</span>
                  <span className="admin-jogos-teams">
                    <span className="admin-jogos-crest" style={{ borderRadius: '50%' }}>
                      {p.thumb || p.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.thumb ?? p.photo} alt={p.name} />
                      ) : p.name.slice(0, 2)}
                    </span>
                    {p.name}
                  </span>
                  <span className="admin-jogos-actions">
                    <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => editPlayer(p)} disabled={isPending}>{t('edit')}</button>
                    <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm admin-btn--danger" onClick={() => removePlayer(p.number)} disabled={isPending}>{t('delete')}</button>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {players.length === 0 && <p className="admin-jogos-hint">{t('noPlayers')}</p>}
      </section>

      {/* ══ COMISSÃO TÉCNICA ══ */}
      <section className="admin-jogos-section">
        <div className="admin-jogos-head">
          <h2 className="admin-jogos-h2">{ts('staffHeading')}</h2>
          <button type="button" className="admin-btn admin-btn--primary admin-btn--sm" onClick={newStaff} disabled={isPending}>+ {t('addStaff')}</button>
        </div>

        {sd && (
          <div className="admin-card admin-jogos-form">
            <div className="admin-jogos-grid">
              <label className="admin-field admin-jogos-field--wide"><span className="admin-label">{t('fStaffName')}</span>
                <input className="admin-input" value={sd.name} onChange={(e) => setSd({ ...sd, name: e.target.value })} /></label>
              <label className="admin-field"><span className="admin-label">{t('fRolePt')}</span>
                <input className="admin-input" value={sd.rolePt} onChange={(e) => setSd({ ...sd, rolePt: e.target.value })} placeholder="Técnico" /></label>
              <label className="admin-field"><span className="admin-label">{t('fRoleEn')}</span>
                <input className="admin-input" value={sd.roleEn} onChange={(e) => setSd({ ...sd, roleEn: e.target.value })} placeholder="Head Coach" /></label>
            </div>
            <div className="admin-jogos-form-actions">
              <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => setSd(null)} disabled={isPending}>{t('cancel')}</button>
              <button type="button" className="admin-btn admin-btn--primary admin-btn--sm" onClick={saveStaff} disabled={isPending}>{isPending ? t('saving') : t('save')}</button>
            </div>
          </div>
        )}

        {staff.length === 0 ? (
          <p className="admin-jogos-hint">—</p>
        ) : (
          <ul className="admin-jogos-list">
            {staff.map((m, i) => (
              <li key={i} className="admin-jogos-row" style={{ gridTemplateColumns: '160px 1fr auto' }}>
                <span className="admin-badge admin-badge--stat">{m.role.pt}</span>
                <span className="admin-jogos-teams">{m.name}</span>
                <span className="admin-jogos-actions">
                  <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => editStaff(m, i)} disabled={isPending}>{t('edit')}</button>
                  <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm admin-btn--danger" onClick={() => removeStaff(i)} disabled={isPending}>{t('delete')}</button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
