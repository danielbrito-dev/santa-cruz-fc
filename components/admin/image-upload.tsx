'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { parseImagePos, withImagePos } from '@/lib/image-pos';

/** Campo de arquivo com upload pro Supabase Storage (bucket media) + URL manual.
 *  Com `adjustable`, o preview vira um recorte arrastável que grava a posição
 *  do enquadramento no fragmento da URL (#pos=x,y → object-position no site). */
export function ImageUpload({
  value,
  onChange,
  folder = 'uploads',
  label,
  accept = 'image/*',
  adjustable = false,
}: {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  /** ex.: "application/pdf,image/*" para documentos */
  accept?: string;
  /** habilita o ajuste de enquadramento por arrasto (imagens exibidas em recorte/cover) */
  adjustable?: boolean;
}) {
  const t = useTranslations('admin');
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const parsed = parseImagePos(value);
  // posição "ao vivo" durante o arrasto; fora dele, a verdade é o que está na URL
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; posX: number; posY: number; w: number; h: number } | null>(null);
  const posX = drag?.x ?? parsed.x;
  const posY = drag?.y ?? parsed.y;

  const isPdf = !!value && /\.pdf($|[?#])/i.test(value);
  const showAdjust = adjustable && !!value && !isPdf;

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

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, posX, posY, w: r.width, h: r.height };
  }
  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const d = dragRef.current;
    if (!d) return;
    // arrastar a imagem para baixo revela o topo → diminui o y% (idem no eixo x)
    const x = Math.min(100, Math.max(0, d.posX - ((e.clientX - d.startX) / d.w) * 100));
    const y = Math.min(100, Math.max(0, d.posY - ((e.clientY - d.startY) / d.h) * 100));
    setDrag({ x, y });
  }
  function onPointerUp() {
    if (!dragRef.current) return;
    dragRef.current = null;
    if (drag) {
      onChange(withImagePos(value, drag.x, drag.y));
      setDrag(null);
    }
  }

  return (
    <div className="admin-field">
      {label && <span className="admin-label">{label}</span>}
      {showAdjust && (
        <>
          <div
            className="img-upload-adjust"
            role="slider"
            aria-label={t('adjustHint')}
            aria-valuetext={`${Math.round(posX)}% ${Math.round(posY)}%`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={parsed.src} alt="" style={{ objectPosition: `${posX}% ${posY}%` }} draggable={false} />
          </div>
          <span className="img-upload-adjust-hint">{t('adjustHint')}</span>
        </>
      )}
      <div className="img-upload">
        {isPdf ? (
          <div className="img-upload-ph img-upload-ph--doc" aria-hidden="true">PDF</div>
        ) : value && !showAdjust ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="img-upload-preview" src={parsed.src} alt="" />
        ) : !value ? (
          <div className="img-upload-ph" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-4.5-4.5L5 21" />
            </svg>
          </div>
        ) : null}
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
