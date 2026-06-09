'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { FormPageData } from '@/lib/site-pages';

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
    <div className="form-page">
      <header className="form-head">
        <div className="container">
          <span className="form-eyebrow">{menu(sectionKey)}</span>
          <h1 className="form-title">{menu(titleKey)}</h1>
          <p className="form-lead">{data.lead}</p>
        </div>
      </header>

      <div className="form-body">
        <div className="container">
          {sent ? (
            <div className="form-success" role="status">
              <strong>{p('formSuccess')}</strong>
              <p>{p('formSuccessNote')}</p>
            </div>
          ) : (
            <form
              className="form-card"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              {data.fields.map((f) => (
                <label className="form-field" key={f.name}>
                  <span className="form-label">
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
                <label className="form-consent">
                  <input type="checkbox" required />
                  <span>{data.consent}</span>
                </label>
              )}

              <button type="submit" className="form-submit">
                {data.submitLabel} →
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="info-fill" aria-hidden="true" />
    </div>
  );
}
