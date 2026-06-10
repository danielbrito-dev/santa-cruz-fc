'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';

export function DefinirSenha() {
  const t = useTranslations('setPassword');
  const [phase, setPhase] = useState<'checking' | 'ready' | 'invalid' | 'done'>('checking');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const sb = supabaseBrowser();
    let settled = false;
    const finish = (ok: boolean) => {
      if (!settled) {
        settled = true;
        setPhase(ok ? 'ready' : 'invalid');
      }
    };
    sb.auth.getSession().then(({ data }) => {
      if (data.session) finish(true);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => {
      if (session) finish(true);
    });
    const tm = setTimeout(() => sb.auth.getSession().then(({ data }) => finish(!!data.session)), 1200);
    return () => {
      clearTimeout(tm);
      sub.subscription.unsubscribe();
    };
  }, []);

  async function submit() {
    if (pw.length < 8) return setErr(t('tooShort'));
    if (pw !== pw2) return setErr(t('mismatch'));
    setBusy(true);
    setErr(null);
    const { error } = await supabaseBrowser().auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return setErr(error.message);
    await supabaseBrowser().auth.signOut();
    setPhase('done');
  }

  return (
    <main className="login-page">
      <div className="login-accent-strip" aria-hidden="true" />
      <div className="login-card">
        <div className="login-crest-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.png" alt="Santa Cruz FC" className="login-crest" width={72} height={72} />
        </div>
        <hgroup className="login-hgroup">
          <h1 className="login-title">{t('title')}</h1>
          <p className="login-subtitle">
            {phase === 'checking' ? t('checking') : phase === 'invalid' ? t('invalid') : phase === 'done' ? t('done') : t('subtitle')}
          </p>
        </hgroup>

        {phase === 'ready' && (
          <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="login-fields-form">
            <div className="login-field">
              <label htmlFor="np" className="login-label">{t('password')}</label>
              <input id="np" className="login-input" type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" required />
            </div>
            <div className="login-field">
              <label htmlFor="np2" className="login-label">{t('confirm')}</label>
              <input id="np2" className="login-input" type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" required />
            </div>
            {err && <span className="login-field-error" role="alert">{err}</span>}
            <button type="submit" className="login-submit-btn" disabled={busy}>{busy ? t('saving') : t('save')}</button>
          </form>
        )}

        {(phase === 'invalid' || phase === 'done') && (
          <Link href="/entrar" className="login-submit-btn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
            {t('toLogin')}
          </Link>
        )}
      </div>
    </main>
  );
}
