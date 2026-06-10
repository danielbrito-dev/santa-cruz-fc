'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';
import { inviteUserAction, updateUserAction, setActiveAction, setPasswordAction, deleteUserAction } from '@/server/auth/user-actions';

type Role = 'admin' | 'editor';
export interface UserRow {
  id: string;
  email: string;
  name: string;
  role: Role;
  active: boolean;
  isRoot: boolean;
  createdAt?: string;
}

export function UsuariosAdmin({ users, currentUserId }: { users: UserRow[]; currentUserId: string }) {
  const t = useTranslations('admin');
  const router = useRouter();
  const [isPending, start] = useTransition();
  const [msg, setMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [inviting, setInviting] = useState(false);
  const [form, setForm] = useState({ email: '', name: '', role: 'editor' as Role });

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, ok: string) {
    start(async () => {
      const res = await fn();
      if (res.ok) {
        setMsg({ kind: 'success', text: ok });
        router.refresh();
      } else {
        setMsg({ kind: 'error', text: t('userError', { code: res.error ?? '' }) });
      }
    });
  }

  function invite() {
    run(() => inviteUserAction(form), t('inviteSent'));
    setInviting(false);
    setForm({ email: '', name: '', role: 'editor' });
  }

  return (
    <div className="admin-page admin-page--wide">
      <div className="admin-page-head">
        <h1 className="admin-page-title">{t('users')}</h1>
        <p className="admin-page-sub">{t('usersDesc')}</p>
      </div>
      {msg && <div role={msg.kind === 'success' ? 'status' : 'alert'} className={`ce-status ce-status--${msg.kind}`}>{msg.text}</div>}

      <div className="admin-toolbar">
        <button type="button" className="admin-btn admin-btn--primary admin-btn--sm" onClick={() => setInviting((v) => !v)}>
          {inviting ? t('cancel') : `+ ${t('inviteUser')}`}
        </button>
      </div>

      {inviting && (
        <div className="admin-card admin-jogos-form">
          <p className="admin-news-section-label">{t('inviteHint')}</p>
          <div className="admin-jogos-form-grid">
            <div className="admin-field"><span className="admin-label">{t('fEmail')}</span>
              <input className="admin-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="admin-field"><span className="admin-label">{t('fName')}</span>
              <input className="admin-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="admin-field"><span className="admin-label">{t('fRole')}</span>
              <select className="admin-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
                <option value="editor">{t('roleEditor')}</option>
                <option value="admin">{t('roleAdmin')}</option>
              </select></div>
          </div>
          <div className="admin-jogos-form-actions">
            <button type="button" className="admin-btn admin-btn--primary admin-btn--sm" onClick={invite} disabled={isPending || !form.email || !form.name}>
              {isPending ? t('saving') : t('sendInvite')}
            </button>
          </div>
        </div>
      )}

      <ul className="admin-jogos-list">
        {users.map((u) => (
          <UserRowItem key={u.id} u={u} isSelf={u.id === currentUserId} disabled={isPending}
            onSaveRole={(role) => run(() => updateUserAction(u.id, { role }), t('userUpdated'))}
            onSaveName={(name) => run(() => updateUserAction(u.id, { name }), t('userUpdated'))}
            onToggleActive={() => run(() => setActiveAction(u.id, !u.active), u.active ? t('userDeactivated') : t('userActivated'))}
            onResetPw={(pw) => run(() => setPasswordAction(u.id, pw), t('passwordReset'))}
            onDelete={() => run(() => deleteUserAction(u.id), t('userDeleted'))}
          />
        ))}
      </ul>
    </div>
  );
}

function UserRowItem({
  u, isSelf, disabled, onSaveRole, onSaveName, onToggleActive, onResetPw, onDelete,
}: {
  u: UserRow; isSelf: boolean; disabled: boolean;
  onSaveRole: (r: Role) => void; onSaveName: (n: string) => void; onToggleActive: () => void; onResetPw: (p: string) => void; onDelete: () => void;
}) {
  const t = useTranslations('admin');
  const [name, setName] = useState(u.name);
  const [pw, setPw] = useState('');

  return (
    <li className="admin-jogos-row" style={{ gridTemplateColumns: '1fr auto', alignItems: 'center', opacity: u.active ? 1 : 0.6 }}>
      <div style={{ display: 'grid', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input className="admin-input" style={{ maxWidth: 200 }} value={name} onChange={(e) => setName(e.target.value)} onBlur={() => name !== u.name && name && onSaveName(name)} />
          <span style={{ color: 'var(--muted)', fontSize: 13 }}>{u.email}</span>
          {u.isRoot && <span className="admin-badge admin-badge--published">root</span>}
          {isSelf && <span className="admin-badge admin-badge--stat">{t('youBadge')}</span>}
          {!u.active && <span className="admin-badge admin-badge--soon">{t('statusInactive')}</span>}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <select className="admin-input" style={{ maxWidth: 130 }} value={u.role} disabled={disabled || isSelf} onChange={(e) => onSaveRole(e.target.value as Role)}>
            <option value="editor">{t('roleEditor')}</option>
            <option value="admin">{t('roleAdmin')}</option>
          </select>
          <input className="admin-input" style={{ maxWidth: 180 }} type="text" value={pw} onChange={(e) => setPw(e.target.value)} placeholder={t('newPasswordHint')} />
          <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" disabled={disabled || pw.length < 8} onClick={() => { onResetPw(pw); setPw(''); }}>{t('resetPassword')}</button>
        </div>
      </div>
      <span className="admin-jogos-actions" style={{ display: 'flex', gap: 6 }}>
        <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" disabled={disabled || isSelf} onClick={onToggleActive}>
          {u.active ? t('deactivate') : t('activate')}
        </button>
        <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm admin-btn--danger" disabled={disabled || isSelf || u.isRoot} onClick={() => { if (confirm(t('confirmDeleteUser'))) onDelete(); }}>{t('delete')}</button>
      </span>
    </li>
  );
}
