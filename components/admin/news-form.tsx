'use client';

import { useTransition, useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';
import { Link } from '@/lib/i18n/navigation';
import { createNews, updateNews, deleteNews } from '@/server/content/news-actions';
import type { NewsInput } from '@/server/content/news-ops';
import type { NewsItem } from '@/server/content/types';

// ─── helpers ──────────────────────────────────────────────────────────────────

type ActiveLang = 'pt' | 'en';

function slugify(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s]+/g, '-');
}

function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

function buildInitialInput(item?: NewsItem): NewsInput {
  if (item) {
    return {
      slug: item.slug,
      tag: { pt: item.tag.pt ?? '', en: item.tag.en ?? '' },
      title: { pt: item.title.pt ?? '', en: item.title.en ?? '' },
      excerpt: { pt: item.excerpt.pt ?? '', en: item.excerpt.en ?? '' },
      body: { pt: item.body.pt ?? '', en: item.body.en ?? '' },
      coverImage: item.coverImage,
      photoCount: item.photoCount,
      featured: item.featured,
      status: item.status,
      publishedAt: item.publishedAt ?? todayString(),
    };
  }
  return {
    slug: '',
    tag: { pt: '', en: '' },
    title: { pt: '', en: '' },
    excerpt: { pt: '', en: '' },
    body: { pt: '', en: '' },
    coverImage: '',
    photoCount: 0,
    featured: false,
    status: 'draft',
    publishedAt: todayString(),
  };
}

// ─── sub-components ───────────────────────────────────────────────────────────

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  error?: string;
  hint?: string;
  placeholder?: string;
}

function TextField({ id, label, value, onChange, required, error, hint, placeholder }: TextFieldProps) {
  return (
    <div className="admin-field">
      <label className="admin-label" htmlFor={id}>
        {label}
        {required && <span className="admin-label-required" aria-hidden="true"> *</span>}
        {hint && <span className="admin-label-hint">{hint}</span>}
      </label>
      <input
        id={id}
        className={`admin-input${error ? ' admin-input--error' : ''}`}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-required={required}
        aria-describedby={error ? `${id}-err` : undefined}
      />
      {error && (
        <span id={`${id}-err`} className="admin-field-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

interface TextAreaFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}

function TextAreaField({ id, label, value, onChange, rows = 4, placeholder }: TextAreaFieldProps) {
  return (
    <div className="admin-field">
      <label className="admin-label" htmlFor={id}>
        {label}
      </label>
      <textarea
        id={id}
        className="admin-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
      />
    </div>
  );
}

// ─── main form ────────────────────────────────────────────────────────────────

interface NewsFormProps {
  locale: string;
  initial?: NewsItem;
}

export function NewsForm({ locale: _locale, initial }: NewsFormProps) {
  const t = useTranslations('admin');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const [activeLang, setActiveLang] = useState<ActiveLang>('pt');
  const [input, setInput] = useState<NewsInput>(() => buildInitialInput(initial));
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; msg: string } | null>(null);
  const slugEditedRef = useRef(false);

  // ── setters ──────────────────────────────────────────────────────────────────

  function setLocalized(
    field: 'title' | 'tag' | 'excerpt' | 'body',
    lang: ActiveLang,
    value: string,
  ) {
    setInput((prev) => ({
      ...prev,
      [field]: { ...prev[field], [lang]: value },
    }));
    // Auto-slug from PT title (only when slug hasn't been manually edited and in create mode)
    if (field === 'title' && lang === 'pt' && !slugEditedRef.current && !initial) {
      setInput((prev) => ({ ...prev, slug: slugify(value) }));
    }
  }

  function setSlug(value: string) {
    slugEditedRef.current = true;
    setInput((prev) => ({ ...prev, slug: value }));
  }

  function setScalar<K extends 'coverImage' | 'publishedAt'>(key: K, value: string) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  function setPhotoCount(value: string) {
    const n = parseInt(value, 10);
    setInput((prev) => ({ ...prev, photoCount: isNaN(n) ? 0 : Math.max(0, n) }));
  }

  function setStatus_field(value: 'draft' | 'published' | 'archived') {
    setInput((prev) => ({ ...prev, status: value }));
  }

  function setFeatured(checked: boolean) {
    setInput((prev) => ({ ...prev, featured: checked }));
  }

  // ── validation ────────────────────────────────────────────────────────────────

  function validate(): boolean {
    const errs: Partial<Record<string, string>> = {};
    // PT is the canonical locale (the public site falls back to PT) — require it.
    if (!input.title.pt.trim()) {
      errs.title = t('errRequired');
      setActiveLang('pt'); // surface the PT field so the error is visible
    }
    if (!input.slug) {
      errs.slug = t('errRequired');
    } else if (!/^[a-z0-9-]+$/.test(input.slug)) {
      errs.slug = t('errSlugFormat');
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // ── save ──────────────────────────────────────────────────────────────────────

  function handleSave() {
    if (!validate()) return;
    startTransition(async () => {
      setStatus(null);
      const res = initial
        ? await updateNews(initial.id, input)
        : await createNews(input);

      if (res.ok) {
        setStatus({ kind: 'success', msg: t('newsSaved') });
        router.push('/admin/noticias' as never);
        router.refresh();
      } else {
        const msg =
          res.error === 'readonly'
            ? t('contentReadonly')
            : res.error === 'unauthorized'
              ? t('contentUnauthorized')
              : t('contentError');
        setStatus({ kind: 'error', msg });
      }
    });
  }

  // ── delete ────────────────────────────────────────────────────────────────────

  function handleDelete() {
    if (!initial) return;
    if (!confirm(t('deleteConfirm'))) return;
    startDeleteTransition(async () => {
      const res = await deleteNews(initial.id);
      if (res.ok) {
        router.push('/admin/noticias' as never);
        router.refresh();
      } else {
        setStatus({ kind: 'error', msg: t('contentError') });
      }
    });
  }

  // ── render ────────────────────────────────────────────────────────────────────

  const lang = activeLang;
  const isBusy = isPending || isDeleting;

  return (
    <div className="admin-page admin-page--wide">
      {/* Page title */}
      <div className="admin-page-head admin-news-form-header">
        <h1 className="admin-page-title">
          {initial ? t('newsEdit') : t('newsNew')}
        </h1>
        <div className="admin-news-form-header-actions">
          <Link href="/admin/noticias" className="admin-btn admin-btn--ghost admin-btn--sm">
            {t('cancel')}
          </Link>
          {initial && (
            <button
              type="button"
              className="admin-btn admin-btn--ghost admin-btn--sm admin-btn--danger"
              onClick={handleDelete}
              disabled={isBusy}
            >
              {isDeleting ? '…' : t('delete')}
            </button>
          )}
        </div>
      </div>

      {/* Language toggle */}
      <div className="ce-controls admin-news-form-controls">
        <div className="ce-lang-toggle" role="group" aria-label="Idioma de edição">
          <button
            type="button"
            className={`ce-lang-btn${lang === 'pt' ? ' active' : ''}`}
            onClick={() => setActiveLang('pt')}
            aria-pressed={lang === 'pt'}
          >
            {t('langPt')}
          </button>
          <button
            type="button"
            className={`ce-lang-btn${lang === 'en' ? ' active' : ''}`}
            onClick={() => setActiveLang('en')}
            aria-pressed={lang === 'en'}
          >
            {t('langEn')}
          </button>
        </div>
      </div>

      {/* Form body */}
      <div className="admin-news-form-body">

        {/* ── Section 1: Localized content ────────────────────────────────── */}
        <div className="admin-card admin-news-form-section">
          <p className="admin-news-section-label">Conteúdo — {lang.toUpperCase()}</p>
          <div className="admin-news-form-fields">
            <TextField
              id={`title-${lang}`}
              label={t('fTitle')}
              value={input.title[lang]}
              onChange={(v) => setLocalized('title', lang, v)}
              required
              error={errors.title}
            />
            <TextField
              id={`tag-${lang}`}
              label={t('fTag')}
              value={input.tag[lang]}
              onChange={(v) => setLocalized('tag', lang, v)}
              placeholder={lang === 'pt' ? 'ex: Destaque, Treino, Entrevista' : 'e.g. Featured, Training, Interview'}
            />
            <TextAreaField
              id={`excerpt-${lang}`}
              label={t('fExcerpt')}
              value={input.excerpt[lang]}
              onChange={(v) => setLocalized('excerpt', lang, v)}
              rows={3}
              placeholder={lang === 'pt' ? 'Breve resumo da notícia…' : 'Brief summary of the article…'}
            />
            <TextAreaField
              id={`body-${lang}`}
              label={t('fBody')}
              value={input.body[lang]}
              onChange={(v) => setLocalized('body', lang, v)}
              rows={10}
              placeholder={lang === 'pt' ? 'Corpo completo da notícia…' : 'Full article body…'}
            />
          </div>
        </div>

        {/* ── Section 2: Identity + meta ───────────────────────────────────── */}
        <div className="admin-card admin-news-form-section admin-news-form-section--meta">
          <p className="admin-news-section-label">Metadados</p>
          <div className="admin-news-form-fields">
            <TextField
              id="slug"
              label={t('fSlug')}
              value={input.slug}
              onChange={setSlug}
              required
              error={errors.slug}
              hint="lowercase, hífens"
              placeholder="ex: vitoria-sobre-sport-3-1"
            />
            <TextField
              id="coverImage"
              label={t('fCover')}
              value={input.coverImage}
              onChange={(v) => setScalar('coverImage', v)}
              placeholder="/images/nome-da-foto.jpg"
            />

            <div className="admin-news-form-row">
              <div className="admin-field">
                <label className="admin-label" htmlFor="photoCount">{t('fPhotos')}</label>
                <input
                  id="photoCount"
                  className="admin-input"
                  type="number"
                  min={0}
                  value={input.photoCount}
                  onChange={(e) => setPhotoCount(e.target.value)}
                />
              </div>
              <div className="admin-field">
                <label className="admin-label" htmlFor="publishedAt">{t('fDate')}</label>
                <input
                  id="publishedAt"
                  className="admin-input"
                  type="date"
                  value={input.publishedAt ? input.publishedAt.split('T')[0] : ''}
                  onChange={(e) => setScalar('publishedAt', e.target.value)}
                />
              </div>
            </div>

            {/* Status segmented control */}
            <div className="admin-field">
              <span className="admin-label">{t('fStatus')}</span>
              <div className="admin-news-status-ctrl" role="group" aria-label={t('fStatus')}>
                <button
                  type="button"
                  className={`admin-news-status-opt${input.status === 'draft' ? ' active' : ''}`}
                  onClick={() => setStatus_field('draft')}
                  aria-pressed={input.status === 'draft'}
                >
                  {t('statusDraft')}
                </button>
                <button
                  type="button"
                  className={`admin-news-status-opt${input.status === 'published' ? ' active active--published' : ''}`}
                  onClick={() => setStatus_field('published')}
                  aria-pressed={input.status === 'published'}
                >
                  {t('statusPublished')}
                </button>
                <button
                  type="button"
                  className={`admin-news-status-opt${input.status === 'archived' ? ' active active--archived' : ''}`}
                  onClick={() => setStatus_field('archived')}
                  aria-pressed={input.status === 'archived'}
                >
                  {t('statusArchived')}
                </button>
              </div>
            </div>

            {/* Featured toggle */}
            <div className="admin-field">
              <label className="admin-news-featured-toggle" htmlFor="featured">
                <input
                  id="featured"
                  type="checkbox"
                  className="admin-news-featured-check"
                  checked={input.featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                />
                <span className="admin-news-featured-box" aria-hidden="true">
                  {input.featured ? '★' : '☆'}
                </span>
                <span className="admin-label" style={{ display: 'inline', marginBottom: 0 }}>
                  {t('featured')}
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Status message */}
      {status && (
        <div
          role={status.kind === 'success' ? 'status' : 'alert'}
          className={`ce-status ce-status--${status.kind}`}
        >
          {status.msg}
        </div>
      )}

      {/* Sticky save bar */}
      <div className="ce-save-bar">
        <button
          type="button"
          className="admin-btn admin-btn--primary ce-save-btn"
          onClick={handleSave}
          disabled={isBusy}
          aria-disabled={isBusy}
        >
          {isPending ? t('saving') : t('save')}
        </button>
      </div>
    </div>
  );
}
