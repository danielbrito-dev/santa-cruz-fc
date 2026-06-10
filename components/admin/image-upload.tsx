'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

/** Campo de arquivo com upload pro Supabase Storage (bucket media) + URL manual. */
export function ImageUpload({
  value,
  onChange,
  folder = 'uploads',
  label,
  accept = 'image/*',
}: {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  /** ex.: "application/pdf,image/*" para documentos */
  accept?: string;
}) {
  const t = useTranslations('admin');
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function upload(file: File) {
    setBusy(true);
    setErr(null);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', folder);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (res.ok && json.url) onChange(json.url);
      else setErr(t('uploadError'));
    } catch {
      setErr(t('uploadError'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-field">
      {label && <span className="admin-label">{label}</span>}
      <div className="img-upload">
        {value && /\.pdf($|[?#])/i.test(value) ? (
          <div className="img-upload-ph img-upload-ph--doc" aria-hidden="true">PDF</div>
        ) : value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="img-upload-preview" src={value} alt="" />
        ) : (
          <div className="img-upload-ph" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-4.5-4.5L5 21" />
            </svg>
          </div>
        )}
        <div className="img-upload-main">
          <div className="img-upload-actions">
            <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => inputRef.current?.click()} disabled={busy}>
              {busy ? t('uploading') : t('uploadBtn')}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload(f);
                e.target.value = '';
              }}
            />
          </div>
          <input className="admin-input" value={value} onChange={(e) => onChange(e.target.value)} placeholder={t('imageUrlPlaceholder')} />
          {err && <span className="img-upload-err">{err}</span>}
        </div>
      </div>
    </div>
  );
}
