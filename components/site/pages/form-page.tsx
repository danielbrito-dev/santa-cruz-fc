'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { FormPageData } from '@/lib/site-pages';
import { Kicker } from './_shared';

export function FormPage({
  sectionKey,
  titleKey,
  data,
}: {
  sectionKey: string;
  titleKey: string;
  data: FormPageData;
}) {
  const menu = useTranslations('menu');
  const p = useTranslations('page');
  const [sent, setSent] = useState(false);

  return (
    <div className="sc-page">
      <header className="sc-dhero sc-dhero--doc">
        <span className="sc-dhero-ghost" aria-hidden="true">
          @
        </span>
        <div className="sc-wrap sc-dhero-inner sc-hero-in">
          <Kicker label={menu(sectionKey)} />
          <h1 className="sc-dhero-title">{menu(titleKey)}</h1>
        </div>
      </header>

      <div className="sc-form">
        <div className="sc-wrap sc-form-grid">
          <aside className="sc-form-aside sc-reveal">
            <p className="sc-h2" style={{ fontWeight: 700 }}>
              {data.lead}
            </p>
          </aside>

          {sent ? (
            <div className="sc-form-success" role="status">
              <strong>{p('formSuccess')}</strong>
              <p>{p('formSuccessNote')}</p>
            </div>
          ) : (
            <form
              className="sc-form-card sc-reveal"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              {data.fields.map((f) => (
                <label className="sc-field" key={f.name}>
                  <span>
                    {f.label}
                    {f.required && <em> *</em>}
                  </span>
                  {f.type === 'textarea' ? (
                    <textarea name={f.name} rows={5} required={f.required} />
                  ) : f.type === 'select' ? (
                    <select name={f.name} required={f.required} defaultValue="">
                      <option value="" disabled>
                        —
                      </option>
                      {f.options?.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input type={f.type} name={f.name} required={f.required} />
                  )}
                </label>
              ))}

              {data.consent && (
                <label className="sc-consent">
                  <input type="checkbox" required />
                  <span>{data.consent}</span>
                </label>
              )}

              <button type="submit" className="sc-btn sc-submit">
                {data.submitLabel} →
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="sc-fill" aria-hidden="true" />
    </div>
  );
}
