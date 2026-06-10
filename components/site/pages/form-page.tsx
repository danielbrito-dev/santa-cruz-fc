'use client';
import { useEffect, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import type { FormPageData } from '@/lib/site-pages';
import { submitFanStory } from '@/server/content/fan-story-actions';
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
  const [err, setErr] = useState(false);
  const [isPending, start] = useTransition();
  // Modo história: pré-preenche nome/cidade com o torcedor logado (o gate garante login).
  const [me, setMe] = useState<{ name: string; city?: string } | null>(null);
  useEffect(() => {
    if (!data.story) return;
    fetch('/api/fan/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((f) => f && setMe(f))
      .catch(() => null);
  }, [data.story]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!data.story) {
      setSent(true);
      return;
    }
    const fd = new FormData(e.currentTarget);
    setErr(false);
    start(async () => {
      const res = await submitFanStory({
        nome: String(fd.get('nome') ?? ''),
        cidade: String(fd.get('cidade') ?? ''),
        geracao: String(fd.get('geracao') ?? ''),
        historia: String(fd.get('historia') ?? ''),
      });
      if (res.ok) setSent(true);
      else setErr(true);
    });
  }

  function fieldDefault(name: string): string | undefined {
    if (!data.story || !me) return undefined;
    if (name === 'nome') return me.name;
    if (name === 'cidade') return me.city;
    return undefined;
  }

  return (
    <div className="sc-page" data-section={sectionKey}>
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
              onSubmit={handleSubmit}
              key={me ? 'prefilled' : 'blank'}
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
                    <input type={f.type} name={f.name} required={f.required} defaultValue={fieldDefault(f.name)} />
                  )}
                </label>
              ))}

              {data.consent && (
                <label className="sc-consent">
                  <input type="checkbox" required />
                  <span>{data.consent}</span>
                </label>
              )}

              {err && (
                <p className="sc-form-err" role="alert">
                  {p('formError')}
                </p>
              )}

              <button type="submit" className="sc-btn sc-submit" disabled={isPending}>
                {isPending ? '…' : data.submitLabel} →
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="sc-fill" aria-hidden="true" />
    </div>
  );
}
