'use client';

import { useRef, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';
import { updateFanProfileAction } from '@/server/auth/fan-actions';
import { invalidateFanMe } from '@/lib/fan-me';
import type { FanUser } from '@/server/auth/fan';

/** ISO (YYYY-MM-DD) → BR (DD/MM/YYYY) para exibição. */
function isoToBr(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
}
/** BR (DD/MM/YYYY) → ISO, validando dia/mês/ano reais; null se inválida. */
function brToIso(br: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(br);
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  const d = new Date(Date.UTC(year, month - 1, day));
  const real = d.getUTCFullYear() === year && d.getUTCMonth() === month - 1 && d.getUTCDate() === day;
  if (!real || year < 1900 || d.getTime() > Date.now()) return null;
  return `${m[3]}-${m[2]}-${m[1]}`;
}
/** Máscara progressiva DD/MM/YYYY enquanto digita (só dígitos + barras). */
function maskBrDate(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}
/** Máscara de CEP: 00000-000. */
function maskCep(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 8);
  return d.length <= 5 ? d : `${d.slice(0, 5)}-${d.slice(5)}`;
}

/** Perfil do torcedor — dados pessoais + foto (upload pro Supabase Storage). */
export function FanProfile({ fan }: { fan: FanUser }) {
  const t = useTranslations('fanProfile');
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isPending, start] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<'saved' | 'error' | null>(null);
  const [birthErr, setBirthErr] = useState(false);
  const [cepStatus, setCepStatus] = useState<'idle' | 'searching' | 'notFound'>('idle');
  const [form, setForm] = useState({
    name: fan.name,
    photo: fan.photo ?? '',
    phone: fan.phone ?? '',
    birthDate: isoToBr(fan.birthDate ?? ''),
    cep: maskCep(fan.cep ?? ''),
    street: fan.street ?? '',
    number: fan.number ?? '',
    complement: fan.complement ?? '',
    neighborhood: fan.neighborhood ?? '',
    city: fan.city ?? '',
    state: fan.state ?? '',
  });

  /** Busca o endereço no ViaCEP quando o CEP completa 8 dígitos. */
  async function lookupCep(masked: string) {
    const digits = masked.replace(/\D/g, '');
    if (digits.length !== 8) return;
    setCepStatus('searching');
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const json = await res.json();
      if (res.ok && !json.erro) {
        setForm((f) => ({
          ...f,
          street: json.logradouro || f.street,
          neighborhood: json.bairro || f.neighborhood,
          city: json.localidade || f.city,
          state: json.uf || f.state,
        }));
        setCepStatus('idle');
      } else {
        setCepStatus('notFound');
      }
    } catch {
      setCepStatus('notFound');
    }
  }

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
    setBirthErr(false);
    const iso = form.birthDate ? brToIso(form.birthDate) : undefined;
    if (form.birthDate && !iso) {
      setBirthErr(true);
      return;
    }
    start(async () => {
      const res = await updateFanProfileAction({
        name: form.name.trim(),
        photo: form.photo.trim() || undefined,
        phone: form.phone.trim() || undefined,
        birthDate: iso ?? undefined,
        cep: form.cep.trim() || undefined,
        street: form.street.trim() || undefined,
        number: form.number.trim() || undefined,
        complement: form.complement.trim() || undefined,
        neighborhood: form.neighborhood.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state.trim().toUpperCase() || undefined,
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
            <input
              type="text"
              inputMode="numeric"
              placeholder={t('birthDatePh')}
              maxLength={10}
              value={form.birthDate}
              onChange={(e) => {
                setBirthErr(false);
                setForm({ ...form, birthDate: maskBrDate(e.target.value) });
              }}
              aria-invalid={birthErr}
            />
            {birthErr && <small className="fan-auth-err" role="alert">{t('errBirthDate')}</small>}
          </label>
        </div>
        <div className="fan-field-row">
          <label className="fan-field" style={{ flex: '0 0 150px' }}>
            <span>{t('cep')}</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="00000-000"
              maxLength={9}
              value={form.cep}
              onChange={(e) => {
                const masked = maskCep(e.target.value);
                setCepStatus('idle');
                setForm({ ...form, cep: masked });
                lookupCep(masked);
              }}
            />
            {cepStatus === 'searching' && <small>{t('cepSearching')}</small>}
            {cepStatus === 'notFound' && <small className="fan-auth-err" role="alert">{t('cepNotFound')}</small>}
          </label>
          <label className="fan-field">
            <span>{t('street')}</span>
            <input type="text" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} maxLength={160} />
          </label>
        </div>
        <div className="fan-field-row">
          <label className="fan-field" style={{ flex: '0 0 110px' }}>
            <span>{t('number')}</span>
            <input type="text" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} maxLength={20} />
          </label>
          <label className="fan-field">
            <span>{t('complement')}</span>
            <input type="text" value={form.complement} onChange={(e) => setForm({ ...form, complement: e.target.value })} maxLength={80} />
          </label>
          <label className="fan-field">
            <span>{t('neighborhood')}</span>
            <input type="text" value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} maxLength={120} />
          </label>
        </div>
        <div className="fan-field-row">
          <label className="fan-field">
            <span>{t('city')}</span>
            <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} maxLength={120} />
          </label>
          <label className="fan-field" style={{ flex: '0 0 90px' }}>
            <span>{t('state')}</span>
            <input type="text" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2) })} maxLength={2} placeholder="PE" />
          </label>
        </div>

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
