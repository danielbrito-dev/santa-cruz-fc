'use client';

import { useRef, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';
import { updateFanProfileAction } from '@/server/auth/fan-actions';
import { invalidateFanMe } from '@/lib/fan-me';
import type { FanUser } from '@/server/auth/fan';

/** Perfil do torcedor — dados pessoais + foto (upload pro Supabase Storage). */
export function FanProfile({ fan }: { fan: FanUser }) {
  const t = useTranslations('fanProfile');
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isPending, start] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<'saved' | 'error' | null>(null);
  const [form, setForm] = useState({
    name: fan.name,
    photo: fan.photo ?? '',
    phone: fan.phone ?? '',
    city: fan.city ?? '',
    birthDate: fan.birthDate ?? '',
  });

  async function uploadPhoto(file: File) {
    setUploading(true);
    setMsg(null);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'fans');
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (res.ok && json.url) setForm((f) => ({ ...f, photo: json.url }));
      else setMsg('error');
    } catch {
      setMsg('error');
    } finally {
      setUploading(false);
    }
  }

  function save() {
    setMsg(null);
    start(async () => {
      const res = await updateFanProfileAction({
        name: form.name.trim(),
        photo: form.photo.trim() || undefined,
        phone: form.phone.trim() || undefined,
        city: form.city.trim() || undefined,
        birthDate: form.birthDate || undefined,
      });
      if (res.ok) {
        setMsg('saved');
        invalidateFanMe();
        router.refresh();
      } else {
        setMsg('error');
      }
    });
  }

  return (
    <div className="fan-profile">
      <div className="fan-profile-photo-row">
        {form.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="fan-profile-photo" src={form.photo} alt="" />
        ) : (
          <span className="fan-profile-photo fan-chip-initial">{(form.name || '?').charAt(0).toUpperCase()}</span>
        )}
        <div className="fan-profile-photo-actions">
          <button type="button" className="fan-btn fan-btn--ghost" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? t('uploading') : t('changePhoto')}
          </button>
          {form.photo && (
            <button type="button" className="fan-btn fan-btn--ghost" onClick={() => setForm((f) => ({ ...f, photo: '' }))}>
              {t('removePhoto')}
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadPhoto(f);
              e.target.value = '';
            }}
          />
        </div>
      </div>

      <form
        className="fan-auth-form"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <label className="fan-field">
          <span>{t('email')}</span>
          <input type="email" value={fan.email} disabled />
        </label>
        <label className="fan-field">
          <span>{t('name')}</span>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={120} />
        </label>
        <div className="fan-field-row">
          <label className="fan-field">
            <span>{t('phone')}</span>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={30} />
          </label>
          <label className="fan-field">
            <span>{t('birthDate')}</span>
            <input type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} />
          </label>
        </div>
        <label className="fan-field">
          <span>{t('city')}</span>
          <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} maxLength={120} />
        </label>

        {msg === 'saved' && <p className="fan-auth-ok" role="status">{t('saved')}</p>}
        {msg === 'error' && <p className="fan-auth-err" role="alert">{t('error')}</p>}

        <button type="submit" className="fan-btn" disabled={isPending || !form.name.trim()}>
          {isPending ? t('saving') : t('save')}
        </button>
      </form>

      <p className="fan-lgpd">{t('lgpd')}</p>
    </div>
  );
}
