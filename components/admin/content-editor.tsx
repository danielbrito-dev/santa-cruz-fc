'use client';
import { useTransition, useState } from 'react';
import { useTranslations } from 'next-intl';
import { saveContent } from '@/server/content/actions';
import type { SiteContent, LocalizedText, CardItem } from '@/server/content/types';

// ─── types ────────────────────────────────────────────────────────────────────

type ActiveLang = 'pt' | 'en';
type ActiveSection = 'hero' | 'banners' | 'institutional' | 'footer';

interface HeroState {
  titleLine1: LocalizedText;
  titleLine2: LocalizedText;
  tagline: LocalizedText;
  ctaLabel: LocalizedText;
  ctaUrl: string;
  backdrop: string;
}

// ─── Field primitives ─────────────────────────────────────────────────────────

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}

function Field({ id, label, value, onChange, hint }: FieldProps) {
  return (
    <div className="admin-field">
      <label className="admin-label" htmlFor={id}>
        {label}
        {hint && <span className="admin-label-hint">{hint}</span>}
      </label>
      <input
        id={id}
        className="admin-input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

// ─── Section: Hero ────────────────────────────────────────────────────────────

interface HeroSectionProps {
  hero: HeroState;
  lang: ActiveLang;
  setHero: React.Dispatch<React.SetStateAction<HeroState>>;
}

function HeroSection({ hero, lang, setHero }: HeroSectionProps) {
  const t = useTranslations('admin');
  return (
    <div className="ce-section-fields">
      <Field
        id={`hero-titleLine1-${lang}`}
        label={t('fldTitleLine1')}
        value={hero.titleLine1[lang]}
        onChange={(v) => setHero((h) => ({ ...h, titleLine1: { ...h.titleLine1, [lang]: v } }))}
      />
      <Field
        id={`hero-titleLine2-${lang}`}
        label={t('fldTitleLine2')}
        value={hero.titleLine2[lang]}
        onChange={(v) => setHero((h) => ({ ...h, titleLine2: { ...h.titleLine2, [lang]: v } }))}
      />
      <Field
        id={`hero-tagline-${lang}`}
        label={t('fldTagline')}
        value={hero.tagline[lang]}
        onChange={(v) => setHero((h) => ({ ...h, tagline: { ...h.tagline, [lang]: v } }))}
      />
      <Field
        id={`hero-ctaLabel-${lang}`}
        label={t('fldCtaLabel')}
        value={hero.ctaLabel[lang]}
        onChange={(v) => setHero((h) => ({ ...h, ctaLabel: { ...h.ctaLabel, [lang]: v } }))}
      />
      <Field
        id="hero-ctaUrl"
        label={t('fldCtaUrl')}
        value={hero.ctaUrl}
        onChange={(v) => setHero((h) => ({ ...h, ctaUrl: v }))}
      />
      <Field
        id="hero-backdrop"
        label={t('fldBackdrop')}
        value={hero.backdrop}
        onChange={(v) => setHero((h) => ({ ...h, backdrop: v }))}
      />
    </div>
  );
}

// ─── Section: Banners ─────────────────────────────────────────────────────────

interface BannersSectionProps {
  banners: CardItem[];
  lang: ActiveLang;
  setBanners: React.Dispatch<React.SetStateAction<CardItem[]>>;
}

function BannersSection({ banners, lang, setBanners }: BannersSectionProps) {
  const t = useTranslations('admin');

  function update(idx: number, patch: Partial<CardItem>) {
    setBanners((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  }

  return (
    <div className="ce-section-fields">
      {banners.map((card, idx) => (
        <div key={card.id} className="ce-card-group">
          <p className="ce-card-index">#{idx + 1}</p>
          <Field
            id={`banner-${idx}-eyebrow-${lang}`}
            label={t('fldEyebrow')}
            value={card.eyebrow[lang]}
            onChange={(v) => update(idx, { eyebrow: { ...card.eyebrow, [lang]: v } })}
          />
          <Field
            id={`banner-${idx}-title-${lang}`}
            label={t('fldTitle')}
            value={card.title[lang]}
            onChange={(v) => update(idx, { title: { ...card.title, [lang]: v } })}
          />
          <Field
            id={`banner-${idx}-ctaLabel-${lang}`}
            label={t('fldCtaLabel')}
            value={card.ctaLabel[lang]}
            onChange={(v) => update(idx, { ctaLabel: { ...card.ctaLabel, [lang]: v } })}
          />
          <Field
            id={`banner-${idx}-ctaUrl`}
            label={t('fldCtaUrl')}
            value={card.ctaUrl}
            onChange={(v) => update(idx, { ctaUrl: v })}
          />
          <Field
            id={`banner-${idx}-image`}
            label={t('fldImage')}
            value={card.image}
            onChange={(v) => update(idx, { image: v })}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Section: Institutional ───────────────────────────────────────────────────

interface InstitutionalSectionProps {
  institutional: CardItem[];
  lang: ActiveLang;
  setInstitutional: React.Dispatch<React.SetStateAction<CardItem[]>>;
}

function InstitutionalSection({ institutional, lang, setInstitutional }: InstitutionalSectionProps) {
  const t = useTranslations('admin');

  function update(idx: number, patch: Partial<CardItem>) {
    setInstitutional((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  }

  return (
    <div className="ce-section-fields">
      {institutional.map((card, idx) => (
        <div key={card.id} className="ce-card-group">
          <p className="ce-card-index">#{idx + 1}</p>
          <Field
            id={`inst-${idx}-eyebrow-${lang}`}
            label={t('fldEyebrow')}
            value={card.eyebrow[lang]}
            onChange={(v) => update(idx, { eyebrow: { ...card.eyebrow, [lang]: v } })}
          />
          <Field
            id={`inst-${idx}-title-${lang}`}
            label={t('fldTitle')}
            value={card.title[lang]}
            onChange={(v) => update(idx, { title: { ...card.title, [lang]: v } })}
          />
          <Field
            id={`inst-${idx}-ctaLabel-${lang}`}
            label={t('fldCtaLabel')}
            value={card.ctaLabel[lang]}
            onChange={(v) => update(idx, { ctaLabel: { ...card.ctaLabel, [lang]: v } })}
          />
          <Field
            id={`inst-${idx}-ctaUrl`}
            label={t('fldCtaUrl')}
            value={card.ctaUrl}
            onChange={(v) => update(idx, { ctaUrl: v })}
          />
          <Field
            id={`inst-${idx}-image`}
            label={t('fldImage')}
            value={card.image}
            onChange={(v) => update(idx, { image: v })}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Section: Footer ──────────────────────────────────────────────────────────

type FooterState = {
  brandBlurb: LocalizedText;
  chantLine1: LocalizedText;
  chantEmphasis: LocalizedText;
  chantLine2: LocalizedText;
};

interface FooterSectionProps {
  footer: FooterState;
  lang: ActiveLang;
  setFooter: React.Dispatch<React.SetStateAction<FooterState>>;
}

function FooterSection({ footer, lang, setFooter }: FooterSectionProps) {
  const t = useTranslations('admin');
  return (
    <div className="ce-section-fields">
      <Field
        id={`footer-brandBlurb-${lang}`}
        label={t('fldBrandBlurb')}
        value={footer.brandBlurb[lang]}
        onChange={(v) => setFooter((f) => ({ ...f, brandBlurb: { ...f.brandBlurb, [lang]: v } }))}
      />
      <Field
        id={`footer-chantLine1-${lang}`}
        label={t('fldChant1')}
        value={footer.chantLine1[lang]}
        onChange={(v) => setFooter((f) => ({ ...f, chantLine1: { ...f.chantLine1, [lang]: v } }))}
      />
      <Field
        id={`footer-chantEmphasis-${lang}`}
        label={t('fldChantEm')}
        value={footer.chantEmphasis[lang]}
        onChange={(v) => setFooter((f) => ({ ...f, chantEmphasis: { ...f.chantEmphasis, [lang]: v } }))}
      />
      <Field
        id={`footer-chantLine2-${lang}`}
        label={t('fldChant2')}
        value={footer.chantLine2[lang]}
        onChange={(v) => setFooter((f) => ({ ...f, chantLine2: { ...f.chantLine2, [lang]: v } }))}
      />
    </div>
  );
}

// ─── Main ContentEditor ───────────────────────────────────────────────────────

interface ContentEditorProps {
  initial: SiteContent;
}

export function ContentEditor({ initial }: ContentEditorProps) {
  const t = useTranslations('admin');
  const [isPending, startTransition] = useTransition();

  // ── language + section state ───────────────────────────────────────────────
  const [activeLang, setActiveLang] = useState<ActiveLang>('pt');
  const [activeSection, setActiveSection] = useState<ActiveSection>('hero');

  // ── content state ──────────────────────────────────────────────────────────
  const [hero, setHero] = useState<HeroState>({
    titleLine1: initial.hero.titleLine1,
    titleLine2: initial.hero.titleLine2,
    tagline: initial.hero.tagline,
    ctaLabel: initial.hero.ctaLabel,
    ctaUrl: initial.hero.ctaUrl,
    backdrop: initial.hero.backdrop,
  });

  const [banners, setBanners] = useState<CardItem[]>(initial.banners);
  const [institutional, setInstitutional] = useState<CardItem[]>(initial.institutional);
  const [footer, setFooter] = useState<FooterState>({
    brandBlurb: initial.footer.brandBlurb,
    chantLine1: initial.footer.chantLine1,
    chantEmphasis: initial.footer.chantEmphasis,
    chantLine2: initial.footer.chantLine2,
  });

  // ── status message ─────────────────────────────────────────────────────────
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; msg: string } | null>(null);

  // ── save ───────────────────────────────────────────────────────────────────
  function handleSave() {
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
                : t('contentError');
        setStatus({ kind: 'error', msg: errorKey });
      }
    });
  }

  const sections: { key: ActiveSection; label: string }[] = [
    { key: 'hero', label: t('sectionHero') },
    { key: 'banners', label: t('sectionBanners') },
    { key: 'institutional', label: t('sectionInstitutional') },
    { key: 'footer', label: t('sectionFooter') },
  ];

  return (
    <div className="content-editor">

      {/* ── Controls bar: language toggle + section switcher ──────────── */}
      <div className="ce-controls">
        {/* Language toggle */}
        <div className="ce-lang-toggle" role="group" aria-label="Idioma">
          <button
            type="button"
            className={`ce-lang-btn${activeLang === 'pt' ? ' active' : ''}`}
            onClick={() => setActiveLang('pt')}
            aria-pressed={activeLang === 'pt'}
          >
            {t('langPt')}
          </button>
          <button
            type="button"
            className={`ce-lang-btn${activeLang === 'en' ? ' active' : ''}`}
            onClick={() => setActiveLang('en')}
            aria-pressed={activeLang === 'en'}
          >
            {t('langEn')}
          </button>
        </div>

        {/* Section tab switcher */}
        <nav className="ce-section-tabs" aria-label="Seções">
          {sections.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              className={`ce-section-tab${activeSection === key ? ' active' : ''}`}
              onClick={() => setActiveSection(key)}
              aria-current={activeSection === key ? 'true' : undefined}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Active section content panel ──────────────────────────────── */}
      <div className="ce-panel">

        {activeSection === 'hero' && (
          <HeroSection hero={hero} lang={activeLang} setHero={setHero} />
        )}

        {activeSection === 'banners' && (
          <BannersSection banners={banners} lang={activeLang} setBanners={setBanners} />
        )}

        {activeSection === 'institutional' && (
          <InstitutionalSection
            institutional={institutional}
            lang={activeLang}
            setInstitutional={setInstitutional}
          />
        )}

        {activeSection === 'footer' && (
          <FooterSection footer={footer} lang={activeLang} setFooter={setFooter} />
        )}
      </div>

      {/* ── Status message ────────────────────────────────────────────── */}
      {status && (
        <div
          role={status.kind === 'success' ? 'status' : 'alert'}
          className={`ce-status ce-status--${status.kind}`}
        >
          {status.msg}
        </div>
      )}

      {/* ── Sticky save bar ───────────────────────────────────────────── */}
      <div className="ce-save-bar">
        <button
          type="button"
          className="admin-btn admin-btn--primary ce-save-btn"
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
