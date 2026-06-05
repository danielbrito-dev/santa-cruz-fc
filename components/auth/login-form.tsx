'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { login } from '@/server/auth/actions';

// TODO(Phase 2): wire Supabase Auth (Google OAuth + email/password)

interface FormErrors {
  email?: string;
  password?: string;
}

export function LoginForm() {
  const t = useTranslations('auth');
  const locale = useLocale();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [showSoon, setShowSoon] = useState(false);
  const [serverError, setServerError] = useState(false);
  const [pending, startTransition] = useTransition();

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!email.trim()) {
      errs.email = t('errRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = t('errEmail');
    }
    if (!password.trim()) {
      errs.password = t('errRequired');
    }
    return errs;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setShowSoon(false);
    setServerError(false);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      startTransition(async () => {
        const res = await login(email, password, locale);
        if (res?.error === 'invalid') setServerError(true);
        // on success the action redirects (navigation happens automatically)
      });
    }
  }

  function handleGoogle() {
    // TODO(Phase 2): wire Supabase Auth (Google OAuth + email/password)
    setShowSoon(true);
  }

  return (
    <div className="login-form-root">
      {/* Server-side invalid credentials error */}
      {serverError && (
        <p className="login-server-error" role="alert">
          {t('errInvalid')}
        </p>
      )}

      {/* Google OAuth button */}
      <button
        type="button"
        className="login-google-btn"
        onClick={handleGoogle}
        aria-label={t('google')}
      >
        {/* Google "G" glyph — inline SVG per brand spec */}
        <svg
          className="login-google-icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
          width="18"
          height="18"
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        {t('google')}
      </button>

      {/* Divider */}
      <div className="login-divider" role="separator" aria-hidden="true">
        <span className="login-divider-line" />
        <span className="login-divider-text">{t('or')}</span>
        <span className="login-divider-line" />
      </div>

      {/* Email + password form */}
      <form onSubmit={handleSubmit} noValidate className="login-fields-form">
        {/* Email */}
        <div className="login-field">
          <label htmlFor="login-email" className="login-label">
            {t('email')}
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            className={`login-input${errors.email ? ' login-input--error' : ''}`}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              if (serverError) setServerError(false);
            }}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'login-email-error' : undefined}
          />
          {errors.email && (
            <span id="login-email-error" className="login-field-error" role="alert">
              {errors.email}
            </span>
          )}
        </div>

        {/* Password */}
        <div className="login-field">
          <label htmlFor="login-password" className="login-label">
            {t('password')}
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            className={`login-input${errors.password ? ' login-input--error' : ''}`}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              if (serverError) setServerError(false);
            }}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'login-password-error' : undefined}
          />
          {errors.password && (
            <span id="login-password-error" className="login-field-error" role="alert">
              {errors.password}
            </span>
          )}
        </div>

        {/* Submit — red + white ring (BRAND.md) */}
        <button type="submit" className="login-submit-btn" disabled={pending}>
          {pending ? t('signingIn') : t('submit')}
        </button>
      </form>

      {/* Stub "soon" notice — shown after Google click */}
      {showSoon && (
        <p className="login-soon-notice" role="status" aria-live="polite">
          {t('soon')}
        </p>
      )}
    </div>
  );
}
