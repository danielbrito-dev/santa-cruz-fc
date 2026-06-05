'use client';
import { useTransition, useState } from 'react';
import { useTranslations } from 'next-intl';
import { saveContent } from '@/server/content/actions';
import type { SiteContent, LocalizedText, CardItem } from '@/server/content/types';

// ─── small helpers ────────────────────────────────────────────────────────────

interface LocalizedFieldProps {
  idBase: string;
  label: string;
  value: LocalizedText;
  onChange: (v: LocalizedText) => void;
}

function LocalizedField({ idBase, label, value, onChange }: LocalizedFieldProps) {
  return (
    <div className="ce-field-group">
      <span className="ce-field-label">{label}</span>
      <div className="ce-localized-row">
        <label className="ce-lang-label" htmlFor={`${idBase}-pt`}>
          <span className="ce-lang-badge">PT</span>
          <input
            id={`${idBase}-pt`}
            className="ce-input"
            type="text"
            value={value.pt}
            onChange={(e) => onChange({ ...value, pt: e.target.value })}
          />
        </label>
        <label className="ce-lang-label" htmlFor={`${idBase}-en`}>
          <span className="ce-lang-badge">EN</span>
          <input
            id={`${idBase}-en`}
            className="ce-input"
            type="text"
            value={value.en}
            onChange={(e) => onChange({ ...value, en: e.target.value })}
          />
        </label>
      </div>
    </div>
  );
}

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}

function TextField({ id, label, value, onChange }: TextFieldProps) {
  return (
    <div className="ce-field-group">
      <label className="ce-field-label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="ce-input ce-input--full"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

// ─── hero state shape ─────────────────────────────────────────────────────────

interface HeroState {
  titleLine1: LocalizedText;
  titleLine2: LocalizedText;
  tagline: LocalizedText;
  ctaLabel: LocalizedText;
  ctaUrl: string;
  backdrop: string;
}

// ─── main component ───────────────────────────────────────────────────────────

interface ContentEditorProps {
  initial: SiteContent;
}

export function ContentEditor({ initial }: ContentEditorProps) {
  const t = useTranslations('admin');
  const [isPending, startTransition] = useTransition();

  // ── hero ──────────────────────────────────────────────────────────────────
  const [hero, setHero] = useState<HeroState>({
    titleLine1: initial.hero.titleLine1,
    titleLine2: initial.hero.titleLine2,
    tagline: initial.hero.tagline,
    ctaLabel: initial.hero.ctaLabel,
    ctaUrl: initial.hero.ctaUrl,
    backdrop: initial.hero.backdrop,
  });

  // ── banners (array of CardItem) ────────────────────────────────────────────
  const [banners, setBanners] = useState<CardItem[]>(initial.banners);

  // ── institutional ──────────────────────────────────────────────────────────
  const [institutional, setInstitutional] = useState<CardItem[]>(initial.institutional);

  // ── footer editable fields ─────────────────────────────────────────────────
  const [footer, setFooter] = useState({
    brandBlurb: initial.footer.brandBlurb,
    chantLine1: initial.footer.chantLine1,
    chantEmphasis: initial.footer.chantEmphasis,
    chantLine2: initial.footer.chantLine2,
  });

  // ── status message ─────────────────────────────────────────────────────────
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; msg: string } | null>(null);

  // ── save ────────────────────────────────────────────────────────────────────
  function handleSave() {
    // Build the FULL content by spreading initial, overwriting only edited blocks.
    // matches, news, sponsors, social, footer.columns are preserved from initial.
    const full: SiteContent = {
      ...initial,
      hero: {
        ...initial.hero,
        titleLine1: hero.titleLine1,
        titleLine2: hero.titleLine2,
        tagline: hero.tagline,
        ctaLabel: hero.ctaLabel,
        ctaUrl: hero.ctaUrl,
        backdrop: hero.backdrop,
      },
      banners,
      institutional,
      footer: {
        ...initial.footer,
        brandBlurb: footer.brandBlurb,
        chantLine1: footer.chantLine1,
        chantEmphasis: footer.chantEmphasis,
        chantLine2: footer.chantLine2,
      },
    };

    startTransition(async () => {
      setStatus(null);
      const res = await saveContent(full);
      if (res.ok) {
        setStatus({ kind: 'success', msg: t('contentSaved') });
      } else {
        const errorKey =
          res.error === 'readonly'
            ? t('contentReadonly')
            : res.error === 'invalid'
              ? t('contentInvalid')
              : res.error === 'unauthorized'
                ? t('contentUnauthorized')
                : res.error;
        setStatus({ kind: 'error', msg: errorKey });
      }
    });
  }

  // ── card updater helpers ────────────────────────────────────────────────────
  function updateBanner(idx: number, patch: Partial<CardItem>) {
    setBanners((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  }

  function updateInstitutional(idx: number, patch: Partial<CardItem>) {
    setInstitutional((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  }

  // ─── render ────────────────────────────────────────────────────────────────
  return (
    <div className="content-editor">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <details className="ce-section" open>
        <summary className="ce-section-summary">
          <span className="ce-section-label">{t('secHero')}</span>
          <span className="ce-section-chevron" aria-hidden="true" />
        </summary>
        <div className="ce-section-body">
          <LocalizedField
            idBase="hero-titleLine1"
            label={t('fldTitleLine1')}
            value={hero.titleLine1}
            onChange={(v) => setHero((h) => ({ ...h, titleLine1: v }))}
          />
          <LocalizedField
            idBase="hero-titleLine2"
            label={t('fldTitleLine2')}
            value={hero.titleLine2}
            onChange={(v) => setHero((h) => ({ ...h, titleLine2: v }))}
          />
          <LocalizedField
            idBase="hero-tagline"
            label={t('fldTagline')}
            value={hero.tagline}
            onChange={(v) => setHero((h) => ({ ...h, tagline: v }))}
          />
          <LocalizedField
            idBase="hero-ctaLabel"
            label={t('fldCtaLabel')}
            value={hero.ctaLabel}
            onChange={(v) => setHero((h) => ({ ...h, ctaLabel: v }))}
          />
          <TextField
            id="hero-ctaUrl"
            label={t('fldCtaUrl')}
            value={hero.ctaUrl}
            onChange={(v) => setHero((h) => ({ ...h, ctaUrl: v }))}
          />
          <TextField
            id="hero-backdrop"
            label={t('fldBackdrop')}
            value={hero.backdrop}
            onChange={(v) => setHero((h) => ({ ...h, backdrop: v }))}
          />
        </div>
      </details>

      {/* ── BANNERS ──────────────────────────────────────────────────────── */}
      <details className="ce-section">
        <summary className="ce-section-summary">
          <span className="ce-section-label">{t('secBanners')}</span>
          <span className="ce-section-chevron" aria-hidden="true" />
        </summary>
        <div className="ce-section-body">
          {banners.map((card, idx) => (
            <div key={card.id} className="ce-card-group">
              <p className="ce-card-index">#{idx + 1}</p>
              <LocalizedField
                idBase={`banner-${idx}-eyebrow`}
                label={t('fldEyebrow')}
                value={card.eyebrow}
                onChange={(v) => updateBanner(idx, { eyebrow: v })}
              />
              <LocalizedField
                idBase={`banner-${idx}-title`}
                label={t('fldTitle')}
                value={card.title}
                onChange={(v) => updateBanner(idx, { title: v })}
              />
              <LocalizedField
                idBase={`banner-${idx}-ctaLabel`}
                label={t('fldCtaLabel')}
                value={card.ctaLabel}
                onChange={(v) => updateBanner(idx, { ctaLabel: v })}
              />
              <TextField
                id={`banner-${idx}-ctaUrl`}
                label={t('fldCtaUrl')}
                value={card.ctaUrl}
                onChange={(v) => updateBanner(idx, { ctaUrl: v })}
              />
              <TextField
                id={`banner-${idx}-image`}
                label={t('fldImage')}
                value={card.image}
                onChange={(v) => updateBanner(idx, { image: v })}
              />
            </div>
          ))}
        </div>
      </details>

      {/* ── INSTITUTIONAL ────────────────────────────────────────────────── */}
      <details className="ce-section">
        <summary className="ce-section-summary">
          <span className="ce-section-label">{t('secInstitutional')}</span>
          <span className="ce-section-chevron" aria-hidden="true" />
        </summary>
        <div className="ce-section-body">
          {institutional.map((card, idx) => (
            <div key={card.id} className="ce-card-group">
              <p className="ce-card-index">#{idx + 1}</p>
              <LocalizedField
                idBase={`inst-${idx}-eyebrow`}
                label={t('fldEyebrow')}
                value={card.eyebrow}
                onChange={(v) => updateInstitutional(idx, { eyebrow: v })}
              />
              <LocalizedField
                idBase={`inst-${idx}-title`}
                label={t('fldTitle')}
                value={card.title}
                onChange={(v) => updateInstitutional(idx, { title: v })}
              />
              <LocalizedField
                idBase={`inst-${idx}-ctaLabel`}
                label={t('fldCtaLabel')}
                value={card.ctaLabel}
                onChange={(v) => updateInstitutional(idx, { ctaLabel: v })}
              />
              <TextField
                id={`inst-${idx}-ctaUrl`}
                label={t('fldCtaUrl')}
                value={card.ctaUrl}
                onChange={(v) => updateInstitutional(idx, { ctaUrl: v })}
              />
              <TextField
                id={`inst-${idx}-image`}
                label={t('fldImage')}
                value={card.image}
                onChange={(v) => updateInstitutional(idx, { image: v })}
              />
            </div>
          ))}
        </div>
      </details>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <details className="ce-section">
        <summary className="ce-section-summary">
          <span className="ce-section-label">{t('secFooter')}</span>
          <span className="ce-section-chevron" aria-hidden="true" />
        </summary>
        <div className="ce-section-body">
          <LocalizedField
            idBase="footer-brandBlurb"
            label={t('fldBrandBlurb')}
            value={footer.brandBlurb}
            onChange={(v) => setFooter((f) => ({ ...f, brandBlurb: v }))}
          />
          <LocalizedField
            idBase="footer-chantLine1"
            label={t('fldChant1')}
            value={footer.chantLine1}
            onChange={(v) => setFooter((f) => ({ ...f, chantLine1: v }))}
          />
          <LocalizedField
            idBase="footer-chantEmphasis"
            label={t('fldChantEm')}
            value={footer.chantEmphasis}
            onChange={(v) => setFooter((f) => ({ ...f, chantEmphasis: v }))}
          />
          <LocalizedField
            idBase="footer-chantLine2"
            label={t('fldChant2')}
            value={footer.chantLine2}
            onChange={(v) => setFooter((f) => ({ ...f, chantLine2: v }))}
          />
        </div>
      </details>

      {/* ── STATUS MESSAGE ───────────────────────────────────────────────── */}
      {status && (
        <div
          role={status.kind === 'success' ? 'status' : 'alert'}
          className={`ce-status ce-status--${status.kind}`}
        >
          {status.msg}
        </div>
      )}

      {/* ── SAVE BAR ─────────────────────────────────────────────────────── */}
      <div className="ce-save-bar">
        <button
          type="button"
          className="ce-save-btn"
          disabled={isPending}
          onClick={handleSave}
          aria-disabled={isPending}
        >
          {isPending ? t('saving') : t('save')}
        </button>
      </div>
    </div>
  );
}
