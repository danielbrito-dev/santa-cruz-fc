'use client';

import { useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { fanLoginAction, fanSignupAction } from '@/server/auth/fan-actions';
import { invalidateFanMe } from '@/lib/fan-me';

function errText(t: (k: string) => string, code: string): string {
  if (code === 'invalid') return t('errInvalid');
  if (code === 'exists') return t('errExists');
  if (code === 'not-fan') return t('errNotFan');
  return t('errGeneric');
}

/** Login + cadastro do torcedor — split editorial (mosaico da torcida + formulário). */
export function FanAuth({ mode, next }: { mode: 'login' | 'signup'; next?: string }) {
  const t = useTranslations('fanAuth');
  const f = useTranslations('fan');
  const locale = useLocale();
  const [isPending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const isSignup = mode === 'signup';
  const swapQ = next ? `?next=${encodeURIComponent(next)}` : '';

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get('email') ?? '');
    const password = String(fd.get('password') ?? '');
    const name = String(fd.get('name') ?? '');
    setErr(null);
    if (isSignup && password.length < 8) {
      setErr(t('errShortPassword'));
      return;
    }
    start(async () => {
      invalidateFanMe();
      const res = isSignup
        ? await fanSignupAction({ email, name, password }, locale, next)
        : await fanLoginAction(email, password, locale, next);
      if (res?.error) setErr(errText(t, res.error));
      // sucesso → a action redireciona
    });
  }

  return (
    <div className="fan-auth">
      <aside className="fan-auth-visual" aria-hidden="true">
        <span className="fan-auth-ghost">1914</span>
        <div className="fan-auth-visual-copy">
          <span className="fan-auth-kicker">{f('kicker')}</span>
          <p className="fan-auth-display">{f('title')}</p>
        </div>
      </aside>
      <div className="fan-auth-panel">
      <div className="fan-auth-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo.png" alt="Santa Cruz FC" className="fan-auth-crest" width={64} height={64} />
        <h1 className="fan-auth-title">{isSignup ? t('signupTitle') : t('loginTitle')}</h1>
        <p className="fan-auth-sub">{isSignup ? t('signupSub') : t('loginSub')}</p>

        <form onSubmit={handleSubmit} className="fan-auth-form">
          {isSignup && (
            <label className="fan-field">
              <span>{t('name')}</span>
              <input name="name" type="text" autoComplete="name" required maxLength={120} />
            </label>
          )}
          <label className="fan-field">
            <span>{t('email')}</span>
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label className="fan-field">
            <span>{t('password')}</span>
            <input name="password" type="password" autoComplete={isSignup ? 'new-password' : 'current-password'} required minLength={isSignup ? 8 : undefined} />
            {isSignup && <small>{t('passwordHint')}</small>}
          </label>

          {err && <p className="fan-auth-err" role="alert">{err}</p>}

          <button type="submit" className="fan-btn" disabled={isPending}>
            {isPending ? t('working') : isSignup ? t('signupBtn') : t('loginBtn')}
          </button>
        </form>

        <p className="fan-auth-swap">
          {isSignup ? t('haveAccount') : t('noAccount')}{' '}
          <Link href={`${isSignup ? '/torcedor/entrar' : '/torcedor/cadastro'}${swapQ}`}>
            {isSignup ? t('loginLink') : t('signupLink')}
          </Link>
        </p>
      </div>
      </div>
    </div>
  );
}
