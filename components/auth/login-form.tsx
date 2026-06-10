'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { login } from '@/server/auth/actions';

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
  const [serverError, setServerError] = useState<null | 'invalid' | 'disabled'>(null);
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
    setServerError(null);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      startTransition(async () => {
        const res = await login(email, password, locale);
        if (res?.error) setServerError(res.error);
        // on success the action redirects (navigation happens automatically)
      });
    }
  }

  return (
    <div className="login-form-root">
      {/* Server-side invalid credentials error */}
      {serverError && (
        <p className="login-server-error" role="alert">
          {t(serverError === 'disabled' ? 'errDisabled' : 'errInvalid')}
        </p>
      )}

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
              if (serverError) setServerError(null);
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
              if (serverError) setServerError(null);
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
    </div>
  );
}
